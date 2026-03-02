// TODO: 어드민 인증 구현 예정
export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">어드민 대시보드</h1>
                <p className="text-sm text-muted-foreground">전체 데이터 조회 및 관리</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                    { label: "전체 사용자", value: "-" },
                    { label: "전체 그룹", value: "-" },
                    { label: "전체 이벤트", value: "-" },
                    { label: "전체 정산", value: "-" },
                ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="mt-1 text-2xl font-bold">{value}</p>
                    </div>
                ))}
            </div>
            <div className="rounded-lg border bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                ⚠ 어드민 인증 및 권한 관리는 추후 구현 예정입니다.
            </div>
        </div>
    );
}
