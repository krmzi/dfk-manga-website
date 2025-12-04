import { createClient } from '@supabase/supabase-js';

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            mangas: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    slug: string
                    description: string | null
                    cover_image: string | null
                    bg_image: string | null
                    country: string
                    rating: number
                    status: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    slug: string
                    description?: string | null
                    cover_image?: string | null
                    bg_image?: string | null
                    country: string
                    rating?: number
                    status?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    slug?: string
                    description?: string | null
                    cover_image?: string | null
                    bg_image?: string | null
                    country?: string
                    rating?: number
                    status?: string | null
                }
                Relationships: []
            }
            chapters: {
                Row: {
                    id: string
                    created_at: string
                    manga_id: string
                    chapter_number: number
                    slug: string
                    images: Json
                }
                Insert: {
                    id?: string
                    created_at?: string
                    manga_id: string
                    chapter_number: number
                    slug: string
                    images: Json
                }
                Update: {
                    id?: string
                    created_at?: string
                    manga_id?: string
                    chapter_number?: number
                    slug?: string
                    images?: Json
                }
                Relationships: [
                    {
                        foreignKeyName: "chapters_manga_id_fkey"
                        columns: ["manga_id"]
                        isOneToOne: false
                        referencedRelation: "mangas"
                        referencedColumns: ["id"]
                    }
                ]
            }
            bookmarks: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    manga_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    manga_id: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    manga_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "bookmarks_manga_id_fkey"
                        columns: ["manga_id"]
                        isOneToOne: false
                        referencedRelation: "mangas"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    id: string
                    created_at: string
                    email: string | null
                    role: string | null
                }
                Insert: {
                    id: string
                    created_at?: string
                    email?: string | null
                    role?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    email?: string | null
                    role?: string | null
                }
                Relationships: []
            }
            push_subscriptions: {
                Row: {
                    id: string
                    endpoint: string
                    keys: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    endpoint: string
                    keys: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    endpoint?: string
                    keys?: Json
                    created_at?: string
                }
                Relationships: []
            }
            chapter_reads: {
                Row: {
                    id: string
                    user_id: string
                    chapter_id: string
                    manga_id: string
                    read_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    chapter_id: string
                    manga_id: string
                    read_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    chapter_id?: string
                    manga_id?: string
                    read_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            increment_views: {
                Args: {
                    manga_id: string
                }
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);