import { getAllGroups } from "@/lib/actions/admin-actions";

export default async function AdminGroupsPage() {
    const groups = await getAllGroups();

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold">그룹 관리</h2>
                <p className="text-muted-foreground text-sm">전체 그룹 {groups.length}개</p>
            </div>
            <div className="rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">그룹명</th>
                            <th className="px-4 py-3 text-right font-medium">멤버 수</th>
                            <th className="px-4 py-3 text-right font-medium">이벤트 수</th>
                            <th className="px-4 py-3 text-left font-medium">생성일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group) => (
                            <tr key={group.id} className="hover:bg-muted/30 border-b last:border-0">
                                <td className="px-4 py-3 font-medium">{group.name}</td>
                                <td className="px-4 py-3 text-right">{group.memberCount}</td>
                                <td className="px-4 py-3 text-right">{group.eventCount}</td>
                                <td className="text-muted-foreground px-4 py-3">
                                    {group.created_at
                                        ? new Date(group.created_at).toLocaleDateString("ko-KR")
                                        : "-"}
                                </td>
                            </tr>
                        ))}
                        {groups.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-muted-foreground px-4 py-8 text-center"
                                >
                                    그룹이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
