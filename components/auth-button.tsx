import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
    const supabase = await createClient();

    const { data } = await supabase.auth.getClaims();

    const user = data?.claims;

    if (user) {
        // profiles.username 조회
        const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.sub)
            .single();

        const displayName = profile?.username ?? user.email ?? "";

        return (
            <div className="flex min-w-0 items-center gap-2">
                <Link
                    href="/protected/profile"
                    className="text-muted-foreground hidden max-w-[160px] truncate text-sm hover:underline sm:block"
                >
                    {displayName}
                </Link>
                <LogoutButton />
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <Button asChild size="sm" variant={"outline"}>
                <Link href="/auth/login">로그인</Link>
            </Button>
            <Button asChild size="sm" variant={"default"}>
                <Link href="/auth/sign-up">회원가입</Link>
            </Button>
        </div>
    );
}
