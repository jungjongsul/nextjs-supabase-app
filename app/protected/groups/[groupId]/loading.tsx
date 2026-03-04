import { Skeleton } from "@/components/ui/skeleton";

// 그룹 상세 페이지 로딩 스켈레톤
// Next.js App Router에서 라우트 전환 즉시 표시되는 Suspense fallback
export default function GroupPageLoading() {
    return (
        <div className="space-y-6">
            {/* 그룹 헤더 영역: 이름 + 설명 + 배지 */}
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
            </div>

            {/* 초대 링크 버튼 영역 */}
            <Skeleton className="h-9 w-36" />

            {/* 이벤트 섹션 헤더 */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-8 w-28" />
                </div>

                {/* 이벤트 탭 + 카드 목록 */}
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="space-y-3">
                    <Skeleton className="h-28 w-full rounded-lg" />
                    <Skeleton className="h-28 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}
