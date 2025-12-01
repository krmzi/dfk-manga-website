"use client";

import { Share2, Check, Copy } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
    title: string;
    text?: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: title,
            text: text || `Check out ${title} on DFK Team!`,
            url: url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback to clipboard copy
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="py-3 bg-[#1a1a1a] border border-white/10 text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] hover:text-white transition-all active:scale-95"
        >
            {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
            {copied ? "تم النسخ!" : "مشاركة"}
        </button>
    );
}
