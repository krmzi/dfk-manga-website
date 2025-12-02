"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
    title: string;
    text?: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            // الطريقة الحديثة (تعمل في المواقع الآمنة HTTPS و localhost)
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // طريقة بديلة للمتصفحات القديمة أو غير الآمنة (HTTP)
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    textArea.remove();
                    return true;
                } catch (err) {
                    console.error('Fallback copy failed', err);
                    textArea.remove();
                    return false;
                }
            }
        } catch (err) {
            console.error('Copy failed:', err);
            return false;
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: title,
            text: text || `شاهد ${title} على موقعنا!`,
            url: url,
        };

        // محاولة استخدام واجهة المشاركة الأصلية (للموبايل)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Share dialog closed or failed", err);
            }
        } else {
            // إذا لم تكن المشاركة مدعومة (مثل الكمبيوتر)، ننسخ الرابط
            const success = await copyToClipboard(url);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                // في أسوأ الحالات، نعلم المستخدم
                alert("عذراً، لا يمكن نسخ الرابط تلقائياً. يرجى نسخه من شريط العنوان.");
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="py-3 bg-[#1a1a1a] border border-white/10 text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] hover:text-white transition-all active:scale-95 z-10 relative cursor-pointer"
        >
            {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
            {copied ? "تم النسخ!" : "مشاركة"}
        </button>
    );
}
