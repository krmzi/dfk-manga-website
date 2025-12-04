"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface UseChapterReadStatusReturn {
    readChapters: Set<string>;
    isLoading: boolean;
    markAsRead: (chapterId: string) => void;
}

export function useChapterReadStatus(mangaId: string): UseChapterReadStatusReturn {
    const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReadStatus = async () => {
            try {
                // Check if user is logged in
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    // Guest user - no read chapters
                    setIsLoading(false);
                    return;
                }

                // Fetch all read chapters for this manga
                const { data, error } = await supabase
                    .from('chapter_reads')
                    .select('chapter_id')
                    .eq('manga_id', mangaId)
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching read status:', error);
                    setIsLoading(false);
                    return;
                }

                // Convert to Set for fast lookup
                const readSet = new Set(data?.map(r => r.chapter_id) || []);
                setReadChapters(readSet);
                setIsLoading(false);
            } catch (error) {
                console.error('Error in fetchReadStatus:', error);
                setIsLoading(false);
            }
        };

        fetchReadStatus();
    }, [mangaId]);

    const markAsRead = (chapterId: string) => {
        setReadChapters(prev => new Set([...prev, chapterId]));
    };

    return { readChapters, isLoading, markAsRead };
}
