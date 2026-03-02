import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EventWithParticipantCount } from "@/lib/actions/event-actions";

// RSVP 상태별 배지 설정
const STATUS_CONFIG = {
    attending: { label: "참석", variant: "default" }, // 초록 계열
    declined: { label: "불참", variant: "destructive" }, // 빨간
    maybe: { label: "미결정", variant: "secondary" }, // 노란/회색
    waitlisted: { label: "대기", variant: "outline" }, // 회색 테두리
};

interface EventCardProps {
    event: EventWithParticipantCount;
    groupId: string;
}

export function EventCard({ event, groupId }: EventCardProps) {
    // event_date 포맷: "2026년 3월 5일 19:00" / null이면 "날짜 미정"
    const dateLabel = event.event_date
        ? format(new Date(event.event_date), "yyyy년 M월 d일 HH:mm", { locale: ko })
        : "날짜 미정";

    // 참석 인원 표시: max_participants 있으면 "n/max명", 없으면 "n명"
    const attendingLabel = event.max_participants
        ? `${event.attendingCount}/${event.max_participants}명`
        : `${event.attendingCount}명`;

    const statusConfig = event.myStatus
        ? STATUS_CONFIG[event.myStatus as keyof typeof STATUS_CONFIG]
        : null;

    return (
        <Link href={`/protected/groups/${groupId}/events/${event.id}`} className="block">
            <Card className="transition-colors hover:bg-accent">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{event.title}</CardTitle>
                        {statusConfig && (
                            <Badge
                                variant={
                                    statusConfig.variant as
                                        | "default"
                                        | "destructive"
                                        | "secondary"
                                        | "outline"
                                }
                                className="shrink-0 text-xs"
                            >
                                {statusConfig.label}
                            </Badge>
                        )}
                        {!statusConfig && (
                            <Badge
                                variant="outline"
                                className="shrink-0 text-xs text-muted-foreground"
                            >
                                미응답
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays size={12} />
                        <span>{dateLabel}</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            <span>{event.location}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users size={12} />
                        <span>참석 {attendingLabel}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
