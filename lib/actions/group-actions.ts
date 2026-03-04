"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Group, GroupMember, Profile } from "@/types/index";

export interface MemberWithProfile extends GroupMember {
    profile: Pick<Profile, "email" | "username" | "avatar_url">;
}

export interface GroupWithDetails extends Group {
    userRole: string;
    memberCount: number;
}

function generateInviteCode(): string {
    return crypto.randomUUID().replace(/-/g, "").substring(0, 12).toUpperCase();
}

export async function createGroup(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const name = (formData.get("name") as string)?.trim();
    if (!name) return { error: "그룹명을 입력해주세요." };

    const description = (formData.get("description") as string)?.trim() || null;

    let groupId: string | null = null;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
        const inviteCode = generateInviteCode();

        const { data: group, error: groupError } = await supabase
            .from("groups")
            .insert({
                name,
                description,
                invite_code: inviteCode,
                created_by: user.id,
            })
            .select("id")
            .single();

        if (groupError) {
            if (groupError.code === "23505") {
                lastError = "초대 코드 중복. 재시도 중...";
                continue;
            }
            return { error: groupError.message };
        }

        const { error: memberError } = await supabase.from("group_members").insert({
            group_id: group.id,
            user_id: user.id,
            role: "owner",
        });

        if (memberError) return { error: memberError.message };

        groupId = group.id;
        break;
    }

    if (!groupId) return { error: lastError ?? "그룹 생성에 실패했습니다." };

    revalidatePath("/protected");
    redirect(`/protected/groups/${groupId}`);
}

export async function getMyGroups(): Promise<GroupWithDetails[] | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    // group_members(count)를 중첩 쿼리로 포함하여 DB 왕복을 2회 → 1회로 줄임
    const { data, error } = await supabase
        .from("group_members")
        .select("role, groups(*, group_members(count))")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });

    if (error) return { error: error.message };

    const groups = data
        .map((item) => {
            const group = item.groups as unknown as
                | (Group & { group_members: Array<{ count: number }> })
                | null;
            if (!group) return null;

            // Supabase 중첩 count 결과는 [{ count: N }] 형태
            const memberCount = group.group_members?.[0]?.count ?? 0;

            const { group_members: _omit, ...groupData } = group;

            return {
                ...groupData,
                userRole: item.role,
                memberCount,
            } satisfies GroupWithDetails;
        })
        .filter((g): g is GroupWithDetails => g !== null);

    return groups;
}

export async function getGroupById(groupId: string): Promise<{ group: Group } | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data, error } = await supabase.from("groups").select("*").eq("id", groupId).single();

    if (error) return { error: error.message };
    if (!data) return { error: "그룹을 찾을 수 없습니다." };

    return { group: data as Group };
}

export async function getCurrentUserRole(
    groupId: string,
): Promise<{ role: string } | { error: string }> {
    const supabase = await createClient();

    // getClaims()는 JWT 쿠키를 읽어 인증 서버 왕복 없이 userId 추출 (빠름)
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (!userId) return { error: "로그인이 필요합니다." };

    const { data, error } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();

    if (error) return { error: error.message };
    if (!data) return { error: "멤버가 아닙니다." };

    return { role: data.role };
}

export async function getMembersByGroupId(
    groupId: string,
): Promise<MemberWithProfile[] | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data, error } = await supabase
        .from("group_members")
        .select("*, profile:profiles(email, username, avatar_url)")
        .eq("group_id", groupId)
        .order("joined_at", { ascending: true });

    if (error) return { error: error.message };

    return (data ?? []) as unknown as MemberWithProfile[];
}

export async function joinGroup(inviteCode: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();

    if (groupError || !group) return { error: "유효하지 않은 초대 코드입니다." };

    const { data: existing } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        redirect(`/protected/groups/${group.id}`);
    }

    const { error: joinError } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: user.id,
        role: "member",
    });

    if (joinError) return { error: joinError.message };

    revalidatePath("/protected");
    redirect(`/protected/groups/${group.id}`);
}

export async function removeMember(
    groupId: string,
    userId: string,
): Promise<{ success: true } | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data: currentMember } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        return { error: "권한이 없습니다." };
    }

    const { data: targetMember } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();

    if (targetMember?.role === "owner") {
        return { error: "그룹장은 추방할 수 없습니다." };
    }

    const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);

    if (error) return { error: error.message };

    revalidatePath(`/protected/groups/${groupId}/settings`);
    return { success: true };
}

export async function regenerateInviteCode(
    groupId: string,
): Promise<{ inviteCode: string } | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data: currentMember } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        return { error: "권한이 없습니다." };
    }

    const newCode = generateInviteCode();

    const { error } = await supabase
        .from("groups")
        .update({ invite_code: newCode, updated_at: new Date().toISOString() })
        .eq("id", groupId);

    if (error) return { error: error.message };

    revalidatePath(`/protected/groups/${groupId}`);
    revalidatePath(`/protected/groups/${groupId}/settings`);
    return { inviteCode: newCode };
}

export async function updateGroup(
    groupId: string,
    formData: FormData,
): Promise<{ success: true } | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data: currentMember } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        return { error: "권한이 없습니다." };
    }

    const name = (formData.get("name") as string)?.trim();
    if (!name) return { error: "그룹명을 입력해주세요." };

    const description = (formData.get("description") as string)?.trim() || null;

    const { error } = await supabase
        .from("groups")
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq("id", groupId);

    if (error) return { error: error.message };

    revalidatePath(`/protected/groups/${groupId}`);
    revalidatePath(`/protected/groups/${groupId}/settings`);
    return { success: true };
}

export async function deleteGroup(groupId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: currentMember } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

    if (!currentMember || currentMember.role !== "owner") {
        return { error: "그룹장만 삭제할 수 있습니다." };
    }

    const { error } = await supabase.from("groups").delete().eq("id", groupId);

    if (error) return { error: error.message };

    revalidatePath("/protected");
    redirect("/protected");
}
