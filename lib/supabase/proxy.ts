import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    // If the env vars are not set, skip proxy check. You can remove this
    // once you setup the project.
    if (!hasEnvVars) {
        return supabaseResponse;
    }

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // Do not run code between createServerClient and
    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getClaims() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    // 어드민 경로는 별도 인증 처리 (Supabase auth 우회)
    if (request.nextUrl.pathname.startsWith("/admin")) {
        const isLoginPage = request.nextUrl.pathname === "/admin/login";
        const adminToken = request.cookies.get("admin_token")?.value;
        const isAuthenticated = adminToken === process.env.ADMIN_SESSION_TOKEN;

        if (!isAuthenticated && !isLoginPage) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin/login";
            return NextResponse.redirect(url);
        }

        if (isAuthenticated && isLoginPage) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin";
            return NextResponse.redirect(url);
        }

        return supabaseResponse;
    }

    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    // 로그인된 사용자가 루트(/) 또는 로그인/회원가입 페이지 접근 시 /protected로 리다이렉트
    if (
        user &&
        (request.nextUrl.pathname === "/" ||
            request.nextUrl.pathname === "/auth/login" ||
            request.nextUrl.pathname === "/auth/sign-up")
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/protected";
        return NextResponse.redirect(url);
    }

    if (
        request.nextUrl.pathname !== "/" &&
        !user &&
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/auth")
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone();
        const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
        url.pathname = "/auth/login";
        url.searchParams.set("next", redirectTo);
        return NextResponse.redirect(url);
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
}
