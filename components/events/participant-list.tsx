import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { ParticipantWithProfile } from "@/lib/actions/event-actions";

interface ParticipantListProps {
    participants: ParticipantWithProfile[];
}

// 프로필 정보에서 이니셜 2자 추출 (username 우선, 없으면 email 사용)
function getInitials(profile: ParticipantWithProfile["profile"]): string {
    return (profile.username ?? profile.email).slice(0, 2).toUpperCase();
}

// 상태별 참가자 그룹 렌더링 컴포넌트
function ParticipantGroup({
    title,
    participants,
    showPosition = false,
}: {
    title: string;
    participants: ParticipantWithProfile[];
    showPosition?: boolean;
}) {
    // 해당 상태의 참가자가 없으면 렌더링 생략
    if (participants.length === 0) return null;

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {title} ({participants.length}명)
            </h3>
            <div className="space-y-2">
                {participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                                {getInitials(p.profile)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{p.profile.username ?? p.profile.email}</span>
                        {/* 대기자 순위 표시 */}
                        {showPosition && p.waitlist_position && (
                            <span className="text-xs text-muted-foreground">
                                대기 {p.waitlist_position}순위
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// 참가자 목록 — 참석/대기/미결정/불참 그룹으로 분류하여 표시
export function ParticipantList({ participants }: ParticipantListProps) {
    // 상태별 참가자 분류
    const attending = participants.filter((p) => p.status === "attending");
    const waitlisted = participants.filter((p) => p.status === "waitlisted");
    const maybe = participants.filter((p) => p.status === "maybe");
    const declined = participants.filter((p) => p.status === "declined");

    // 아무도 응답하지 않은 경우 빈 상태 표시
    if (participants.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">아직 응답한 멤버가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ParticipantGroup title="참석" participants={attending} />
            {waitlisted.length > 0 && attending.length > 0 && <Separator />}
            <ParticipantGroup title="대기" participants={waitlisted} showPosition />
            {maybe.length > 0 && (attending.length > 0 || waitlisted.length > 0) && <Separator />}
            <ParticipantGroup title="미결정" participants={maybe} />
            {declined.length > 0 && attending.length + waitlisted.length + maybe.length > 0 && (
                <Separator />
            )}
            <ParticipantGroup title="불참" participants={declined} />
        </div>
    );
}
