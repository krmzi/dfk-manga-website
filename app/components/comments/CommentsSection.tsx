"use client";
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import CommentForm from './CommentForm';
import CommentsList from './CommentsList';

interface CommentsSectionProps {
    chapterId: string;
}

export default function CommentsSection({ chapterId }: CommentsSectionProps) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#222]">
                    <MessageCircle className="text-red-600" size={24} />
                    <h2 className="text-2xl font-black text-white">التعليقات</h2>
                </div>

                {/* Comment Form */}
                <CommentForm chapterId={chapterId} />

                {/* Comments List */}
                <CommentsList chapterId={chapterId} />
            </div>
        </div>
    );
}
