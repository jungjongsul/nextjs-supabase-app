// 앱 도메인 타입 정의 (PRD 섹션 6 기반)

export interface Profile {
    id: string;
    email: string;
    username: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Group {
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface GroupMember {
    id: string;
    group_id: string;
    user_id: string;
    role: "owner" | "admin" | "member";
    joined_at: string;
}

export interface Event {
    id: string;
    group_id: string;
    title: string;
    description: string | null;
    location: string | null;
    event_date: string | null;
    max_participants: number | null;
    status: "draft" | "open" | "closed" | "cancelled";
    created_by: string;
    created_at: string;
}

export interface EventParticipant {
    id: string;
    event_id: string;
    user_id: string;
    status: "attending" | "declined" | "maybe" | "waitlisted";
    waitlist_position: number | null;
}

export interface Expense {
    id: string;
    event_id: string;
    paid_by: string;
    title: string;
    amount: number;
    created_by: string;
    created_at: string;
}

export interface ExpenseParticipant {
    id: string;
    expense_id: string;
    user_id: string;
}

export interface Settlement {
    id: string;
    event_id: string;
    from_user_id: string;
    to_user_id: string;
    amount: number;
    status: "pending" | "confirmed";
    confirmed_at: string | null;
}

export interface MemberWithProfile extends GroupMember {
    profile: Pick<Profile, "email" | "username" | "avatar_url">;
}
