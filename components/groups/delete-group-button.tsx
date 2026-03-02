"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { deleteGroup } from "@/lib/actions/group-actions";

interface DeleteGroupButtonProps {
    groupId: string;
    groupName: string;
}

export function DeleteGroupButton({ groupId, groupName }: DeleteGroupButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleDelete() {
        setIsPending(true);
        await deleteGroup(groupId);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    그룹 삭제
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>그룹 삭제</DialogTitle>
                    <DialogDescription>
                        <strong>{groupName}</strong>을(를) 삭제하시겠습니까? 모든 멤버 데이터가 함께
                        삭제되며 복구할 수 없습니다.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        취소
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                        {isPending ? "삭제 중..." : "삭제 확인"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
