import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserDetail } from "@/lib/actions/admin-actions";
import { AdminUserDetailClient } from "./admin-user-detail-client";

interface UserDetailPageProps {
    params: Promise<{ userId: string }>;
}

export default async function AdminUserDetailPage({ params }: UserDetailPageProps) {
    const { userId } = await params;
    const result = await getUserDetail(userId);

    if ("error" in result) notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Link href="/admin/users" className="text-muted-foreground text-sm hover:underline">
                    사용자 관리
                </Link>
                <span className="text-muted-foreground text-sm">/</span>
                <span className="text-sm font-medium">{result.email ?? result.id}</span>
            </div>

            <div className="space-y-4 rounded-lg border p-6">
                <h2 className="text-lg font-bold">사용자 정보</h2>
                <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground font-medium">이메일</dt>
                    <dd>{result.email ?? "-"}</dd>
                    <dt className="text-muted-foreground font-medium">가입일</dt>
                    <dd>{new Date(result.created_at).toLocaleDateString("ko-KR")}</dd>
                    <dt className="text-muted-foreground font-medium">역할</dt>
                    <dd>
                        {result.is_admin ? (
                            <span className="bg-destructive text-destructive-foreground rounded px-2 py-0.5 text-xs font-medium">
                                어드민
                            </span>
                        ) : (
                            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium">
                                일반
                            </span>
                        )}
                    </dd>
                    <dt className="text-muted-foreground font-medium">그룹</dt>
                    <dd>
                        {result.groups.length === 0 ? (
                            <span className="text-muted-foreground">없음</span>
                        ) : (
                            <ul className="space-y-0.5">
                                {result.groups.map((g) => (
                                    <li key={g.id}>
                                        {g.name}{" "}
                                        <span className="text-muted-foreground text-xs">
                                            ({g.role})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </dd>
                </dl>
            </div>

            <AdminUserDetailClient user={result} />
        </div>
    );
}
