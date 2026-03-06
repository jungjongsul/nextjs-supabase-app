import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EventHeader } from "@/components/events/event-header";
import { RsvpToggle } from "@/components/events/rsvp-toggle";
import { ParticipantList } from "@/components/events/participant-list";
import { getEventById, getEventParticipants } from "@/lib/actions/event-actions";
import { createClient } from "@/lib/supabase/server";

interface Props {
    params: Promise<{ groupId: string; eventId: string }>;
}

// 이벤트 상세 콘텐츠 — 서버 컴포넌트에서 데이터 페칭 후 렌더링
async function EventContent({ params }: { params: Promise<{ groupId: string; eventId: string }> }) {
    const { groupId, eventId } = await params;

    // 현재 로그인 사용자 조회 (RSVP 상태 확인용)
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 이벤트 정보 + 참가자 목록을 병렬로 조회
    const [eventResult, participantsResult] = await Promise.all([
        getEventById(eventId),
        getEventParticipants(eventId),
    ]);

    // 이벤트 조회 실패 시 404 처리
    if ("error" in eventResult) notFound();

    const { event } = eventResult;
    // 참가자 조회 실패 시 빈 배열로 폴백
    const participants = "error" in participantsResult ? [] : participantsResult;

    // 현재 유저의 RSVP 상태 추출 (비로그인 사용자는 null)
    const myParticipant = user ? participants.find((p) => p.user_id === user.id) : null;
    const myStatus = myParticipant?.status ?? null;

    return (
        <div className="space-y-6">
            {/* 이벤트 헤더: 제목, 상태, 일시/장소/인원, 공지사항 */}
            <EventHeader event={event} />
            <Separator />
            {/* RSVP 토글: 참석/미결정/불참 선택 (클라이언트 컴포넌트) */}
            <RsvpToggle eventId={event.id} currentStatus={myStatus} />
            <Separator />
            {/* 참가자 목록: 상태별 그룹 분류 표시 */}
            <div className="space-y-3">
                <h2 className="text-muted-foreground text-sm font-semibold">참가자</h2>
                <ParticipantList participants={participants} />
            </div>
            {/* 정산 관리 버튼 */}
            <Button asChild variant="outline" className="w-full">
                <Link href={`/protected/groups/${groupId}/events/${eventId}/settle`}>정산하기</Link>
            </Button>
        </div>
    );
}

// 로딩 스켈레톤 — Suspense fallback 전용
function EventPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
}

// 이벤트 상세 페이지 — Suspense로 스트리밍 지원
export default function EventPage({ params }: Props) {
    return (
        <Suspense fallback={<EventPageSkeleton />}>
            <EventContent params={params} />
        </Suspense>
    );
}
