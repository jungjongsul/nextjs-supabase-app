import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUserRole } from "@/lib/actions/group-actions";
import { EventCreateForm } from "@/components/events/event-create-form";

interface Props {
    params: Promise<{ groupId: string }>;
}

// 권한 확인 후 폼 렌더링 — Suspense 내부에서 동적 데이터 접근
async function NewEventContent({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = await params;

    const roleResult = await getCurrentUserRole(groupId);

    if ("error" in roleResult || !["owner", "admin"].includes(roleResult.role)) {
        redirect(`/protected/groups/${groupId}`);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">이벤트 만들기</h1>
                <p className="text-sm text-muted-foreground">
                    새로운 이벤트를 만들어 그룹원을 초대하세요.
                </p>
            </div>
            <EventCreateForm groupId={groupId} />
        </div>
    );
}

function NewEventSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
}

export default function NewEventPage({ params }: Props) {
    return (
        <Suspense fallback={<NewEventSkeleton />}>
            <NewEventContent params={params} />
        </Suspense>
    );
}
