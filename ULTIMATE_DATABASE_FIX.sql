-- ============================================================
-- ULTIMATE DATABASE FIX - حل شامل لجميع المشاكل
-- ============================================================

-- Step 1: تعطيل RLS مؤقتاً
ALTER TABLE IF EXISTS public.mangas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chapter_reads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments DISABLE ROW LEVEL SECURITY;

-- Step 2: إضافة الأعمدة المفقودة إلى جدول mangas
ALTER TABLE public.mangas 
ADD COLUMN IF NOT EXISTS genres TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Step 3: التأكد من وجود جدول profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: إضافة جميع المستخدمين الموجودين إلى profiles
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

-- Step 5: التأكد من صلاحيات super_admin
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'dfk_admin2002@gmail.com';

-- Step 6: حذف جميع السياسات القديمة
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Step 7: إنشاء سياسات بسيطة وفعالة

-- سياسات profiles
CREATE POLICY "allow_read_all_profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "allow_insert_own_profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_profiles" ON public.profiles
  FOR UPDATE USING (true);

-- سياسات mangas (القراءة للجميع، الكتابة للمصادقين)
CREATE POLICY "allow_read_all_mangas" ON public.mangas
  FOR SELECT USING (true);

CREATE POLICY "allow_insert_mangas" ON public.mangas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "allow_update_mangas" ON public.mangas
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "allow_delete_mangas" ON public.mangas
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- سياسات chapters (القراءة للجميع، الكتابة للمصادقين)
CREATE POLICY "allow_read_all_chapters" ON public.chapters
  FOR SELECT USING (true);

CREATE POLICY "allow_insert_chapters" ON public.chapters
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "allow_update_chapters" ON public.chapters
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "allow_delete_chapters" ON public.chapters
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- سياسات bookmarks
CREATE POLICY "allow_read_own_bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "allow_insert_own_bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات chapter_reads
CREATE POLICY "allow_read_own_chapter_reads" ON public.chapter_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "allow_insert_own_chapter_reads" ON public.chapter_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_own_chapter_reads" ON public.chapter_reads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_chapter_reads" ON public.chapter_reads
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات comments
CREATE POLICY "allow_read_all_comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "allow_insert_own_comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_own_comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Step 8: إعادة تفعيل RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Step 9: إنشاء trigger للمستخدمين الجدد
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

-- Step 10: إنشاء دالة increment_views إذا لم تكن موجودة
CREATE OR REPLACE FUNCTION public.increment_views(manga_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.mangas
  SET views = COALESCE(views, 0) + 1
  WHERE id = manga_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: التحقق من النتائج
SELECT 
  '✅ إصلاح شامل اكتمل!' as status,
  (SELECT COUNT(*) FROM public.mangas) as total_mangas,
  (SELECT COUNT(*) FROM public.chapters) as total_chapters,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT role FROM public.profiles WHERE email = 'dfk_admin2002@gmail.com') as admin_role;
