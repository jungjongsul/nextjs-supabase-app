"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Expense, ExpenseParticipant, Profile, Settlement } from "@/types/index";
import type { ParticipantWithProfile } from "@/lib/actions/event-actions";

export interface ExpenseWithParticipants extends Expense {
    participants: string[]; // user_id 목록
}

export interface EventExpensesResult {
    expenses: ExpenseWithParticipants[];
    expenseParticipants: ExpenseParticipant[];
    attendingParticipants: ParticipantWithProfile[];
}

/**
 * 지출 목록 + 참여자 조회 (Read)
 * - expenses와 expense_participants를 함께 반환
 * - attendingParticipants: 이벤트 참석 확정자 목록 (지출 등록 폼에 활용)
 */
export async function getEventExpenses(
    eventId: string,
): Promise<EventExpensesResult | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    // 병렬 조회
    const [expensesResult, participantsResult] = await Promise.all([
        supabase
            .from("expenses")
            .select("*")
            .eq("event_id", eventId)
            .order("created_at", { ascending: true }),
        supabase
            .from("event_participants")
            .select("*, profile:profiles(email, username, avatar_url)")
            .eq("event_id", eventId)
            .eq("status", "attending"),
    ]);

    if (expensesResult.error) return { error: expensesResult.error.message };
    if (participantsResult.error) return { error: participantsResult.error.message };

    const expenses = (expensesResult.data ?? []) as unknown as Expense[];
    const attendingParticipants = (participantsResult.data ??
        []) as unknown as ParticipantWithProfile[];

    if (expenses.length === 0) {
        return {
            expenses: [],
            expenseParticipants: [],
            attendingParticipants,
        };
    }

    // expense_participants 일괄 조회
    const expenseIds = expenses.map((e) => e.id);
    const { data: epData, error: epError } = await supabase
        .from("expense_participants")
        .select("*")
        .in("expense_id", expenseIds);

    if (epError) return { error: epError.message };

    const expenseParticipants = (epData ?? []) as unknown as ExpenseParticipant[];

    // ExpenseWithParticipants 구성
    const expensesWithParticipants: ExpenseWithParticipants[] = expenses.map((expense) => ({
        ...expense,
        participants: expenseParticipants
            .filter((ep) => ep.expense_id === expense.id)
            .map((ep) => ep.user_id),
    }));

    return {
        expenses: expensesWithParticipants,
        expenseParticipants,
        attendingParticipants,
    };
}

/**
 * 지출 등록 (Write)
 * - title/amount 필수 검증
 * - expenses INSERT 후 expense_participants 다중 INSERT
 * - 완료 후 정산 페이지로 리다이렉트
 */
export async function createExpense(
    eventId: string,
    groupId: string,
    formData: FormData,
): Promise<{ error: string } | never> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const title = (formData.get("title") as string)?.trim();
    if (!title) return { error: "항목명을 입력해주세요." };

    const amountRaw = (formData.get("amount") as string)?.trim();
    if (!amountRaw) return { error: "금액을 입력해주세요." };

    const amount = Math.floor(Number(amountRaw));
    if (isNaN(amount) || amount <= 0) return { error: "유효한 금액을 입력해주세요." };

    const paidBy = (formData.get("paid_by") as string)?.trim();
    if (!paidBy) return { error: "지불자를 선택해주세요." };

    const participantIds = formData.getAll("participants") as string[];
    if (participantIds.length === 0) return { error: "참여자를 1명 이상 선택해주세요." };

    // expenses INSERT
    const { data: expense, error: expenseError } = await supabase
        .from("expenses")
        .insert({
            event_id: eventId,
            paid_by: paidBy,
            title,
            amount,
            created_by: user.id,
        })
        .select("id")
        .single();

    if (expenseError || !expense) {
        return { error: expenseError?.message ?? "지출 등록에 실패했습니다." };
    }

    // expense_participants 다중 INSERT
    const epInserts = participantIds.map((userId) => ({
        expense_id: expense.id,
        user_id: userId,
    }));

    const { error: epError } = await supabase.from("expense_participants").insert(epInserts);

    if (epError) {
        // 이미 삽입된 expense 삭제 (롤백)
        await supabase.from("expenses").delete().eq("id", expense.id);
        return { error: epError.message };
    }

    revalidatePath(`/protected/groups/${groupId}/events/${eventId}/settle`);
    redirect(`/protected/groups/${groupId}/events/${eventId}/settle`);
}

/**
 * 송금 완료 확인 (Write)
 * - 현재 사용자가 to_user_id인지 검증 (RLS에서도 처리)
 * - status = 'confirmed', confirmed_at = now() UPDATE
 */
export async function confirmSettlement(
    settlementId: string,
    groupId: string,
    eventId: string,
): Promise<{ error: string } | { success: true }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    // to_user_id 검증
    const { data: settlement, error: fetchError } = await supabase
        .from("settlements")
        .select("to_user_id, status")
        .eq("id", settlementId)
        .single();

    if (fetchError || !settlement) return { error: "정산 내역을 찾을 수 없습니다." };
    if (settlement.to_user_id !== user.id) return { error: "수취인만 확인할 수 있습니다." };
    if (settlement.status === "confirmed") return { error: "이미 확인된 정산입니다." };

    const { error: updateError } = await supabase
        .from("settlements")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", settlementId);

    if (updateError) return { error: updateError.message };

    revalidatePath(`/protected/groups/${groupId}/events/${eventId}/settle`);
    return { success: true };
}

/**
 * 정산 레코드 생성/저장 (Write)
 * - 기존 settlements(event_id 기준) 삭제 후 재삽입
 * - 클라이언트에서 계산 완료 후 "정산 시작" 시 호출
 */
export async function saveSettlements(
    eventId: string,
    groupId: string,
    transactions: Array<{ fromUserId: string; toUserId: string; amount: number }>,
): Promise<{ error: string } | { success: true }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    if (transactions.length === 0) return { success: true };

    // 기존 settlements 삭제
    const { error: deleteError } = await supabase
        .from("settlements")
        .delete()
        .eq("event_id", eventId);

    if (deleteError) return { error: deleteError.message };

    // 새 settlements INSERT
    const inserts = transactions.map((t) => ({
        event_id: eventId,
        from_user_id: t.fromUserId,
        to_user_id: t.toUserId,
        amount: t.amount,
        status: "pending" as const,
    }));

    const { error: insertError } = await supabase.from("settlements").insert(inserts);

    if (insertError) return { error: insertError.message };

    revalidatePath(`/protected/groups/${groupId}/events/${eventId}/settle`);
    return { success: true };
}

/**
 * 기존 settlements 조회 (Read) - 확인 상태 표시용
 */
export async function getEventSettlements(
    eventId: string,
): Promise<Settlement[] | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data, error } = await supabase.from("settlements").select("*").eq("event_id", eventId);

    if (error) return { error: error.message };

    return (data ?? []) as unknown as Settlement[];
}

/**
 * 이벤트의 프로필 맵 조회 (attending 참여자 + expense paid_by 포함)
 */
export async function getEventProfileMap(
    eventId: string,
): Promise<Map<string, Pick<Profile, "email" | "username" | "avatar_url">> | { error: string }> {
    const supabase = await createClient();

    // 이벤트 참여자 user_id 수집
    const { data: participants, error: pError } = await supabase
        .from("event_participants")
        .select("user_id")
        .eq("event_id", eventId);

    if (pError) return { error: pError.message };

    const userIds = [...new Set((participants ?? []).map((p) => p.user_id))];
    if (userIds.length === 0) return new Map();

    const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, username, avatar_url")
        .in("id", userIds);

    if (profileError) return { error: profileError.message };

    const profileMap = new Map<string, Pick<Profile, "email" | "username" | "avatar_url">>();
    for (const p of profiles ?? []) {
        profileMap.set(p.id, {
            email: p.email ?? "",
            username: p.username,
            avatar_url: p.avatar_url,
        });
    }

    return profileMap;
}
