"use client";

import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettlementItem } from "@/components/settle/settlement-item";
import { saveSettlements } from "@/lib/actions/settle-actions";
import {
    calculateIndividualShares,
    calculateNetBalances,
    minimizeTransactions,
} from "@/lib/settlement-calculator";
import type { ExpenseWithParticipants } from "@/lib/actions/settle-actions";
import type { ExpenseParticipant, Settlement, Profile } from "@/types/index";

interface Props {
    expenses: ExpenseWithParticipants[];
    expenseParticipants: ExpenseParticipant[];
    profiles: Map<string, Pick<Profile, "email" | "username" | "avatar_url">>;
    existingSettlements: Settlement[];
    currentUserId: string;
    groupId: string;
    eventId: string;
}

export function SettlementResult({
    expenses,
    expenseParticipants,
    profiles,
    existingSettlements,
    currentUserId,
    groupId,
    eventId,
}: Props) {
    const [isPending, startTransition] = useTransition();

    // 3단계 알고리즘 실행 (useMemo로 메모이제이션)
    const transactions = useMemo(() => {
        if (expenses.length === 0) return [];
        const shares = calculateIndividualShares(expenses, expenseParticipants);
        const balances = calculateNetBalances(expenses, shares);
        return minimizeTransactions(balances);
    }, [expenses, expenseParticipants]);

    // 기존 settlements 매핑 (fromUserId+toUserId → Settlement)
    const settlementMap = useMemo(() => {
        const map = new Map<string, Settlement>();
        for (const s of existingSettlements) {
            map.set(`${s.from_user_id}:${s.to_user_id}`, s);
        }
        return map;
    }, [existingSettlements]);

    const hasSavedSettlements = existingSettlements.length > 0;

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveSettlements(
                eventId,
                groupId,
                transactions.map((t) => ({
                    fromUserId: t.fromUserId,
                    toUserId: t.toUserId,
                    amount: t.amount,
                })),
            );
            if ("error" in result) {
                toast.error(result.error);
            } else {
                toast.success("정산이 시작되었습니다!");
            }
        });
    };

    if (expenses.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-muted-foreground text-sm">
                    지출을 등록하면 정산 결과가 여기에 표시됩니다.
                </p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="rounded-lg border p-4 text-center">
                <p className="text-sm font-medium">정산 완료!</p>
                <p className="text-muted-foreground mt-1 text-xs">
                    모든 지출이 균등하게 분담되었습니다.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {transactions.map((transaction, idx) => {
                    const key = `${transaction.fromUserId}:${transaction.toUserId}`;
                    const settlement = settlementMap.get(key) ?? null;
                    return (
                        <SettlementItem
                            key={idx}
                            transaction={transaction}
                            settlement={settlement}
                            profiles={profiles}
                            currentUserId={currentUserId}
                            groupId={groupId}
                            eventId={eventId}
                        />
                    );
                })}
            </div>

            {!hasSavedSettlements && (
                <Button className="w-full" onClick={handleSave} disabled={isPending}>
                    {isPending ? "처리 중..." : "정산 시작하기"}
                </Button>
            )}
        </div>
    );
}
