"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { createGroup } from "@/lib/actions/group-actions";

const BUCKET = "group-image";
const initialState = { error: "" };

export function GroupCreateForm() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 미리보기
        setPreviewUrl(URL.createObjectURL(file));
        setImageError(null);

        // Storage 업로드
        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { data, error } = await supabase.storage.from(BUCKET).upload(path, file);
        if (error) {
            setImageError("이미지 업로드 실패: " + error.message);
            setUploadedUrl(null);
            return;
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
        setUploadedUrl(urlData.publicUrl);
    };

    const [state, formAction, isPending] = useActionState(
        async (_prev: { error: string }, formData: FormData) => {
            if (uploadedUrl) formData.set("image_url", uploadedUrl);
            const result = await createGroup(formData);
            if (result && "error" in result) return { error: result.error };
            return { error: "" };
        },
        initialState,
    );

    return (
        <form action={formAction} className="space-y-4">
            {/* 그룹 이미지 */}
            <div className="space-y-2">
                <Label>그룹 이미지 (선택)</Label>
                <div
                    className="border-muted-foreground/30 bg-muted/30 hover:border-muted-foreground/60 flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={previewUrl}
                            alt="그룹 이미지 미리보기"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-muted-foreground text-sm">클릭하여 이미지 선택</span>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
                {imageError && <p className="text-destructive text-sm">{imageError}</p>}
            </div>

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
            {state.error && <p className="text-destructive text-sm">{state.error}</p>}
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
