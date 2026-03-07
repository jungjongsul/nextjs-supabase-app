"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(
    username: string,
): Promise<{ success: true } | { error: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const trimmed = username.trim();
    if (!trimmed) return { error: "닉네임을 입력해주세요." };

    const { error } = await supabase
        .from("profiles")
        .update({ username: trimmed, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/protected/profile");
    revalidatePath("/protected");
    return { success: true };
}

export async function getProfile(): Promise<
    { id: string; email: string | null; username: string | null } | { error: string }
> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, username")
        .eq("id", user.id)
        .single();

    if (error) return { error: error.message };
    return data;
}
