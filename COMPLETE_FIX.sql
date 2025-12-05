-- ============================================================
-- COMPLETE FIX - Run this to restore everything
-- ============================================================

-- Step 1: Disable RLS temporarily to access data
ALTER TABLE IF EXISTS public.mangas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add ALL existing users to profiles
INSERT INTO public.profiles (id, email, role)
SELECT 
  id, 
  email,
  CASE 
    WHEN email = 'dfk_admin2002@gmail.com' THEN 'super_admin'
    ELSE 'user'
  END
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET 
  role = CASE 
    WHEN EXCLUDED.email = 'dfk_admin2002@gmail.com' THEN 'super_admin'
    ELSE profiles.role
  END,
  email = EXCLUDED.email;

-- Step 4: Force your account to super_admin
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'dfk_admin2002@gmail.com';

-- Step 5: Drop ALL old policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Step 6: Create SIMPLE working policies

-- Profiles policies
CREATE POLICY "allow_read_profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "allow_insert_own_profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Mangas policies (reading for everyone, writing for authenticated)
CREATE POLICY "allow_read_mangas" ON public.mangas
  FOR SELECT USING (true);

CREATE POLICY "allow_write_mangas" ON public.mangas
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Chapters policies (reading for everyone, writing for authenticated)
CREATE POLICY "allow_read_chapters" ON public.chapters
  FOR SELECT USING (true);

CREATE POLICY "allow_write_chapters" ON public.chapters
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 6.5: Create chapter_reads table if not exists
CREATE TABLE IF NOT EXISTS public.chapter_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL,
  manga_id UUID NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Chapter reads policies
CREATE POLICY "allow_read_own_chapter_reads" ON public.chapter_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "allow_insert_own_chapter_reads" ON public.chapter_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_own_chapter_reads" ON public.chapter_reads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_chapter_reads" ON public.chapter_reads
  FOR DELETE USING (auth.uid() = user_id);

-- Step 6.6: Create bookmarks table if not exists
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manga_id UUID NOT NULL REFERENCES public.mangas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, manga_id)
);

-- Bookmarks policies
CREATE POLICY "allow_read_own_bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "allow_insert_own_bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Step 6.7: Create comments table if not exists
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments policies (everyone can read, only owner can write/update/delete)
CREATE POLICY "allow_read_comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "allow_insert_own_comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_own_comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Step 8: Create trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'dfk_admin2002@gmail.com' THEN 'super_admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Verify results
SELECT 
  '✅ FIX COMPLETE!' as status,
  (SELECT COUNT(*) FROM public.mangas) as total_mangas,
  (SELECT COUNT(*) FROM public.chapters) as total_chapters,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT role FROM public.profiles WHERE email = 'dfk_admin2002@gmail.com') as your_role;
