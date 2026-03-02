import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-24">{children}</main>
            <Suspense>
                <BottomNav />
            </Suspense>
        </div>
    );
}
