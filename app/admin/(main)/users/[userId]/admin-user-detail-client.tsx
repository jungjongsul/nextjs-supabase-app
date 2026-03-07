"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserByAdmin, deleteUserByAdmin } from "@/lib/actions/admin-actions";
import type { AdminUserDetail } from "@/lib/actions/admin-actions";

interface AdminUserDetailClientProps {
    user: AdminUserDetail;
}

export function AdminUserDetailClient({ user }: AdminUserDetailClientProps) {
    const router = useRouter();
    const [username, setUsername] = useState(user.username ?? "");
    const [usernameMsg, setUsernameMsg] = useState<{ success?: boolean; text: string } | null>(
        null,
    );
    const [isUsernameLoading, setIsUsernameLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUsernameLoading(true);
        setUsernameMsg(null);

        const result = await updateUserByAdmin(user.id, username);
        if ("error" in result) {
            setUsernameMsg({ success: false, text: result.error });
        } else {
            setUsernameMsg({ success: true, text: "닉네임이 변경되었습니다." });
            router.refresh();
        }
        setIsUsernameLoading(false);
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `${user.email ?? user.id} 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
        );
        if (!confirmed) return;

        setIsDeleteLoading(true);
        const result = await deleteUserByAdmin(user.id);
        if ("error" in result) {
            alert(`삭제 실패: ${result.error}`);
            setIsDeleteLoading(false);
        } else {
            router.push("/admin/users");
        }
    };

    return (
        <div className="space-y-4">
            {/* 닉네임 수정 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">닉네임 수정</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUsernameSubmit} className="flex gap-2">
                        <div className="grid flex-1 gap-1.5">
                            <Label htmlFor="admin-username" className="sr-only">
                                닉네임
                            </Label>
                            <Input
                                id="admin-username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="닉네임 입력"
                            />
                        </div>
                        <Button type="submit" disabled={isUsernameLoading}>
                            {isUsernameLoading ? "저장 중..." : "저장"}
                        </Button>
                    </form>
                    {usernameMsg && (
                        <p
                            className={`mt-2 text-sm ${usernameMsg.success ? "text-green-600" : "text-destructive"}`}
                        >
                            {usernameMsg.text}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* 계정 삭제 */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive text-base">계정 삭제</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                    </p>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleteLoading}>
                        {isDeleteLoading ? "삭제 중..." : "계정 삭제"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
