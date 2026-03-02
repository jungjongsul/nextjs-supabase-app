import { Suspense } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function AppHeader() {
    return (
        <header className="border-b bg-background">
            <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
                <Link href="/" className="text-lg font-bold">
                    모임
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeSwitcher />
                    <Suspense>
                        <AuthButton />
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
