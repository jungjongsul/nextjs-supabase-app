import { adminLogout } from "@/lib/actions/admin-auth";
import { Button } from "@/components/ui/button";

export default function AdminMainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">모임</span>
                        <span className="rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
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
                <aside className="w-48 shrink-0 border-r bg-muted/40 px-3 py-4">
                    <nav className="flex flex-col gap-1 text-sm">
                        <span className="px-2 py-1 font-medium text-muted-foreground">관리</span>
                        <a href="/admin" className="rounded px-2 py-1.5 hover:bg-accent">
                            대시보드
                        </a>
                        <a href="/admin/users" className="rounded px-2 py-1.5 hover:bg-accent">
                            사용자
                        </a>
                        <a href="/admin/groups" className="rounded px-2 py-1.5 hover:bg-accent">
                            그룹
                        </a>
                        <a href="/admin/events" className="rounded px-2 py-1.5 hover:bg-accent">
                            이벤트
                        </a>
                    </nav>
                </aside>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
