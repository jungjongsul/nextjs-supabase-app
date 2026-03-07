import Link from "next/link";
import { adminLogout } from "@/lib/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";

// 쿠키를 읽어 동적 렌더링 강제 (Supabase 세션 기반 어드민 인증)
export default async function AdminMainLayout({ children }: { children: React.ReactNode }) {
    // proxy.ts에서 Supabase 세션 + profiles.is_admin으로 인증 처리
    await cookies();
    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-background border-b">
                <div className="mx-auto flex max-w-(--breakpoint-xl) items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">모임</span>
                        <span className="bg-destructive text-destructive-foreground rounded px-2 py-0.5 text-xs font-medium">
                            ADMIN
                        </span>
                    </div>
                    <form action={adminLogout}>
                        <Button variant="ghost" size="sm" type="submit">
                            로그아웃
                        </Button>
                    </form>
                </div>
            </header>
            <div className="flex flex-1">
                <aside className="bg-muted/40 w-48 shrink-0 border-r px-3 py-4">
                    <nav className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground px-2 py-1 font-medium">관리</span>
                        <Link href="/admin" className="hover:bg-accent rounded px-2 py-1.5">
                            대시보드
                        </Link>
                        <Link href="/admin/users" className="hover:bg-accent rounded px-2 py-1.5">
                            사용자
                        </Link>
                        <Link href="/admin/groups" className="hover:bg-accent rounded px-2 py-1.5">
                            그룹
                        </Link>
                        <Link href="/admin/events" className="hover:bg-accent rounded px-2 py-1.5">
                            이벤트
                        </Link>
                    </nav>
                </aside>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
