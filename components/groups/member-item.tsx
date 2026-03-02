"use client";

import { useState } from "react";
import { UserX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { removeMember } from "@/lib/actions/group-actions";
import type { MemberWithProfile } from "@/types/index";

const ROLE_LABELS: Record<string, string> = {
    owner: "그룹장",
    admin: "관리자",
    member: "멤버",
};

const ROLE_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
    owner: "default",
    admin: "secondary",
    member: "outline",
};

interface MemberItemProps {
    member: MemberWithProfile;
    currentUserRole: string;
    groupId: string;
    isCurrentUser: boolean;
}

export function MemberItem({ member, currentUserRole, groupId, isCurrentUser }: MemberItemProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const canRemove =
        ["owner", "admin"].includes(currentUserRole) && member.role !== "owner" && !isCurrentUser;

    const displayName = member.profile.username ?? member.profile.email ?? "알 수 없음";
    const avatarFallback = displayName.charAt(0).toUpperCase();

    async function handleRemove() {
        setIsPending(true);
        await removeMember(groupId, member.user_id);
        setIsPending(false);
        setOpen(false);
    }

    return (
        <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg px-2 py-2">
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profile.avatar_url ?? undefined} alt={displayName} />
                    <AvatarFallback className="text-xs">{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                        {displayName}
                        {isCurrentUser && (
                            <span className="text-muted-foreground ml-1 text-xs">(나)</span>
                        )}
                    </p>
                    {member.profile.username && member.profile.email && (
                        <p className="text-muted-foreground truncate text-xs">
                            {member.profile.email}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={ROLE_BADGE_VARIANTS[member.role] ?? "outline"} className="text-xs">
                    {ROLE_LABELS[member.role] ?? member.role}
                </Badge>
                {canRemove && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive h-7 w-7"
                            >
                                <UserX size={14} />
                                <span className="sr-only">추방</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>멤버 추방</DialogTitle>
                                <DialogDescription>
                                    <strong>{displayName}</strong>을(를) 그룹에서 추방하시겠습니까?
                                    추방된 멤버는 그룹에 다시 초대 링크로 참가할 수 있습니다.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isPending}
                                >
                                    취소
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleRemove}
                                    disabled={isPending}
                                >
                                    {isPending ? "처리 중..." : "추방"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}
