import { EventCard } from "@/components/events/event-card";
import type { EventWithParticipantCount } from "@/lib/actions/event-actions";

interface EventListProps {
    events: EventWithParticipantCount[];
    groupId: string;
    emptyMessage: string;
}

export function EventList({ events, groupId, emptyMessage }: EventListProps) {
    // 이벤트가 없을 때 빈 상태 메시지 표시
    if (events.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-muted-foreground text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {events.map((event) => (
                <EventCard key={event.id} event={event} groupId={groupId} />
            ))}
        </div>
    );
}
