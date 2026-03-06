import { getAdminStats } from "@/lib/actions/admin-actions";

export default async function AdminPage() {
    const stats = await getAdminStats();

    const cards = [
        { label: "전체 사용자", value: stats.userCount },
        { label: "전체 그룹", value: stats.groupCount },
        { label: "전체 이벤트", value: stats.eventCount },
        { label: "전체 정산", value: stats.settlementCount },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">어드민 대시보드</h1>
                <p className="text-muted-foreground text-sm">전체 데이터 조회 및 관리</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {cards.map(({ label, value }) => (
                    <div key={label} className="bg-card rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">{label}</p>
                        <p className="mt-1 text-2xl font-bold">{value.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
