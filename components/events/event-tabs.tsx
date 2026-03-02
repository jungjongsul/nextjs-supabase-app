"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventList } from "@/components/events/event-list";
import type { EventWithParticipantCount } from "@/lib/actions/event-actions";

interface EventTabsProps {
    upcoming: EventWithParticipantCount[];
    past: EventWithParticipantCount[];
    groupId: string;
}

// 예정/지난 이벤트를 탭으로 구분해 표시하는 클라이언트 컴포넌트
// shadcn/ui Tabs는 Radix UI 기반으로 클라이언트 상태가 필요하므로 분리
export function EventTabs({ upcoming, past, groupId }: EventTabsProps) {
    return (
        <Tabs defaultValue="upcoming">
            <TabsList className="w-full rounded-lg bg-muted p-1">
                <TabsTrigger
                    value="upcoming"
                    className="flex-1 rounded-md data-[state=active]:bg-primary data-[state=active]:font-semibold data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                    예정 {upcoming.length > 0 && `(${upcoming.length})`}
                </TabsTrigger>
                <TabsTrigger
                    value="past"
                    className="flex-1 rounded-md data-[state=active]:bg-primary data-[state=active]:font-semibold data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                    지난 {past.length > 0 && `(${past.length})`}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-4">
                <EventList
                    events={upcoming}
                    groupId={groupId}
                    emptyMessage="예정된 이벤트가 없습니다."
                />
            </TabsContent>
            <TabsContent value="past" className="mt-4">
                <EventList events={past} groupId={groupId} emptyMessage="지난 이벤트가 없습니다." />
            </TabsContent>
        </Tabs>
    );
}
