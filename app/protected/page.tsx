import { Suspense } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupCard } from "@/components/groups/group-card";
import { getMyGroups } from "@/lib/actions/group-actions";

async function GroupList() {
    const result = await getMyGroups();
    const groups = "error" in result ? [] : result;

    if (groups.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <Users size={48} className="text-muted-foreground/40" />
                <div>
                    <p className="font-medium">참여한 그룹이 없습니다</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                        그룹을 만들거나 초대 링크로 참가해보세요.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/protected/groups/new">그룹 만들기</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {groups.map((group) => (
                <GroupCard
                    key={group.id}
                    group={group}
                    userRole={group.userRole}
                    memberCount={group.memberCount}
                />
            ))}
        </div>
    );
}

function GroupListSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
        </div>
    );
}

export default function ProtectedPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h1 className="min-w-0 truncate text-lg font-bold">내 그룹</h1>
                <Button asChild size="sm" className="shrink-0">
                    <Link href="/protected/groups/new">+ 그룹 만들기</Link>
                </Button>
            </div>
            <Suspense fallback={<GroupListSkeleton />}>
                <GroupList />
            </Suspense>
        </div>
    );
}
