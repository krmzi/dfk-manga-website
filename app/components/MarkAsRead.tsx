"use client";
import { useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface MarkAsReadProps {
    chapterId: string;
    mangaId: string;
}

export default function MarkAsRead({ chapterId, mangaId }: MarkAsReadProps) {
    useEffect(() => {
        const markChapterAsRead = async () => {
            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Guest users - don't track reads
                return;
            }

            try {
                // Insert or update read status
                const { error } = await supabase
                    .from('chapter_reads')
                    .upsert({
                        user_id: user.id,
                        chapter_id: chapterId,
                        manga_id: mangaId,
                        read_at: new Date().toISOString(),
                    }, {
                        onConflict: 'user_id,chapter_id'
                    });

                if (error) {
                    console.error('Error marking chapter as read:', error);
                }
            } catch (error) {
                console.error('Error in markChapterAsRead:', error);
            }
        };

        // Mark as read after 3 seconds (user has started reading)
        const timer = setTimeout(markChapterAsRead, 3000);

        return () => clearTimeout(timer);
    }, [chapterId, mangaId]);

    // This component doesn't render anything
    return null;
}
