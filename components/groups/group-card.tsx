import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Group } from "@/types/index";

const ROLE_LABELS: Record<string, string> = {
    owner: "그룹장",
    admin: "관리자",
    member: "멤버",
};

interface GroupCardProps {
    group: Group;
    userRole: string;
    memberCount: number;
}

export function GroupCard({ group, userRole, memberCount }: GroupCardProps) {
    return (
        <Link href={`/protected/groups/${group.id}`} className="block">
            <Card className="transition-colors hover:bg-accent">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{group.name}</CardTitle>
                        <Badge variant="outline" className="shrink-0 text-xs">
                            {ROLE_LABELS[userRole] ?? userRole}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {group.description && (
                        <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                            {group.description}
                        </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users size={12} />
                        <span>{memberCount}명</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
