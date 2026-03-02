import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { GroupHeader } from "@/components/groups/group-header";
import { InviteLinkButton } from "@/components/groups/invite-link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroupById, getCurrentUserRole, getMembersByGroupId } from "@/lib/actions/group-actions";

interface GroupPageProps {
    params: Promise<{ groupId: string }>;
}

async function GroupContent({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = await params;

    const [groupResult, roleResult, membersResult] = await Promise.all([
        getGroupById(groupId),
        getCurrentUserRole(groupId),
        getMembersByGroupId(groupId),
    ]);

    if ("error" in groupResult) notFound();
    if ("error" in roleResult) redirect("/protected");

    const { group } = groupResult;
    const userRole = roleResult.role;
    const members = "error" in membersResult ? [] : membersResult;

    return (
        <div className="space-y-6">
            <GroupHeader group={group} userRole={userRole} memberCount={members.length} />
            <div className="flex items-center gap-2">
                <InviteLinkButton inviteCode={group.invite_code} />
            </div>
            <div className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground">이벤트</h2>
                <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        이벤트 기능은 Phase 2에서 구현됩니다.
                    </p>
                </div>
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
