-- ═══════════════════════════════════════════════════════════════
-- 👥 ADMIN SETUP - إعداد الأدمن
-- ═══════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────┐
-- │ الخطوة 1: تحديث صلاحيات المدير العام (Super Admin)        │
-- └─────────────────────────────────────────────────────────────┘

-- ⚠️ استبدل 'your-email@example.com' ببريدك الإلكتروني الفعلي
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'dfk_admin2002@gmail.com';

-- ┌─────────────────────────────────────────────────────────────┐
-- │ الخطوة 2: إضافة أدمن آخرين                                 │
-- └─────────────────────────────────────────────────────────────┘

-- ⚠️ استبدل البريد الإلكتروني ببريد الأدمن الذين تريد إضافتهم
-- يمكنك إضافة عدة أدمن بتكرار هذا الأمر

-- مثال: إضافة أدمن واحد
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'atikyouss085@gmail.com';

-- مثال: إضافة عدة أدمن دفعة واحدة
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email IN (
--     'admin1@example.com',
--     'admin2@example.com',
--     'admin3@example.com'
-- );

-- ┌─────────────────────────────────────────────────────────────┐
-- │ الخطوة 3: إضافة محررين (Editors)                           │
-- └─────────────────────────────────────────────────────────────┘

-- المحررون يمكنهم إضافة وتعديل المحتوى فقط (بدون حذف)
-- UPDATE profiles 
-- SET role = 'editor' 
-- WHERE email IN (
--     'editor1@example.com',
--     'editor2@example.com'
-- );

-- ┌─────────────────────────────────────────────────────────────┐
-- │ الخطوة 4: التحقق من الصلاحيات                             │
-- └─────────────────────────────────────────────────────────────┘

-- عرض جميع المستخدمين وصلاحياتهم
SELECT 
    email as "البريد الإلكتروني",
    role as "الدور",
    created_at as "تاريخ التسجيل",
    CASE 
        WHEN role = 'super_admin' THEN '🔴 مدير عام'
        WHEN role = 'admin' THEN '🟠 مدير'
        WHEN role = 'editor' THEN '🟡 محرر'
        ELSE '🟢 مستخدم عادي'
    END as "الوصف"
FROM profiles
ORDER BY 
    CASE role
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'editor' THEN 3
        ELSE 4
    END,
    created_at DESC;

-- ┌─────────────────────────────────────────────────────────────┐
-- │ الخطوة 5: إنشاء Profile تلقائياً للمستخدمين الجدد         │
-- └─────────────────────────────────────────────────────────────┘

-- إنشاء Function لإنشاء Profile تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        'user' -- الدور الافتراضي للمستخدمين الجدد
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- حذف Trigger القديم إن وجد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- إنشاء Trigger جديد
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ┌─────────────────────────────────────────────────────────────┐
-- │ الخطوة 6: إصلاح Profiles المفقودة                         │
-- └─────────────────────────────────────────────────────────────┘

-- إنشاء profiles للمستخدمين الموجودين في auth.users ولكن ليس لديهم profile
INSERT INTO public.profiles (id, email, role)
SELECT 
    id,
    email,
    'user' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- ✅ تم إعداد الأدمن بنجاح!
-- ═══════════════════════════════════════════════════════════════
-- الآن:
-- ✓ تم تحديد صلاحيات المدير العام
-- ✓ يمكنك إضافة أدمن آخرين
-- ✓ سيتم إنشاء profile تلقائياً للمستخدمين الجدد
-- ✓ تم إصلاح profiles المفقودة
-- ═══════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────┐
-- │ نصائح مهمة                                                  │
-- └─────────────────────────────────────────────────────────────┘

-- 1. للتحقق من دور مستخدم معين:
-- SELECT email, role FROM profiles WHERE email = 'user@example.com';

-- 2. لتغيير دور مستخدم:
-- UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';

-- 3. لإزالة صلاحيات الأدمن من مستخدم:
-- UPDATE profiles SET role = 'user' WHERE email = 'user@example.com';

-- 4. لعرض عدد المستخدمين حسب الدور:
-- SELECT role, COUNT(*) as count FROM profiles GROUP BY role;
