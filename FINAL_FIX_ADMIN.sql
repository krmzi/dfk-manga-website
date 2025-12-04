-- ============================================================
-- إصلاح شامل لصلاحيات لوحة التحكم (Admin Dashboard)
-- ============================================================

-- 1. التأكد من وجود جدول profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. تفعيل RLS على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- 3. حذف السياسات القديمة
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Mangas are viewable by everyone" ON public.mangas;
DROP POLICY IF EXISTS "Admins can insert mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can update mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can delete mangas" ON public.mangas;

DROP POLICY IF EXISTS "Chapters are viewable by everyone" ON public.chapters;
DROP POLICY IF EXISTS "Admins can insert chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can update chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can delete chapters" ON public.chapters;

-- 4. إنشاء سياسات Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. إنشاء سياسات Mangas (القراءة للجميع، التعديل للأدمن فقط)
CREATE POLICY "Mangas are viewable by everyone" 
ON public.mangas FOR SELECT USING (true);

CREATE POLICY "Admins can insert mangas" 
ON public.mangas FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin', 'editor')
));

CREATE POLICY "Admins can update mangas" 
ON public.mangas FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin', 'editor')
));

CREATE POLICY "Admins can delete mangas" 
ON public.mangas FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin', 'editor')
));

-- 6. إنشاء سياسات Chapters
CREATE POLICY "Chapters are viewable by everyone" 
ON public.chapters FOR SELECT USING (true);

CREATE POLICY "Admins can insert chapters" 
ON public.chapters FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin', 'editor')
));

CREATE POLICY "Admins can update chapters" 
ON public.chapters FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin', 'editor')
));

CREATE POLICY "Admins can delete chapters" 
ON public.chapters FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin', 'editor')
));

-- 7. إنشاء Trigger لإضافة المستخدمين الجدد تلقائياً
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. إصلاح المستخدمين الحاليين (One-time fix)
INSERT INTO public.profiles (id, email, role)
SELECT 
  id, 
  email,
  CASE 
    WHEN email = 'dfk_admin2002@gmail.com' THEN 'super_admin'
    ELSE 'user'
  END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 9. التأكد من أن حسابك super_admin
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'dfk_admin2002@gmail.com';

-- 10. رسالة نجاح
SELECT '✅ تم إصلاح جميع الصلاحيات بنجاح! قم بتحديث صفحة الأدمن الآن.' as result;
