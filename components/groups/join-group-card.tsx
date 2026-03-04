import Link from "next/link";
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
                    <p className="text-muted-foreground text-sm">{group.description}</p>
                )}
                <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                    <Users size={14} />
                    <span>현재 {memberCount}명이 참여 중</span>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                    <Link href="/protected">거절하기</Link>
                </Button>
                <form
                    action={async () => {
                        "use server";
                        await joinGroup(group.invite_code);
                    }}
                    className="flex-1"
                >
                    <Button type="submit" className="w-full">
                        참가하기
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
