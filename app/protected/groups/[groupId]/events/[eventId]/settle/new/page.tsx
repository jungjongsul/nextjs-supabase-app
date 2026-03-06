import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseCreateForm } from "@/components/settle/expense-create-form";
import { getEventExpenses } from "@/lib/actions/settle-actions";
import { createClient } from "@/lib/supabase/server";

interface Props {
    params: Promise<{ groupId: string; eventId: string }>;
}

async function NewExpenseContent({
    params,
}: {
    params: Promise<{ groupId: string; eventId: string }>;
}) {
    const { groupId, eventId } = await params;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // 현재 유저의 그룹 역할 확인
    const { data: member } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

    if (!member) {
        redirect(`/protected/groups/${groupId}/events/${eventId}/settle`);
    }

    // 이벤트 참석자 목록 조회
    const expensesResult = await getEventExpenses(eventId);

    if ("error" in expensesResult) {
        redirect(`/protected/groups/${groupId}/events/${eventId}/settle`);
    }

    const { attendingParticipants } = expensesResult;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-lg font-bold">지출 등록</h1>
                <p className="text-muted-foreground text-sm">지출 항목을 추가합니다.</p>
            </div>
            <ExpenseCreateForm
                eventId={eventId}
                groupId={groupId}
                attendingParticipants={attendingParticipants}
            />
        </div>
    );
}

function NewExpensePageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
}

export default function NewExpensePage({ params }: Props) {
    return (
        <Suspense fallback={<NewExpensePageSkeleton />}>
            <NewExpenseContent params={params} />
        </Suspense>
    );
}
