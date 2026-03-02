import { MemberItem } from "@/components/groups/member-item";
import type { MemberWithProfile } from "@/types/index";

interface MemberListProps {
    members: MemberWithProfile[];
    currentUserId: string;
    currentUserRole: string;
    groupId: string;
}

export function MemberList({ members, currentUserId, currentUserRole, groupId }: MemberListProps) {
    return (
        <div className="space-y-1">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
                멤버 {members.length}명
            </p>
            {members.map((member) => (
                <MemberItem
                    key={member.id}
                    member={member}
                    currentUserRole={currentUserRole}
                    groupId={groupId}
                    isCurrentUser={member.user_id === currentUserId}
                />
            ))}
        </div>
    );
}
