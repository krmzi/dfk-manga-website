-- ============================================
-- COMPLETE DATABASE FIX V3 - FIXED
-- ============================================
-- إصلاح شامل مع التعامل مع هيكل جدول profiles الفعلي

-- 1. التحقق من هيكل جدول profiles وإضافة الأعمدة الناقصة
-- ============================================

-- إضافة عمود created_at إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- التأكد من وجود عمود email
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- التأكد من وجود عمود role
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- 2. إصلاح دالة handle_new_user
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. إضافة profiles للمستخدمين الموجودين
-- ============================================

INSERT INTO public.profiles (id, email, role)
SELECT 
  id,
  email,
  'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- 4. تحديث دور الـ Super Admin
-- ============================================

UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'dfk_admin2002@gmail.com';

-- 5. إصلاح RLS Policies لجدول profiles
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة الـ profiles
CREATE POLICY "Anyone can read profiles"
ON public.profiles FOR SELECT
USING (true);

-- السماح للمستخدمين بتحديث بياناتهم الخاصة
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- السماح للـ Super Admin بتحديث أي profile
CREATE POLICY "Super admins can update any profile"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 6. إصلاح RLS Policies لجدول mangas
-- ============================================

DROP POLICY IF EXISTS "Anyone can view mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can insert mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can update mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can delete mangas" ON public.mangas;

ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mangas"
ON public.mangas FOR SELECT
USING (true);

CREATE POLICY "Admins can insert mangas"
ON public.mangas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'editor')
  )
);

CREATE POLICY "Admins can update mangas"
ON public.mangas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'editor')
  )
);

CREATE POLICY "Admins can delete mangas"
ON public.mangas FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 7. إصلاح RLS Policies لجدول chapters
-- ============================================

DROP POLICY IF EXISTS "Anyone can view chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can insert chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can update chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can delete chapters" ON public.chapters;

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chapters"
ON public.chapters FOR SELECT
USING (true);

CREATE POLICY "Admins can insert chapters"
ON public.chapters FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'editor')
  )
);

CREATE POLICY "Admins can update chapters"
ON public.chapters FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'editor')
  )
);

CREATE POLICY "Admins can delete chapters"
ON public.chapters FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 8. إصلاح RLS Policies لجدول bookmarks
-- ============================================

DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
ON public.bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
ON public.bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
ON public.bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- 9. إصلاح RLS Policies لجدول comments (إذا كان موجوداً)
-- ============================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'comments'
    ) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert comments" ON public.comments';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own comments" ON public.comments';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments';
        
        EXECUTE 'ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id)';
    END IF;
END $$;

-- 10. إصلاح RLS Policies لجدول chapter_reads (إذا كان موجوداً)
-- ============================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chapter_reads'
    ) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own reads" ON public.chapter_reads';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert own reads" ON public.chapter_reads';
        
        EXECUTE 'ALTER TABLE public.chapter_reads ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'CREATE POLICY "Users can view own reads" ON public.chapter_reads FOR SELECT USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can insert own reads" ON public.chapter_reads FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
END $$;

-- 11. التحقق من وجود دالة increment_views
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_views(manga_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.mangas
  SET views = COALESCE(views, 0) + 1
  WHERE id = manga_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. إضافة indexes لتحسين الأداء
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chapters_manga_id ON public.chapters(manga_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_manga_id ON public.bookmarks(manga_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- إضافة indexes للجداول الاختيارية
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_comments_chapter_id ON public.comments(chapter_id)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chapter_reads') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_chapter_reads_user_id ON public.chapter_reads(user_id)';
    END IF;
END $$;

-- ============================================
-- التحقق من النتائج
-- ============================================

SELECT 'Database Fix Completed!' as status;

SELECT 
    'Profiles count' as info, 
    COUNT(*) as count 
FROM public.profiles
UNION ALL
SELECT 
    'Mangas count', 
    COUNT(*) 
FROM public.mangas
UNION ALL
SELECT 
    'Chapters count', 
    COUNT(*) 
FROM public.chapters
UNION ALL
SELECT 
    'Super admins', 
    COUNT(*) 
FROM public.profiles 
WHERE role = 'super_admin'
UNION ALL
SELECT 
    'Admins', 
    COUNT(*) 
FROM public.profiles 
WHERE role = 'admin'
UNION ALL
SELECT 
    'Editors', 
    COUNT(*) 
FROM public.profiles 
WHERE role = 'editor';

-- عرض معلومات Super Admin
SELECT 
    'Super Admin Details' as info,
    email,
    role,
    created_at
FROM public.profiles
WHERE role = 'super_admin';
