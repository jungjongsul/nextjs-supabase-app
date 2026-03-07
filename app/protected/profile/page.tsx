import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { getProfile } from "@/lib/actions/profile-actions";

export default async function ProfilePage() {
    const result = await getProfile();

    if ("error" in result) redirect("/auth/login");

    return (
        <div className="mx-auto max-w-lg space-y-4">
            <div>
                <h1 className="text-xl font-bold">프로필 설정</h1>
                <p className="text-muted-foreground text-sm">
                    닉네임과 비밀번호를 변경할 수 있습니다.
                </p>
            </div>
            <ProfileForm initialUsername={result.username} email={result.email} />
        </div>
    );
}
