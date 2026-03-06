"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function adminLogin(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options),
                    );
                },
            },
        },
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
        return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    // RLS 우회하여 is_admin 확인
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

    if (!profile?.is_admin) {
        await supabase.auth.signOut();
        return { error: "어드민 권한이 없습니다." };
    }

    redirect("/admin");
}

export async function adminLogout() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options),
                    );
                },
            },
        },
    );

    await supabase.auth.signOut();
    redirect("/admin/login");
}
