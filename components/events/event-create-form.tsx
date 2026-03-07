"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { createEvent } from "@/lib/actions/event-actions";

const BUCKET = "group-image";

interface EventCreateFormProps {
    groupId: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "10", "20", "30", "40", "50"];

export function EventCreateForm({ groupId }: EventCreateFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [hour, setHour] = useState<string>("");
    const [minute, setMinute] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isPending, startTransition] = useTransition();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));
        setImageError(null);

        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { data, error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
        if (uploadError) {
            setImageError("이미지 업로드 실패: " + uploadError.message);
            setUploadedUrl(null);
            return;
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
        setUploadedUrl(urlData.publicUrl);
    };

    async function handleSubmit(formData: FormData) {
        if (date) {
            const h = hour || "00";
            const m = minute || "00";
            formData.set("event_date", `${format(date, "yyyy-MM-dd")}T${h}:${m}:00`);
        }
        if (uploadedUrl) formData.set("image_url", uploadedUrl);

        setError("");

        startTransition(async () => {
            const result = await createEvent(groupId, formData);
            if (result && "error" in result) {
                setError(result.error);
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-5">
            {/* 이벤트 이미지 (선택) */}
            <div className="space-y-2">
                <Label>이미지 (선택)</Label>
                <div
                    className="border-muted-foreground/30 bg-muted/30 hover:border-muted-foreground/60 flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="이벤트 이미지 미리보기"
                            width={400}
                            height={128}
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
                    disabled={isPending}
                />
                {imageError && <p className="text-destructive text-sm">{imageError}</p>}
            </div>

            {/* 이벤트 제목 (필수) */}
            <div className="space-y-2">
                <Label htmlFor="title">
                    제목 <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="예: 5월 수영 모임, 6월 정기 헬스"
                    required
                    maxLength={100}
                    disabled={isPending}
                />
            </div>

            {/* 공지사항 (선택) */}
            <div className="space-y-2">
                <Label htmlFor="description">공지사항</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="이벤트에 대한 공지사항을 입력해주세요."
                    rows={4}
                    maxLength={500}
                    disabled={isPending}
                />
            </div>

            {/* 장소 (선택) */}
            <div className="space-y-2">
                <Label htmlFor="location">장소</Label>
                <Input
                    id="location"
                    name="location"
                    placeholder="예: 올림픽 수영장, 강남 헬스장"
                    maxLength={100}
                    disabled={isPending}
                />
            </div>

            {/* 일시: 날짜 피커 + 시간 선택 */}
            <div className="space-y-2">
                <Label>일시</Label>
                <div className="flex gap-2">
                    {/* shadcn/ui Calendar + Popover 날짜 피커 */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "flex-1 justify-start text-left font-normal",
                                    !date && "text-muted-foreground",
                                )}
                                disabled={isPending}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date
                                    ? format(date, "yyyy년 MM월 dd일 (eee)", { locale: ko })
                                    : "날짜 선택"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="z-[100] w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                locale={ko}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    {/* 시간 선택 (시/분 Select) */}
                    <div className="flex items-center gap-1">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <Select value={hour} onValueChange={setHour} disabled={isPending}>
                            <SelectTrigger className="w-[70px]" aria-label="시 선택">
                                <SelectValue placeholder="시" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[100] max-h-60">
                                {HOURS.map((h) => (
                                    <SelectItem key={h} value={h}>
                                        {h}시
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">:</span>
                        <Select value={minute} onValueChange={setMinute} disabled={isPending}>
                            <SelectTrigger className="w-[70px]" aria-label="분 선택">
                                <SelectValue placeholder="분" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[100] max-h-60">
                                {MINUTES.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}분
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* 인원 제한 (선택) */}
            <div className="space-y-2">
                <Label htmlFor="max_participants">인원 제한</Label>
                <Input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    min={1}
                    placeholder="제한 없음"
                    disabled={isPending}
                />
            </div>

            {/* 에러 메시지 */}
            {error && <p className="text-destructive text-sm">{error}</p>}

            {/* 액션 버튼 */}
            <div className="flex gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isPending}
                >
                    취소
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? "생성 중..." : "이벤트 만들기"}
                </Button>
            </div>
        </form>
    );
}
