import Link from "next/link";
import Image from "next/image";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Group } from "@/types/index";

const ROLE_LABELS: Record<string, string> = {
    owner: "그룹장",
    admin: "관리자",
    member: "멤버",
};

interface GroupHeaderProps {
    group: Group;
    userRole: string;
    memberCount: number;
}

export function GroupHeader({ group, userRole, memberCount }: GroupHeaderProps) {
    const canManage = ["owner", "admin"].includes(userRole);

    return (
        <div className="space-y-3">
            {/* 배너 이미지 */}
            {group.image_url && (
                <div className="h-36 w-full overflow-hidden rounded-lg">
                    <Image
                        src={group.image_url}
                        alt={group.name}
                        width={800}
                        height={144}
                        className="h-full w-full object-cover"
                    />
                </div>
            )}
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-xl font-bold">{group.name}</h1>
                        {group.description && (
                            <p className="text-muted-foreground mt-1 text-sm">
                                {group.description}
                            </p>
                        )}
                    </div>
                    {canManage && (
                        <Button variant="ghost" size="icon" asChild className="shrink-0">
                            <Link href={`/protected/groups/${group.id}/settings`}>
                                <Settings size={18} />
                                <span className="sr-only">그룹 설정</span>
                            </Link>
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{memberCount}명</Badge>
                    <Badge variant="outline">{ROLE_LABELS[userRole] ?? userRole}</Badge>
                </div>
            </div>
        </div>
    );
}
