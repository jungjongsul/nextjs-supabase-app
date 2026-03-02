"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteLinkButtonProps {
    inviteCode: string;
}

export function InviteLinkButton({ inviteCode }: InviteLinkButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        const url = `${window.location.origin}/protected/groups/join/${inviteCode}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // 클립보드 API 미지원 환경 대응
            const input = document.createElement("input");
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? (
                <>
                    <Check size={14} className="text-green-500" />
                    <span>복사됨!</span>
                </>
            ) : (
                <>
                    <Copy size={14} />
                    <span>초대 링크 복사</span>
                </>
            )}
        </Button>
    );
}
