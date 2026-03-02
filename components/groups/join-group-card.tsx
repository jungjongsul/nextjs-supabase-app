import { Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { joinGroup } from "@/lib/actions/group-actions";
import type { Group } from "@/types/index";

interface JoinGroupCardProps {
    group: Group;
    memberCount: number;
}

export function JoinGroupCard({ group, memberCount }: JoinGroupCardProps) {
    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-lg">{group.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {group.description && (
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users size={14} />
                    <span>현재 {memberCount}명이 참여 중</span>
                </div>
            </CardContent>
            <CardFooter>
                <form
                    action={async () => {
                        "use server";
                        await joinGroup(group.invite_code);
                    }}
                    className="w-full"
                >
                    <Button type="submit" className="w-full">
                        참가하기
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
