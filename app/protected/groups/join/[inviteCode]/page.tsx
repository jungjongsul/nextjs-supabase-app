import { Suspense } from "react";
import { redirect } from "next/navigation";
import { JoinGroupCard } from "@/components/groups/join-group-card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { getMembersByGroupId } from "@/lib/actions/group-actions";
import type { Group } from "@/types/index";

interface JoinPageProps {
    params: Promise<{ inviteCode: string }>;
}

async function JoinContent({ params }: { params: Promise<{ inviteCode: string }> }) {
    const { inviteCode } = await params;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/auth/login?next=/protected/groups/join/${inviteCode}`);

    const { data: group, error } = await supabase
        .from("groups")
        .select("*")
        .eq("invite_code", inviteCode)
        .single();

    if (error || !group) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <p className="text-lg font-semibold">유효하지 않은 초대 링크입니다</p>
                <p className="text-sm text-muted-foreground">
                    초대 링크가 만료되었거나 잘못된 링크입니다.
                </p>
            </div>
        );
    }

    // 이미 멤버인지 확인
    const { data: existing } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        redirect(`/protected/groups/${group.id}`);
    }

    const membersResult = await getMembersByGroupId(group.id);
    const memberCount = "error" in membersResult ? 0 : membersResult.length;

    return (
        <div className="flex flex-col items-center gap-6 py-8">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">초대를 받으셨나요?</p>
                <h1 className="mt-1 text-lg font-bold">그룹 참가</h1>
            </div>
            <JoinGroupCard group={group as Group} memberCount={memberCount} />
        </div>
    );
}

function JoinSkeleton() {
    return (
        <div className="flex flex-col items-center gap-6 py-8">
            <div className="space-y-2 text-center">
                <Skeleton className="mx-auto h-4 w-32" />
                <Skeleton className="mx-auto h-7 w-24" />
            </div>
            <Skeleton className="h-48 w-full max-w-sm rounded-lg" />
        </div>
    );
}

export default function JoinGroupPage({ params }: JoinPageProps) {
    return (
        <Suspense fallback={<JoinSkeleton />}>
            <JoinContent params={params} />
        </Suspense>
    );
}
