"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 하드코딩 어드민 계정 (임시 — Phase Admin 완료 시 DB 기반으로 전환)
const ADMIN_ID = "admin";
const ADMIN_PW = "test12345";

export async function adminLogin(formData: FormData) {
    const id = formData.get("id") as string;
    const pw = formData.get("password") as string;

    if (id !== ADMIN_ID || pw !== ADMIN_PW) {
        return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
    }

    const token = process.env.ADMIN_SESSION_TOKEN;
    if (!token) {
        return { error: "서버 설정 오류입니다. 관리자에게 문의하세요." };
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8, // 8시간
    });

    redirect("/admin");
}

export async function adminLogout() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    redirect("/admin/login");
}
