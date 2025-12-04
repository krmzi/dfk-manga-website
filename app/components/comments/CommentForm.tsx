"use client";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/utils/supabase';
import { Send } from 'lucide-react';
import { useToast } from '@/app/providers/ToastProvider';

interface CommentFormProps {
    chapterId: string;
    onCommentAdded?: () => void;
}

export default function CommentForm({ chapterId, onCommentAdded }: CommentFormProps) {
    const [content, setContent] = useState('');
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const maxLength = 1000;

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: async (commentData: { content: string }) => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('يجب تسجيل الدخول للتعليق');
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', user.id)
                .single();

            const username = profile?.email?.split('@')[0] || 'مستخدم';

            const { error } = await supabase
                .from('comments')
                .insert({
                    chapter_id: chapterId,
                    user_id: user.id,
                    username: username,
                    content: commentData.content,
                });

            if (error) throw error;
        },
        onSuccess: () => {
            addToast('تم نشر التعليق بنجاح', 'success');
            setContent('');
            queryClient.invalidateQueries({ queryKey: ['comments', chapterId] });
            if (onCommentAdded) onCommentAdded();
        },
        onError: (error: any) => {
            console.error('Error posting comment:', error);
            addToast(error.message || 'فشل نشر التعليق', 'error');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            addToast('الرجاء كتابة تعليق', 'error');
            return;
        }

        if (content.length > maxLength) {
            addToast(`التعليق طويل جداً (الحد الأقصى ${maxLength} حرف)`, 'error');
            return;
        }

        submitMutation.mutate({ content: content.trim() });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="أضف تعليقك..."
                    className="w-full p-4 bg-[#151515] border border-[#222] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors resize-none"
                    rows={3}
                    maxLength={maxLength}
                    disabled={submitMutation.isPending}
                />
                <div className="absolute bottom-2 left-2 text-xs text-gray-600">
                    {content.length}/{maxLength}
                </div>
            </div>
            <button
                type="submit"
                disabled={submitMutation.isPending || !content.trim()}
                className="mt-3 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center gap-2"
            >
                <Send size={16} />
                {submitMutation.isPending ? 'جاري النشر...' : 'نشر التعليق'}
            </button>
        </form>
    );
}
