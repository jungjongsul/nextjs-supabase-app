import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams;
    const hasGroupInvite = next?.includes("/protected/groups/join/");

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">회원가입 완료!</CardTitle>
                            <CardDescription>이메일을 확인해 주세요</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground text-sm">
                                회원가입이 완료되었습니다. 로그인하기 전에 이메일을 확인하여 계정을
                                인증해 주세요.
                            </p>
                            {hasGroupInvite && (
                                <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        초대 대기 중인 그룹이 있습니다
                                    </p>
                                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                                        이메일 인증 후 초대 승인 화면으로 이동합니다.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
