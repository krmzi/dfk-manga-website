-- ============================================================
-- EMERGENCY FIX - استعادة الوصول للبيانات فوراً
-- ============================================================

-- 1. تعطيل RLS مؤقتاً لرؤية البيانات
ALTER TABLE public.mangas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters DISABLE ROW LEVEL SECURITY;

-- 2. التأكد من وجود profile للمستخدم الحالي
DO $$
BEGIN
  -- إنشاء جدول profiles إذا لم يكن موجوداً
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- إضافة جميع المستخدمين الحاليين إلى profiles
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
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  -- التأكد من أن حسابك super_admin
  UPDATE public.profiles 
  SET role = 'super_admin' 
  WHERE email = 'dfk_admin2002@gmail.com';
END $$;

-- 3. حذف جميع سياسات RLS القديمة
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

-- 4. إنشاء سياسات بسيطة جداً (بدون شروط معقدة)
CREATE POLICY "Allow all to view mangas" ON public.mangas FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to modify mangas" ON public.mangas FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all to view chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to modify chapters" ON public.chapters FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. إعادة تفعيل RLS
ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. إنشاء Trigger للمستخدمين الجدد
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

-- ✅ تم الإصلاح - الآن يجب أن تظهر جميع البيانات
SELECT 
  'تم الإصلاح! البيانات الموجودة:' as status,
  (SELECT COUNT(*) FROM public.mangas) as total_mangas,
  (SELECT COUNT(*) FROM public.chapters) as total_chapters,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles;
