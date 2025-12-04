"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/utils/supabase';
import CommentItem from './CommentItem';

interface Comment {
    id: string;
    username: string;
    content: string;
    created_at: string;
    user_id: string;
}

interface CommentsListProps {
    chapterId: string;
}

// Fetch comments function
const fetchComments = async (chapterId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export default function CommentsList({ chapterId }: CommentsListProps) {
    const queryClient = useQueryClient();

    // Use React Query for caching
    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', chapterId],
        queryFn: () => fetchComments(chapterId),
        staleTime: 30 * 1000, // 30 seconds
    });

    // Get current user
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user?.id;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', chapterId] });
        },
    });

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="p-4 bg-[#151515] border border-[#222] rounded-xl animate-pulse">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                        <div className="h-4 w-24 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <p>لا توجد تعليقات بعد</p>
                <p className="text-sm mt-2">كن أول من يعلق!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {comments.map(comment => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUser}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
}
