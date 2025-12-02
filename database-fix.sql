-- =============================================
-- الحل الكامل لمشكلة عدم ظهور المستخدمين
-- =============================================

-- 1️⃣ إنشاء دالة لإضافة المستخدم الجديد تلقائياً إلى profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2️⃣ إنشاء Trigger يُنفذ الدالة عند تسجيل مستخدم جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3️⃣ مزامنة المستخدمين الموجودين في auth.users ولكن غير موجودين في profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'User'), 
    'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 4️⃣ إصلاح صلاحيات السياسات (Policies)
-- حذف السياسات القديمة المتضاربة
DROP POLICY IF EXISTS "Super admin view all" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- 5️⃣ إنشاء سياسات جديدة واضحة
-- السوبر أدمن يرى ويعدل كل شيء
CREATE POLICY "Super admin has full access"
ON public.profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- المستخدمين العاديين يرون ملفاتهم الشخصية فقط
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- المستخدمين العاديين يعدلون ملفاتهم الشخصية فقط
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- 6️⃣ التأكد من أنك أنت السوبر أدمن
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'dfk_admin2002@gmail.com';

-- 7️⃣ إعطاء صلاحية admin لصديقك (اختياري)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'atikyouss085@gmail.com';

-- ✅ انتهى! الآن كل شيء سيعمل بشكل صحيح
