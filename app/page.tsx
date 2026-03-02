import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, Calculator } from "lucide-react";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* 헤더 */}
            <header className="border-b">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                    <span className="text-xl font-bold">모임</span>
                    <div className="flex gap-2">
                        <Button variant="ghost" asChild>
                            <Link href="/auth/login">로그인</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/auth/sign-up">회원가입</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* 히어로 섹션 */}
            <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">모임 이벤트 관리</h1>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                    공지, RSVP, 정산을 하나의 앱에서. 카카오톡 채팅방의 혼란에서 벗어나세요.
                </p>
                <div className="mt-8 flex gap-3">
                    <Button size="lg" asChild>
                        <Link href="/auth/sign-up">시작하기</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/auth/login">로그인</Link>
                    </Button>
                </div>
            </section>

            {/* 기능 소개 */}
            <section className="border-t bg-muted/40 px-4 py-16">
                <div className="mx-auto max-w-5xl">
                    <h2 className="mb-10 text-center text-2xl font-semibold">주요 기능</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <Users className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>그룹 관리</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    초대 링크로 멤버를 모으고, 역할별로 권한을 나눠 모임을
                                    체계적으로 관리하세요.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CalendarCheck className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>RSVP 관리</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    이벤트를 만들고 참석 여부를 확인하세요. 인원 초과 시 대기자 자동
                                    승격까지 지원합니다.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Calculator className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>정산 자동화</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    지출을 등록하면 최소 거래 수로 정산 결과를 자동 계산해 드립니다.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* 푸터 */}
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                © 2026 모임. All rights reserved.
            </footer>
        </div>
    );
}
