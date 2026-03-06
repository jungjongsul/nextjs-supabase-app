"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { confirmSettlement } from "@/lib/actions/settle-actions";
import type { SettlementTransaction } from "@/lib/settlement-calculator";
import type { Settlement, Profile } from "@/types/index";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface Props {
    transaction: SettlementTransaction;
    settlement: Settlement | null;
    profiles: Map<string, Pick<Profile, "email" | "username" | "avatar_url">>;
    currentUserId: string;
    groupId: string;
    eventId: string;
}

function getDisplayName(
    userId: string,
    profiles: Map<string, Pick<Profile, "email" | "username" | "avatar_url">>,
): string {
    const profile = profiles.get(userId);
    if (!profile) return "알 수 없음";
    return profile.username ?? profile.email ?? "알 수 없음";
}

export function SettlementItem({
    transaction,
    settlement,
    profiles,
    currentUserId,
    groupId,
    eventId,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const isConfirmed = settlement?.status === "confirmed";
    const isRecipient = currentUserId === transaction.toUserId;

    const handleConfirm = () => {
        if (!settlement) return;
        startTransition(async () => {
            const result = await confirmSettlement(settlement.id, groupId, eventId);
            if ("error" in result) {
                toast.error(result.error);
            } else {
                toast.success("송금 확인 완료!");
            }
        });
    };

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                <span className="truncate font-medium">
                    {getDisplayName(transaction.fromUserId, profiles)}
                </span>
                <ArrowRight className="text-muted-foreground h-3 w-3 shrink-0" />
                <span className="truncate font-medium">
                    {getDisplayName(transaction.toUserId, profiles)}
                </span>
                <span className="text-primary shrink-0 font-semibold">
                    {transaction.amount.toLocaleString()}원
                </span>
            </div>

            <div className="shrink-0">
                {isConfirmed ? (
                    <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        확인됨
                    </Badge>
                ) : isRecipient && settlement ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="h-7 text-xs"
                    >
                        {isPending ? "처리 중..." : "받았어요"}
                    </Button>
                ) : (
                    <Badge variant="secondary" className="text-xs">
                        대기 중
                    </Badge>
                )}
            </div>
        </div>
    );
}
