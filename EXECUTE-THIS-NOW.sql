-- ============================================
-- ⚡ الحل النهائي - نفذ هذا الكود الآن في Supabase SQL Editor
-- ============================================

-- 🔴 الخطوة 1: إيقاف RLS (السياسات الأمنية) مؤقتاً
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 🔴 الخطوة 2: مزامنة المستخدمين من auth.users إلى profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', email), 
    'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 🔴 الخطوة 3: جعلك سوبر أدمن
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'dfk_admin2002@gmail.com';

-- ✅ انتهى! ارجع لصفحة الفريق واضغط "تحديث القائمة"
