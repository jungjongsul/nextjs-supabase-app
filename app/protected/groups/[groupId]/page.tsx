import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { GroupHeader } from "@/components/groups/group-header";
import { InviteLinkButton } from "@/components/groups/invite-link-button";
import { EventTabs } from "@/components/events/event-tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroupById, getCurrentUserRole, getMembersByGroupId } from "@/lib/actions/group-actions";
import { getGroupEvents } from "@/lib/actions/event-actions";

interface GroupPageProps {
    params: Promise<{ groupId: string }>;
}

async function GroupContent({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = await params;

    const [groupResult, roleResult, membersResult, eventsResult] = await Promise.all([
        getGroupById(groupId),
        getCurrentUserRole(groupId),
        getMembersByGroupId(groupId),
        getGroupEvents(groupId),
    ]);

    if ("error" in groupResult) notFound();
    if ("error" in roleResult) redirect("/protected");

    const { group } = groupResult;
    const userRole = roleResult.role;
    const members = "error" in membersResult ? [] : membersResult;

    // 이벤트 조회 실패 시 빈 배열로 폴백
    const events = "error" in eventsResult ? { upcoming: [], past: [] } : eventsResult;

    // owner 또는 admin만 이벤트 생성 버튼 표시
    const canCreateEvent = ["owner", "admin"].includes(userRole);

    return (
        <div className="space-y-6">
            <GroupHeader group={group} userRole={userRole} memberCount={members.length} />
            <div className="flex items-center gap-2">
                <InviteLinkButton inviteCode={group.invite_code} />
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-muted-foreground">이벤트</h2>
                    {canCreateEvent && (
                        <Button asChild size="sm" variant="outline">
                            <Link href={`/protected/groups/${groupId}/events/new`}>
                                <Plus size={14} className="mr-1" />
                                이벤트 만들기
                            </Link>
                        </Button>
                    )}
                </div>
                <EventTabs upcoming={events.upcoming} past={events.past} groupId={groupId} />
            </div>
        </div>
    );
}

function GroupPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
}

export default function GroupPage({ params }: GroupPageProps) {
    return (
        <Suspense fallback={<GroupPageSkeleton />}>
            <GroupContent params={params} />
        </Suspense>
    );
}
