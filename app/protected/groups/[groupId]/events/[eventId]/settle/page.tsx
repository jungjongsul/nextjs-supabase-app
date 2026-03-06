import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExpenseList } from "@/components/settle/expense-list";
import { SettlementResult } from "@/components/settle/settlement-result";
import { getEventById } from "@/lib/actions/event-actions";
import {
    getEventExpenses,
    getEventSettlements,
    getEventProfileMap,
} from "@/lib/actions/settle-actions";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";

interface Props {
    params: Promise<{ groupId: string; eventId: string }>;
}

async function SettleContent({
    params,
}: {
    params: Promise<{ groupId: string; eventId: string }>;
}) {
    const { groupId, eventId } = await params;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 병렬 데이터 조회
    const [eventResult, expensesResult, settlementsResult, profileMapResult] = await Promise.all([
        getEventById(eventId),
        getEventExpenses(eventId),
        getEventSettlements(eventId),
        getEventProfileMap(eventId),
    ]);

    if ("error" in eventResult) notFound();
    if ("error" in expensesResult) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-muted-foreground text-sm">데이터를 불러올 수 없습니다.</p>
            </div>
        );
    }

    const { event } = eventResult;
    const { expenses, expenseParticipants } = expensesResult;
    const settlements = "error" in settlementsResult ? [] : settlementsResult;
    const profiles = "error" in profileMapResult ? new Map() : profileMapResult;

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div>
                <h1 className="text-lg font-bold">{event.title}</h1>
                <p className="text-muted-foreground text-sm">정산 관리</p>
            </div>

            {/* 지출 목록 */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">
                        지출 목록
                        {expenses.length > 0 && (
                            <span className="text-muted-foreground ml-2">
                                총 {totalAmount.toLocaleString()}원
                            </span>
                        )}
                    </h2>
                    <Button asChild size="sm" variant="outline" className="h-7 gap-1 text-xs">
                        <Link href={`/protected/groups/${groupId}/events/${eventId}/settle/new`}>
                            <Plus className="h-3 w-3" />
                            지출 추가
                        </Link>
                    </Button>
                </div>
                <ExpenseList expenses={expenses} profiles={profiles} />
            </section>

            <Separator />

            {/* 정산 결과 */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold">정산 결과</h2>
                <SettlementResult
                    expenses={expenses}
                    expenseParticipants={expenseParticipants}
                    profiles={profiles}
                    existingSettlements={settlements}
                    currentUserId={user?.id ?? ""}
                    groupId={groupId}
                    eventId={eventId}
                />
            </section>
        </div>
    );
}

function SettlePageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
}

export default function SettlePage({ params }: Props) {
    return (
        <Suspense fallback={<SettlePageSkeleton />}>
            <SettleContent params={params} />
        </Suspense>
    );
}
