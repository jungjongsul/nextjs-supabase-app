import { getAllEvents } from "@/lib/actions/admin-actions";

const STATUS_LABEL: Record<string, string> = {
    open: "모집중",
    closed: "마감",
    cancelled: "취소",
};

export default async function AdminEventsPage() {
    const events = await getAllEvents();

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold">이벤트 관리</h2>
                <p className="text-muted-foreground text-sm">전체 이벤트 {events.length}개</p>
            </div>
            <div className="rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">이벤트명</th>
                            <th className="px-4 py-3 text-left font-medium">그룹</th>
                            <th className="px-4 py-3 text-left font-medium">날짜</th>
                            <th className="px-4 py-3 text-right font-medium">참석자 수</th>
                            <th className="px-4 py-3 text-center font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id} className="hover:bg-muted/30 border-b last:border-0">
                                <td className="px-4 py-3 font-medium">{event.title}</td>
                                <td className="text-muted-foreground px-4 py-3">
                                    {event.group_name}
                                </td>
                                <td className="text-muted-foreground px-4 py-3">
                                    {event.event_date
                                        ? new Date(event.event_date).toLocaleDateString("ko-KR")
                                        : "-"}
                                </td>
                                <td className="px-4 py-3 text-right">{event.attendingCount}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                                        {STATUS_LABEL[event.status] ?? event.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-muted-foreground px-4 py-8 text-center"
                                >
                                    이벤트가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
