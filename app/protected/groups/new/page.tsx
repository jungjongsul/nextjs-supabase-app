import { GroupCreateForm } from "@/components/groups/group-create-form";

export default function NewGroupPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-lg font-bold">그룹 만들기</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    새로운 모임 그룹을 만들어보세요.
                </p>
            </div>
            <GroupCreateForm />
        </div>
    );
}
