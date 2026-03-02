import { adminLogin } from "@/lib/actions/admin-auth";
import { AdminLoginForm } from "./admin-login-form";

export default function AdminLoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
            <div className="w-full max-w-sm">
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-2">
                        <span className="text-2xl font-bold">모임</span>
                        <span className="rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
                            ADMIN
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">관리자 로그인</p>
                </div>
                <AdminLoginForm action={adminLogin} />
            </div>
        </div>
    );
}
