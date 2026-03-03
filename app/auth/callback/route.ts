import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/protected";

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options: _options }) => {
                            request.cookies.set(name, value);
                        });
                    },
                },
            },
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // 세션 교환 성공 후, 설정된 쿠키를 응답에 포함하여 리다이렉트
            const redirectUrl = new URL(next, origin);
            const response = NextResponse.redirect(redirectUrl);

            // request.cookies에 설정된 모든 Supabase 쿠키를 응답에 복사
            request.cookies.getAll().forEach((cookie) => {
                response.cookies.set(cookie.name, cookie.value);
            });

            return response;
        }

        return NextResponse.redirect(
            new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, origin),
        );
    }

    return NextResponse.redirect(new URL("/auth/error?error=No code provided", origin));
}
