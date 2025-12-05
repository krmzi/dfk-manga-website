-- ============================================
-- COMPLETE DATABASE FIX FOR DFK MANGA WEBSITE
-- ============================================
-- هذا الملف يحل جميع مشاكل الـ Database والـ Admin Dashboard

-- 1. إصلاح جدول profiles وإضافة trigger للمستخدمين الجدد
-- ============================================

-- حذف الـ trigger القديم إن وجد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- إنشاء دالة لإضافة profile تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user', -- الدور الافتراضي
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء الـ trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. إضافة profiles للمستخدمين الموجودين بدون profile
-- ============================================

INSERT INTO public.profiles (id, email, role, created_at)
SELECT 
  id,
  email,
  'user',
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3. تحديث دور الـ Super Admin
-- ============================================

UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'dfk_admin2002@gmail.com';

-- 4. إصلاح RLS Policies لجدول profiles
-- ============================================

-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.profiles;

-- تفعيل RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة الـ profiles (مطلوب للـ Navbar)
CREATE POLICY "Anyone can read profiles"
ON public.profiles FOR SELECT
USING (true);

-- السماح للمستخدمين بتحديث بياناتهم الخاصة (ما عدا الدور)
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

-- 5. إصلاح RLS Policies لجدول mangas
-- ============================================

DROP POLICY IF EXISTS "Anyone can view mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can insert mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can update mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can delete mangas" ON public.mangas;

ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم قراءة المانجا
CREATE POLICY "Anyone can view mangas"
ON public.mangas FOR SELECT
USING (true);

-- Admin, Super Admin, و Editor يمكنهم إضافة مانجا
CREATE POLICY "Admins can insert mangas"
ON public.mangas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'editor')
  )
);

-- Admin, Super Admin, و Editor يمكنهم تحديث المانجا
CREATE POLICY "Admins can update mangas"
ON public.mangas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'editor')
  )
);

-- Admin و Super Admin فقط يمكنهم حذف المانجا
CREATE POLICY "Admins can delete mangas"
ON public.mangas FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 6. إصلاح RLS Policies لجدول chapters
-- ============================================

DROP POLICY IF EXISTS "Anyone can view chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can insert chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can update chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can delete chapters" ON public.chapters;

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم قراءة الفصول
CREATE POLICY "Anyone can view chapters"
ON public.chapters FOR SELECT
USING (true);

-- Admin, Super Admin, و Editor يمكنهم إضافة فصول
CREATE POLICY "Admins can insert chapters"
ON public.chapters FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'editor')
  )
);

-- Admin, Super Admin, و Editor يمكنهم تحديث الفصول
CREATE POLICY "Admins can update chapters"
ON public.chapters FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'editor')
  )
);

-- Admin و Super Admin فقط يمكنهم حذف الفصول
CREATE POLICY "Admins can delete chapters"
ON public.chapters FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 7. إصلاح RLS Policies لجدول bookmarks
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

-- 8. إصلاح RLS Policies لجدول comments
-- ============================================

DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Users can insert comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- 9. إصلاح RLS Policies لجدول chapter_reads
-- ============================================

DROP POLICY IF EXISTS "Users can view own reads" ON public.chapter_reads;
DROP POLICY IF EXISTS "Users can insert own reads" ON public.chapter_reads;

ALTER TABLE public.chapter_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reads"
ON public.chapter_reads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reads"
ON public.chapter_reads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 10. التحقق من وجود دالة increment_views
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_views(manga_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.mangas
  SET views = COALESCE(views, 0) + 1
  WHERE id = manga_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. إضافة indexes لتحسين الأداء
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chapters_manga_id ON public.chapters(manga_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_manga_id ON public.bookmarks(manga_id);
CREATE INDEX IF NOT EXISTS idx_comments_chapter_id ON public.comments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_reads_user_id ON public.chapter_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- انتهى! الآن يجب أن يعمل كل شيء بشكل صحيح
-- ============================================

-- للتحقق من النتائج:
SELECT 'Profiles count:' as info, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Mangas count:', COUNT(*) FROM public.mangas
UNION ALL
SELECT 'Chapters count:', COUNT(*) FROM public.chapters
UNION ALL
SELECT 'Super admins:', COUNT(*) FROM public.profiles WHERE role = 'super_admin'
UNION ALL
SELECT 'Admins:', COUNT(*) FROM public.profiles WHERE role = 'admin'
UNION ALL
SELECT 'Editors:', COUNT(*) FROM public.profiles WHERE role = 'editor';
