"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminLoginFormProps {
    action: (formData: FormData) => Promise<{ error: string } | void>;
}

export function AdminLoginForm({ action }: AdminLoginFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await action(new FormData(e.currentTarget));
        if (result?.error) {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">로그인</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="id">아이디</Label>
                        <Input id="id" name="id" type="text" required autoComplete="username" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "로그인 중..." : "로그인"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
