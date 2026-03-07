import Link from "next/link";
import { getAllUsers } from "@/lib/actions/admin-actions";

export default async function AdminUsersPage() {
    const users = await getAllUsers();

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold">사용자 관리</h2>
                <p className="text-muted-foreground text-sm">전체 사용자 {users.length}명</p>
            </div>
            <div className="rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">이메일</th>
                            <th className="px-4 py-3 text-left font-medium">사용자명</th>
                            <th className="px-4 py-3 text-left font-medium">역할</th>
                            <th className="px-4 py-3 text-left font-medium">가입일</th>
                            <th className="px-4 py-3 text-right font-medium">그룹 수</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/30 border-b last:border-0">
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {user.email ?? "-"}
                                    </Link>
                                </td>
                                <td className="text-muted-foreground px-4 py-3">
                                    {user.username ?? "-"}
                                </td>
                                <td className="px-4 py-3">
                                    {user.is_admin ? (
                                        <span className="bg-destructive text-destructive-foreground rounded px-2 py-0.5 text-xs font-medium">
                                            어드민
                                        </span>
                                    ) : (
                                        <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium">
                                            일반
                                        </span>
                                    )}
                                </td>
                                <td className="text-muted-foreground px-4 py-3">
                                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                                </td>
                                <td className="px-4 py-3 text-right">{user.groupCount}</td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-muted-foreground px-4 py-8 text-center"
                                >
                                    사용자가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
