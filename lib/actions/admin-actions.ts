"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminStats {
    userCount: number;
    groupCount: number;
    eventCount: number;
    settlementCount: number;
}

export interface AdminUser {
    id: string;
    email: string | null;
    username: string | null;
    created_at: string;
    groupCount: number;
}

export interface AdminGroup {
    id: string;
    name: string;
    memberCount: number;
    eventCount: number;
    created_at: string | null;
}

export interface AdminEvent {
    id: string;
    title: string;
    group_name: string;
    event_date: string | null;
    attendingCount: number;
    status: string;
}

export async function getAdminStats(): Promise<AdminStats> {
    const supabase = createAdminClient();

    const [
        { count: userCount },
        { count: groupCount },
        { count: eventCount },
        { count: settlementCount },
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("groups").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("settlements").select("*", { count: "exact", head: true }),
    ]);

    return {
        userCount: userCount ?? 0,
        groupCount: groupCount ?? 0,
        eventCount: eventCount ?? 0,
        settlementCount: settlementCount ?? 0,
    };
}

export async function getAllUsers(): Promise<AdminUser[]> {
    const supabase = createAdminClient();

    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, username, created_at")
        .order("created_at", { ascending: false });

    if (!profiles) return [];

    // 각 사용자의 그룹 수 조회
    const usersWithGroupCount = await Promise.all(
        profiles.map(async (profile) => {
            const { count } = await supabase
                .from("group_members")
                .select("*", { count: "exact", head: true })
                .eq("user_id", profile.id);

            return {
                id: profile.id,
                email: profile.email,
                username: profile.username,
                created_at: profile.created_at,
                groupCount: count ?? 0,
            };
        }),
    );

    return usersWithGroupCount;
}

export async function getAllGroups(): Promise<AdminGroup[]> {
    const supabase = createAdminClient();

    const { data: groups } = await supabase
        .from("groups")
        .select("id, name, created_at")
        .order("created_at", { ascending: false });

    if (!groups) return [];

    const groupsWithCounts = await Promise.all(
        groups.map(async (group) => {
            const [{ count: memberCount }, { count: eventCount }] = await Promise.all([
                supabase
                    .from("group_members")
                    .select("*", { count: "exact", head: true })
                    .eq("group_id", group.id),
                supabase
                    .from("events")
                    .select("*", { count: "exact", head: true })
                    .eq("group_id", group.id),
            ]);

            return {
                id: group.id,
                name: group.name,
                memberCount: memberCount ?? 0,
                eventCount: eventCount ?? 0,
                created_at: group.created_at,
            };
        }),
    );

    return groupsWithCounts;
}

export async function getAllEvents(): Promise<AdminEvent[]> {
    const supabase = createAdminClient();

    const { data: events } = await supabase
        .from("events")
        .select("id, title, group_id, event_date, status, groups(name)")
        .order("event_date", { ascending: false });

    if (!events) return [];

    const eventsWithCounts = await Promise.all(
        events.map(async (event) => {
            const { count: attendingCount } = await supabase
                .from("event_participants")
                .select("*", { count: "exact", head: true })
                .eq("event_id", event.id)
                .eq("status", "attending");

            const groupName = Array.isArray(event.groups)
                ? (event.groups[0]?.name ?? "알 수 없음")
                : (event.groups?.name ?? "알 수 없음");

            return {
                id: event.id,
                title: event.title,
                group_name: groupName,
                event_date: event.event_date,
                attendingCount: attendingCount ?? 0,
                status: event.status,
            };
        }),
    );

    return eventsWithCounts;
}
