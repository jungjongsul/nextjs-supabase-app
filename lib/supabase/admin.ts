import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// service_role key를 사용하여 RLS를 우회하는 어드민 전용 클라이언트
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error(
            "어드민 클라이언트 초기화 실패: NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.",
        );
    }

    return createClient<Database>(url, serviceRoleKey);
}
