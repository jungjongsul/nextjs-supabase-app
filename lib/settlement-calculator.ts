// 정산 알고리즘 — 순수 함수 (클라이언트/서버 양쪽에서 사용 가능, ADR-003)

export interface SettlementTransaction {
    fromUserId: string;
    toUserId: string;
    amount: number; // 원 단위 정수
}

/**
 * Step 1: 지출별 개인 부담금 계산
 * - floor(amount / participants.length) 적용
 * - 나머지(amount % participants.length)는 paid_by가 부담
 *
 * @returns Map<expenseId, Map<userId, 부담금>>
 */
export function calculateIndividualShares(
    expenses: Array<{ id: string; paid_by: string; amount: number }>,
    expenseParticipants: Array<{ expense_id: string; user_id: string }>,
): Map<string, Map<string, number>> {
    const result = new Map<string, Map<string, number>>();

    for (const expense of expenses) {
        const participants = expenseParticipants
            .filter((ep) => ep.expense_id === expense.id)
            .map((ep) => ep.user_id);

        if (participants.length === 0) continue;

        const shareMap = new Map<string, number>();
        const baseShare = Math.floor(expense.amount / participants.length);
        const remainder = expense.amount - baseShare * participants.length;

        for (const userId of participants) {
            // 나머지는 paid_by에게 귀속 (paid_by가 참여자인 경우)
            const extra = userId === expense.paid_by ? remainder : 0;
            shareMap.set(userId, baseShare + extra);
        }

        // paid_by가 참여자 목록에 없는 경우: 나머지를 첫 번째 참여자에게 귀속
        if (!participants.includes(expense.paid_by) && participants.length > 0) {
            const firstUserId = participants[0];
            shareMap.set(firstUserId, (shareMap.get(firstUserId) ?? 0) + remainder);
        }

        result.set(expense.id, shareMap);
    }

    return result;
}

/**
 * Step 2: 사용자별 순잔액 계산
 * - netBalance = 총 지불액 - 총 부담액
 * - 양수: 받을 돈, 음수: 보낼 돈
 *
 * @returns Map<userId, netBalance>
 */
export function calculateNetBalances(
    expenses: Array<{ id: string; paid_by: string; amount: number }>,
    shares: Map<string, Map<string, number>>,
): Map<string, number> {
    const balances = new Map<string, number>();

    const addBalance = (userId: string, delta: number) => {
        balances.set(userId, (balances.get(userId) ?? 0) + delta);
    };

    for (const expense of expenses) {
        // 지불자는 amount만큼 잔액 증가 (받을 돈)
        addBalance(expense.paid_by, expense.amount);

        const shareMap = shares.get(expense.id);
        if (!shareMap) continue;

        // 각 참여자는 부담금만큼 잔액 감소 (보낼 돈)
        for (const [userId, share] of shareMap) {
            addBalance(userId, -share);
        }
    }

    return balances;
}

/**
 * Step 3: 탐욕 매칭으로 최소 거래 수 도출
 * - creditors(양수 잔액, 내림차순) vs debtors(음수 잔액, 절댓값 내림차순)
 * - min(creditor.balance, |debtor.balance|)씩 매칭하며 소진
 *
 * @returns 최소화된 송금 거래 목록
 */
export function minimizeTransactions(balances: Map<string, number>): SettlementTransaction[] {
    const transactions: SettlementTransaction[] = [];

    // 잔액이 0이 아닌 사용자만 필터링
    const creditors: Array<{ userId: string; balance: number }> = [];
    const debtors: Array<{ userId: string; balance: number }> = [];

    for (const [userId, balance] of balances) {
        if (balance > 0) creditors.push({ userId, balance });
        else if (balance < 0) debtors.push({ userId, balance });
    }

    // 내림차순 정렬 (큰 금액부터 처리)
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance); // 음수이므로 오름차순 = 절댓값 내림차순

    let ci = 0;
    let di = 0;

    while (ci < creditors.length && di < debtors.length) {
        const creditor = creditors[ci];
        const debtor = debtors[di];

        const transferAmount = Math.min(creditor.balance, Math.abs(debtor.balance));

        if (transferAmount > 0) {
            transactions.push({
                fromUserId: debtor.userId,
                toUserId: creditor.userId,
                amount: transferAmount,
            });
        }

        creditor.balance -= transferAmount;
        debtor.balance += transferAmount;

        if (creditor.balance === 0) ci++;
        if (debtor.balance === 0) di++;
    }

    return transactions;
}
