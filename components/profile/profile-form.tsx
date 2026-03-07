"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions/profile-actions";

interface ProfileFormProps {
    initialUsername: string | null;
    email: string | null;
}

export function ProfileForm({ initialUsername, email }: ProfileFormProps) {
    const [username, setUsername] = useState(initialUsername ?? "");
    const [usernameMsg, setUsernameMsg] = useState<{ success?: boolean; text: string } | null>(
        null,
    );
    const [isUsernameLoading, setIsUsernameLoading] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState<{ success?: boolean; text: string } | null>(
        null,
    );
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUsernameLoading(true);
        setUsernameMsg(null);

        const result = await updateProfile(username);
        if ("error" in result) {
            setUsernameMsg({ success: false, text: result.error });
        } else {
            setUsernameMsg({ success: true, text: "닉네임이 변경되었습니다." });
        }
        setIsUsernameLoading(false);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        setPasswordMsg(null);

        if (newPassword !== confirmPassword) {
            setPasswordMsg({ success: false, text: "새 비밀번호가 일치하지 않습니다." });
            setIsPasswordLoading(false);
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMsg({ success: false, text: "비밀번호는 6자 이상이어야 합니다." });
            setIsPasswordLoading(false);
            return;
        }

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setPasswordMsg({ success: true, text: "비밀번호가 변경되었습니다." });
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            setPasswordMsg({
                success: false,
                text: err instanceof Error ? err.message : "오류가 발생했습니다.",
            });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 닉네임 변경 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">닉네임 변경</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUsernameSubmit} className="space-y-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="email-display">이메일</Label>
                            <Input id="email-display" value={email ?? ""} disabled />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="username">닉네임</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="닉네임을 입력하세요"
                            />
                        </div>
                        {usernameMsg && (
                            <p
                                className={`text-sm ${usernameMsg.success ? "text-green-600" : "text-destructive"}`}
                            >
                                {usernameMsg.text}
                            </p>
                        )}
                        <Button type="submit" disabled={isUsernameLoading}>
                            {isUsernameLoading ? "저장 중..." : "저장"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* 비밀번호 변경 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">비밀번호 변경</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="new-password">새 비밀번호</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="6자 이상"
                                required
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        {passwordMsg && (
                            <p
                                className={`text-sm ${passwordMsg.success ? "text-green-600" : "text-destructive"}`}
                            >
                                {passwordMsg.text}
                            </p>
                        )}
                        <Button type="submit" disabled={isPasswordLoading}>
                            {isPasswordLoading ? "변경 중..." : "비밀번호 변경"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
