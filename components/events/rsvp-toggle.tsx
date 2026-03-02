"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { updateRsvp } from "@/lib/actions/event-actions";

interface RsvpToggleProps {
    eventId: string;
    currentStatus: string | null;
}

// RSVP 토글 — 참석/미결정/불참 선택, 낙관적 업데이트 + 롤백 지원
export function RsvpToggle({ eventId, currentStatus }: RsvpToggleProps) {
    const [isPending, startTransition] = useTransition();
    // 낙관적 상태: 서버 응답 전에 UI를 즉시 업데이트
    const [optimisticStatus, setOptimisticStatus] = useState<string | null>(currentStatus);

    function handleChange(value: string) {
        // 빈 값(이미 선택된 항목 재클릭)이거나 현재 상태와 동일하면 무시
        if (!value || value === optimisticStatus) return;

        const newStatus = value as "attending" | "declined" | "maybe";

        // 낙관적 업데이트: 서버 응답 전 UI 먼저 반영
        setOptimisticStatus(newStatus);

        startTransition(async () => {
            const result = await updateRsvp(eventId, newStatus);

            if (result && "error" in result) {
                // 서버 에러 시 이전 상태로 롤백
                toast.error(result.error);
                setOptimisticStatus(currentStatus);
            } else if (result && "status" in result && result.status === "waitlisted") {
                // 인원 초과로 대기자 명단 전환된 경우
                setOptimisticStatus("waitlisted");
                toast.info("인원이 초과되어 대기자 명단에 추가되었습니다.");
            }
        });
    }

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">참석 여부</p>
            <ToggleGroup
                type="single"
                value={optimisticStatus ?? ""}
                onValueChange={handleChange}
                disabled={isPending}
                className="justify-start"
            >
                <ToggleGroupItem value="attending" aria-label="참석">
                    참석
                </ToggleGroupItem>
                <ToggleGroupItem value="maybe" aria-label="미결정">
                    미결정
                </ToggleGroupItem>
                <ToggleGroupItem value="declined" aria-label="불참">
                    불참
                </ToggleGroupItem>
            </ToggleGroup>
            {/* 대기자 명단 안내 문구 */}
            {optimisticStatus === "waitlisted" && (
                <p className="text-xs text-muted-foreground">대기자 명단에 등록되었습니다.</p>
            )}
        </div>
    );
}
