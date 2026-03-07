"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateGroupImage } from "@/lib/actions/group-actions";

const BUCKET = "group-image";

interface GroupImageUploadProps {
    groupId: string;
    currentImageUrl: string | null;
}

export function GroupImageUpload({ groupId, currentImageUrl }: GroupImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ success?: boolean; text: string } | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setMessage(null);
        setPreviewUrl(URL.createObjectURL(file));

        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { data, error } = await supabase.storage.from(BUCKET).upload(path, file);
        if (error) {
            setMessage({ success: false, text: "업로드 실패: " + error.message });
            setPreviewUrl(currentImageUrl);
            setIsLoading(false);
            return;
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
        const result = await updateGroupImage(groupId, urlData.publicUrl);

        if ("error" in result) {
            setMessage({ success: false, text: result.error });
            setPreviewUrl(currentImageUrl);
        } else {
            setPreviewUrl(urlData.publicUrl);
            setMessage({ success: true, text: "이미지가 변경되었습니다." });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-2">
            <Label>그룹 이미지</Label>
            <div
                className="border-muted-foreground/30 bg-muted/30 hover:border-muted-foreground/60 flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
                onClick={() => !isLoading && fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={previewUrl}
                        alt="그룹 이미지"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-muted-foreground text-sm">
                        {isLoading ? "업로드 중..." : "클릭하여 이미지 변경"}
                    </span>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
            />
            {isLoading && <p className="text-muted-foreground text-sm">업로드 중...</p>}
            {message && (
                <p className={`text-sm ${message.success ? "text-green-600" : "text-destructive"}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
