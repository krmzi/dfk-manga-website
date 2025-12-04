-- ============================================================
-- إصلاح شامل للصلاحيات (RLS) لإظهار البيانات المخفية
-- ============================================================

-- 1. إصلاح جدول المانهوا (Mangas)
ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;

-- السماح للجميع برؤية المانهوا (للزوار والأدمن)
DROP POLICY IF EXISTS "Mangas are viewable by everyone" ON public.mangas;
CREATE POLICY "Mangas are viewable by everyone" ON public.mangas FOR SELECT USING (true);

-- السماح للأدمن فقط بالإضافة والتعديل والحذف
DROP POLICY IF EXISTS "Admins can insert mangas" ON public.mangas;
CREATE POLICY "Admins can insert mangas" ON public.mangas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
);

DROP POLICY IF EXISTS "Admins can update mangas" ON public.mangas;
CREATE POLICY "Admins can update mangas" ON public.mangas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
);

DROP POLICY IF EXISTS "Admins can delete mangas" ON public.mangas;
CREATE POLICY "Admins can delete mangas" ON public.mangas FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
);

-- 2. إصلاح جدول الفصول (Chapters)
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- السماح للجميع برؤية الفصول
DROP POLICY IF EXISTS "Chapters are viewable by everyone" ON public.chapters;
CREATE POLICY "Chapters are viewable by everyone" ON public.chapters FOR SELECT USING (true);

-- السماح للأدمن بالتحكم الكامل
DROP POLICY IF EXISTS "Admins can manage chapters" ON public.chapters;
CREATE POLICY "Admins can manage chapters" ON public.chapters FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
);

-- 3. إصلاح جدول المستخدمين (Profiles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- السماح برؤية البروفايلات (مهم لكي يرى الأدمن قائمة الفريق)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- السماح للمستخدم بتعديل بروفايله الخاص
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- السماح للأدمن بتعديل رتب الآخرين
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 4. خطوة الطوارئ: تعيينك كـ Super Admin قسرياً
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email = 'dfk_admin2002@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- رسالة نجاح
SELECT '✅ تم إصلاح الصلاحيات بنجاح! قم بتحديث صفحة الأدمن الآن.' as result;
