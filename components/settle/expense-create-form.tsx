"use client";

import { useRef, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createExpense } from "@/lib/actions/settle-actions";
import type { ParticipantWithProfile } from "@/lib/actions/event-actions";

interface Props {
    eventId: string;
    groupId: string;
    attendingParticipants: ParticipantWithProfile[];
}

function getDisplayName(participant: ParticipantWithProfile): string {
    return participant.profile.username ?? participant.profile.email ?? "알 수 없음";
}

export function ExpenseCreateForm({ eventId, groupId, attendingParticipants }: Props) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();
    const [paidBy, setPaidBy] = useState<string>(attendingParticipants[0]?.user_id ?? "");
    const [checkedParticipants, setCheckedParticipants] = useState<Set<string>>(
        new Set(attendingParticipants.map((p) => p.user_id)),
    );

    const toggleParticipant = (userId: string, checked: boolean) => {
        setCheckedParticipants((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(userId);
            } else {
                next.delete(userId);
            }
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = formRef.current;
        if (!form) return;

        const formData = new FormData(form);
        // paid_by와 participants를 수동으로 추가 (state 값 사용)
        formData.set("paid_by", paidBy);
        formData.delete("participants");
        for (const userId of checkedParticipants) {
            formData.append("participants", userId);
        }

        startTransition(async () => {
            const result = await createExpense(eventId, groupId, formData);
            if (result && "error" in result) {
                toast.error(result.error);
            }
            // 성공 시 createExpense 내부에서 redirect 처리
        });
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* 항목명 */}
            <div className="space-y-1.5">
                <Label htmlFor="title">항목명 *</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="예: 저녁 식사"
                    required
                    disabled={isPending}
                />
            </div>

            {/* 금액 */}
            <div className="space-y-1.5">
                <Label htmlFor="amount">금액 (원) *</Label>
                <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="1"
                    min="1"
                    placeholder="예: 50000"
                    required
                    disabled={isPending}
                />
            </div>

            {/* 지불자 */}
            <div className="space-y-1.5">
                <Label>지불자 *</Label>
                <Select value={paidBy} onValueChange={setPaidBy} disabled={isPending}>
                    <SelectTrigger>
                        <SelectValue placeholder="지불자 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        {attendingParticipants.map((p) => (
                            <SelectItem key={p.user_id} value={p.user_id}>
                                {getDisplayName(p)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 참여자 */}
            <div className="space-y-2">
                <Label>참여자 *</Label>
                <div className="space-y-2 rounded-lg border p-3">
                    {attendingParticipants.length === 0 ? (
                        <p className="text-muted-foreground text-sm">참석자가 없습니다.</p>
                    ) : (
                        attendingParticipants.map((p) => (
                            <div key={p.user_id} className="flex items-center gap-2">
                                <Checkbox
                                    id={`participant-${p.user_id}`}
                                    checked={checkedParticipants.has(p.user_id)}
                                    onCheckedChange={(checked) =>
                                        toggleParticipant(p.user_id, checked === true)
                                    }
                                    disabled={isPending}
                                />
                                <Label
                                    htmlFor={`participant-${p.user_id}`}
                                    className="cursor-pointer font-normal"
                                >
                                    {getDisplayName(p)}
                                </Label>
                            </div>
                        ))
                    )}
                </div>
                {checkedParticipants.size > 0 && (
                    <p className="text-muted-foreground text-xs">
                        선택된 참여자 {checkedParticipants.size}명 · 1인당{" "}
                        {/* 금액 미리보기는 form 상태와 연동이 복잡하므로 생략 */}
                        균등 분담
                    </p>
                )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                    disabled={isPending}
                >
                    취소
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                    {isPending ? "등록 중..." : "지출 등록"}
                </Button>
            </div>
        </form>
    );
}
