import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { MemberList } from "@/components/groups/member-list";
import { DeleteGroupButton } from "@/components/groups/delete-group-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getGroupById,
    getCurrentUserRole,
    getMembersByGroupId,
    updateGroup,
    regenerateInviteCode,
} from "@/lib/actions/group-actions";
import { createClient } from "@/lib/supabase/server";

interface SettingsPageProps {
    params: Promise<{ groupId: string }>;
}

async function SettingsContent({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = await params;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [groupResult, roleResult, membersResult] = await Promise.all([
        getGroupById(groupId),
        getCurrentUserRole(groupId),
        getMembersByGroupId(groupId),
    ]);

    if ("error" in groupResult) notFound();
    if ("error" in roleResult || !["owner", "admin"].includes(roleResult.role)) {
        redirect(`/protected/groups/${groupId}`);
    }

    const { group } = groupResult;
    const userRole = roleResult.role;
    const members = "error" in membersResult ? [] : membersResult;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-lg font-bold">그룹 설정</h1>
                <p className="mt-1 text-sm text-muted-foreground">{group.name}</p>
            </div>

            {/* 그룹 정보 수정 */}
            <section className="space-y-4">
                <h2 className="font-semibold">기본 정보</h2>
                <form
                    action={async (formData: FormData) => {
                        "use server";
                        await updateGroup(groupId, formData);
                    }}
                    className="space-y-3"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">그룹명</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={group.name}
                            maxLength={50}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">설명</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={group.description ?? ""}
                            rows={3}
                            maxLength={200}
                        />
                    </div>
                    <Button type="submit" size="sm">
                        저장
                    </Button>
                </form>
            </section>

            <Separator />

            {/* 멤버 목록 */}
            <section className="space-y-4">
                <h2 className="font-semibold">멤버 관리</h2>
                <MemberList
                    members={members}
                    currentUserId={user.id}
                    currentUserRole={userRole}
                    groupId={groupId}
                />
            </section>

            <Separator />

            {/* 초대 코드 재생성 */}
            <section className="space-y-3">
                <h2 className="font-semibold">초대 코드</h2>
                <p className="text-sm text-muted-foreground">
                    현재 코드: <code className="font-mono">{group.invite_code}</code>
                </p>
                <form
                    action={async () => {
                        "use server";
                        await regenerateInviteCode(groupId);
                    }}
                >
                    <Button type="submit" variant="outline" size="sm">
                        초대 코드 재생성
                    </Button>
                </form>
            </section>

            {/* 그룹 삭제 (owner만) */}
            {userRole === "owner" && (
                <>
                    <Separator />
                    <section className="space-y-3">
                        <h2 className="font-semibold text-destructive">위험 구역</h2>
                        <DeleteGroupButton groupId={groupId} groupName={group.name} />
                    </section>
                </>
            )}
        </div>
    );
}

function SettingsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
    );
}

export default function GroupSettingsPage({ params }: SettingsPageProps) {
    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <SettingsContent params={params} />
        </Suspense>
    );
}
