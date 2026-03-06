import type { ExpenseWithParticipants } from "@/lib/actions/settle-actions";
import type { Profile } from "@/types/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
    expenses: ExpenseWithParticipants[];
    profiles: Map<string, Pick<Profile, "email" | "username" | "avatar_url">>;
}

function getDisplayName(
    userId: string,
    profiles: Map<string, Pick<Profile, "email" | "username" | "avatar_url">>,
): string {
    const profile = profiles.get(userId);
    if (!profile) return "알 수 없음";
    return profile.username ?? profile.email ?? "알 수 없음";
}

export function ExpenseList({ expenses, profiles }: Props) {
    if (expenses.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-muted-foreground text-sm">등록된 지출이 없습니다.</p>
                <p className="text-muted-foreground mt-1 text-xs">
                    지출 추가 버튼을 눌러 지출을 등록해주세요.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {expenses.map((expense) => (
                <Card key={expense.id} className="py-0">
                    <CardHeader className="px-4 pt-3 pb-1">
                        <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-sm font-medium">{expense.title}</CardTitle>
                            <span className="shrink-0 text-sm font-semibold">
                                {expense.amount.toLocaleString()}원
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                        <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                            <span>지불: {getDisplayName(expense.paid_by, profiles)}</span>
                            <span>·</span>
                            <span>참여 {expense.participants.length}명</span>
                            {expense.participants.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {expense.participants.slice(0, 3).map((userId) => (
                                        <Badge
                                            key={userId}
                                            variant="secondary"
                                            className="h-4 px-1 text-[10px]"
                                        >
                                            {getDisplayName(userId, profiles)}
                                        </Badge>
                                    ))}
                                    {expense.participants.length > 3 && (
                                        <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                                            +{expense.participants.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
