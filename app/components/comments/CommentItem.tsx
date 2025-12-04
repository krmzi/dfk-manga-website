"use client";
import { Trash2, User } from 'lucide-react';
import { supabase } from '@/app/utils/supabase';
import { useToast } from '@/app/providers/ToastProvider';

interface CommentItemProps {
    comment: {
        id: string;
        username: string;
        content: string;
        created_at: string;
        user_id: string;
    };
    currentUserId?: string;
    onDelete: (id: string) => void;
}

export default function CommentItem({ comment, currentUserId, onDelete }: CommentItemProps) {
    const { addToast } = useToast();
    const isOwner = currentUserId === comment.user_id;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;

        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', comment.id);

            if (error) throw error;

            addToast('تم حذف التعليق', 'success');
            onDelete(comment.id);
        } catch (error) {
            console.error('Error deleting comment:', error);
            addToast('فشل حذف التعليق', 'error');
        }
    };

    return (
        <div className="p-4 bg-[#151515] border border-[#222] rounded-xl hover:border-[#333] transition-colors">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center">
                        <User size={16} className="text-red-500" />
                    </div>
                    <div>
                        <span className="font-bold text-sm text-gray-200">{comment.username}</span>
                        <span className="text-xs text-gray-600 mr-2">{formatDate(comment.created_at)}</span>
                    </div>
                </div>
                {isOwner && (
                    <button
                        onClick={handleDelete}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                        title="حذف التعليق"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
            </p>
        </div>
    );
}
