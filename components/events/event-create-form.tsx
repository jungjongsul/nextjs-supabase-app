"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createEvent } from "@/lib/actions/event-actions";

interface EventCreateFormProps {
    groupId: string;
}

export function EventCreateForm({ groupId }: EventCreateFormProps) {
    const router = useRouter();
    // 날짜 피커 상태: undefined이면 미선택
    const [date, setDate] = useState<Date | undefined>(undefined);
    // 시간 입력 상태: HH:mm 형식
    const [time, setTime] = useState<string>("");
    // 에러 메시지 상태
    const [error, setError] = useState<string>("");
    // 폼 제출 중 pending 상태
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        // 날짜가 선택된 경우 event_date 합성하여 hidden input에 설정
        if (date) {
            const timeVal = time || "00:00";
            formData.set("event_date", `${format(date, "yyyy-MM-dd")}T${timeVal}:00`);
        }

        setError("");

        startTransition(async () => {
            const result = await createEvent(groupId, formData);
            // createEvent는 성공 시 redirect로 처리되므로 에러만 처리
            if (result && "error" in result) {
                setError(result.error);
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-5">
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

            {/* 일시: 날짜 피커 + 시간 입력 */}
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
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                locale={ko}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    {/* 시간 입력 */}
                    <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-32"
                        disabled={isPending}
                        aria-label="시간 선택"
                    />
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
            {error && <p className="text-sm text-destructive">{error}</p>}

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
