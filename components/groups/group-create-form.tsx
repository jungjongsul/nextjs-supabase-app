"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGroup } from "@/lib/actions/group-actions";

const initialState = { error: "" };

export function GroupCreateForm() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(
        async (_prev: { error: string }, formData: FormData) => {
            const result = await createGroup(formData);
            if (result && "error" in result) return { error: result.error };
            return { error: "" };
        },
        initialState,
    );

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">
                    그룹명 <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="예: 수영 모임, 헬스 친구들"
                    required
                    maxLength={50}
                    disabled={isPending}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">설명 (선택)</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="그룹에 대한 간단한 설명을 입력해주세요."
                    rows={3}
                    maxLength={200}
                    disabled={isPending}
                />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? "생성 중..." : "그룹 만들기"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isPending}
                >
                    취소
                </Button>
            </div>
        </form>
    );
}
