import Link from "next/link";
import Image from "next/image";
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
            <Card className="hover:bg-accent overflow-hidden transition-colors">
                {/* 이미지 영역 */}
                <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                    {group.image_url ? (
                        <Image
                            src={group.image_url}
                            alt={group.name}
                            width={400}
                            height={112}
                            className="h-full w-full object-cover"
                        />
                    ) : null}
                </div>
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
                        <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                            {group.description}
                        </p>
                    )}
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Users size={12} />
                        <span>{memberCount}명</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
