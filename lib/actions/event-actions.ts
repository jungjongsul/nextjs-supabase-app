"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Event, EventParticipant, Profile } from "@/types/index";

export interface EventWithParticipantCount extends Event {
    attendingCount: number;
    myStatus: string | null;
}

export interface ParticipantWithProfile extends EventParticipant {
    profile: Pick<Profile, "email" | "username" | "avatar_url">;
}

export async function createEvent(groupId: string, formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // owner/admin 권한 확인
    const { data: member } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

    if (!member || !["owner", "admin"].includes(member.role)) {
        return { error: "권한이 없습니다." };
    }

    const title = (formData.get("title") as string)?.trim();
    if (!title) return { error: "이벤트 제목을 입력해주세요." };

    const description = (formData.get("description") as string)?.trim() || null;
    const location = (formData.get("location") as string)?.trim() || null;
    const eventDateRaw = (formData.get("event_date") as string)?.trim();
    const eventDate = eventDateRaw ? eventDateRaw : null;
    const maxParticipantsRaw = (formData.get("max_participants") as string)?.trim();
    const maxParticipants =
        maxParticipantsRaw && maxParticipantsRaw !== "" ? parseInt(maxParticipantsRaw, 10) : null;

    const { data: event, error } = await supabase
        .from("events")
        .insert({
            group_id: groupId,
            title,
            description,
            location,
            event_date: eventDate,
            max_participants: maxParticipants,
            status: "open",
            created_by: user.id,
        })
        .select("id")
        .single();

    if (error) return { error: error.message };

    revalidatePath(`/protected/groups/${groupId}`);
    redirect(`/protected/groups/${groupId}/events/${event.id}`);
}

export async function getGroupEvents(
    groupId: string,
): Promise<
    { upcoming: EventWithParticipantCount[]; past: EventWithParticipantCount[] } | { error: string }
> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    // 이벤트 목록 조회
    const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("group_id", groupId)
        .order("event_date", { ascending: true });

    if (eventsError) return { error: eventsError.message };
    if (!events || events.length === 0) return { upcoming: [], past: [] };

    const eventIds = events.map((e) => e.id);

    // 모든 이벤트의 attending 참가자 수를 한 번에 조회
    const { data: allParticipants, error: participantsError } = await supabase
        .from("event_participants")
        .select("event_id, user_id, status")
        .in("event_id", eventIds);

    if (participantsError) return { error: participantsError.message };

    const participants = allParticipants ?? [];

    // attendingCount 맵 구성
    const attendingCountMap: Record<string, number> = {};
    // 내 상태 맵 구성
    const myStatusMap: Record<string, string> = {};

    for (const p of participants) {
        if (p.status === "attending") {
            attendingCountMap[p.event_id] = (attendingCountMap[p.event_id] ?? 0) + 1;
        }
        if (p.user_id === user.id) {
            myStatusMap[p.event_id] = p.status;
        }
    }

    const now = new Date().toISOString();
    const upcoming: EventWithParticipantCount[] = [];
    const past: EventWithParticipantCount[] = [];

    for (const event of events) {
        const enriched: EventWithParticipantCount = {
            ...(event as unknown as Event),
            attendingCount: attendingCountMap[event.id] ?? 0,
            myStatus: myStatusMap[event.id] ?? null,
        };

        // event_date가 null이거나 현재 시각 이후이면 upcoming
        if (!event.event_date || event.event_date >= now) {
            upcoming.push(enriched);
        } else {
            past.push(enriched);
        }
    }

    return { upcoming, past };
}

export async function updateRsvp(
    eventId: string,
    status: "attending" | "declined" | "maybe",
): Promise<{ status: string } | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    // 이벤트 정보 조회 (max_participants, group_id)
    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("max_participants, group_id")
        .eq("id", eventId)
        .single();

    if (eventError || !event) return { error: "이벤트를 찾을 수 없습니다." };

    // 현재 유저의 기존 참가 레코드 조회
    const { data: existing } = await supabase
        .from("event_participants")
        .select("status")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

    const previousStatus = existing?.status ?? null;

    let finalStatus: string = status;
    let waitlistPosition: number | null = null;

    // 인원 초과 여부 확인 (max_participants가 있고 status가 attending인 경우)
    if (status === "attending" && event.max_participants !== null) {
        // 본인이 이미 attending 상태가 아닌 경우에만 인원 수 체크
        if (previousStatus !== "attending") {
            const { count } = await supabase
                .from("event_participants")
                .select("*", { count: "exact", head: true })
                .eq("event_id", eventId)
                .eq("status", "attending");

            const currentAttending = count ?? 0;

            if (currentAttending >= event.max_participants) {
                // 대기자로 전환
                finalStatus = "waitlisted";

                // 현재 최대 대기 순번 조회
                const { data: lastWaitlisted } = await supabase
                    .from("event_participants")
                    .select("waitlist_position")
                    .eq("event_id", eventId)
                    .eq("status", "waitlisted")
                    .order("waitlist_position", { ascending: false })
                    .limit(1)
                    .single();

                waitlistPosition = (lastWaitlisted?.waitlist_position ?? 0) + 1;
            }
        }
    }

    // UPSERT event_participants
    const { error: upsertError } = await supabase.from("event_participants").upsert(
        {
            event_id: eventId,
            user_id: user.id,
            status: finalStatus as "attending" | "declined" | "maybe" | "waitlisted",
            waitlist_position: finalStatus === "waitlisted" ? waitlistPosition : null,
        },
        { onConflict: "event_id,user_id" },
    );

    if (upsertError) return { error: upsertError.message };

    // 기존 상태가 attending이었고 새 상태가 attending이 아닌 경우 → 대기자 자동 승격
    if (previousStatus === "attending" && status !== "attending") {
        await promoteWaitlisted(eventId);
    }

    revalidatePath(`/protected/groups/${event.group_id}/events/${eventId}`);

    return { status: finalStatus };
}

async function promoteWaitlisted(eventId: string): Promise<void> {
    const supabase = await createClient();

    // 대기자 목록 조회 (waitlist_position ASC)
    const { data: waitlisted, error } = await supabase
        .from("event_participants")
        .select("user_id, waitlist_position")
        .eq("event_id", eventId)
        .eq("status", "waitlisted")
        .order("waitlist_position", { ascending: true });

    if (error || !waitlisted || waitlisted.length === 0) return;

    // 1순위 대기자 → attending으로 승격
    const [first, ...rest] = waitlisted;

    await supabase
        .from("event_participants")
        .update({ status: "attending", waitlist_position: null })
        .eq("event_id", eventId)
        .eq("user_id", first.user_id);

    // 나머지 대기자 waitlist_position -1 감소
    for (const w of rest) {
        if (w.waitlist_position !== null) {
            await supabase
                .from("event_participants")
                .update({ waitlist_position: w.waitlist_position - 1 })
                .eq("event_id", eventId)
                .eq("user_id", w.user_id);
        }
    }
}

export async function getEventById(eventId: string): Promise<{ event: Event } | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();

    if (error || !data) return { error: "이벤트를 찾을 수 없습니다." };

    return { event: data as unknown as Event };
}

export async function getEventParticipants(
    eventId: string,
): Promise<ParticipantWithProfile[] | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data, error } = await supabase
        .from("event_participants")
        .select("*, profile:profiles(email, username, avatar_url)")
        .eq("event_id", eventId);

    if (error) return { error: error.message };

    const participants = (data ?? []) as unknown as ParticipantWithProfile[];

    // 정렬: attending → maybe → waitlisted(waitlist_position ASC) → declined
    const statusOrder: Record<string, number> = {
        attending: 0,
        maybe: 1,
        waitlisted: 2,
        declined: 3,
    };

    participants.sort((a, b) => {
        const orderA = statusOrder[a.status] ?? 4;
        const orderB = statusOrder[b.status] ?? 4;

        if (orderA !== orderB) return orderA - orderB;

        // waitlisted 내에서는 waitlist_position ASC 정렬
        if (a.status === "waitlisted" && b.status === "waitlisted") {
            return (a.waitlist_position ?? 0) - (b.waitlist_position ?? 0);
        }

        return 0;
    });

    return participants;
}
