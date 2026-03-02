import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/types/index";

// 이벤트 상태 레이블 매핑
const STATUS_LABELS: Record<string, string> = {
    draft: "임시저장",
    open: "모집 중",
    closed: "마감",
    cancelled: "취소됨",
};

// 이벤트 상태별 Badge variant 매핑
const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline",
    open: "default",
    closed: "secondary",
    cancelled: "destructive",
};

interface EventHeaderProps {
    event: Event;
}

// 이벤트 상세 헤더 — 제목, 상태 배지, 일시/장소/인원 정보, 공지사항 표시
export function EventHeader({ event }: EventHeaderProps) {
    // 이벤트 날짜 포맷 (한국어 로케일 적용)
    const dateLabel = event.event_date
        ? format(new Date(event.event_date), "yyyy년 M월 d일 (E) HH:mm", { locale: ko })
        : "날짜 미정";

    return (
        <div className="space-y-3">
            {/* 제목 + 상태 배지 */}
            <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <Badge variant={STATUS_VARIANTS[event.status]}>{STATUS_LABELS[event.status]}</Badge>
            </div>

            {/* 메타 정보: 일시, 장소, 최대 인원 */}
            <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    <span>{dateLabel}</span>
                </div>
                {event.location && (
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                    </div>
                )}
                {event.max_participants && (
                    <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        <span>최대 {event.max_participants}명</span>
                    </div>
                )}
            </div>

            {/* 공지사항/설명 */}
            {event.description && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{event.description}</p>
                </div>
            )}
        </div>
    );
}
