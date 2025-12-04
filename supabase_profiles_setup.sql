-- =============================================
-- Trigger: إنشاء Profile تلقائياً عند التسجيل
-- =============================================

-- حذف الـ Trigger القديم إن وجد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- إنشاء الدالة
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

-- إنشاء الـ Trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- إصلاح المستخدمين الموجودين (One-time fix)
-- =============================================

-- إضافة المستخدمين الموجودين الذين ليس لهم profile
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

-- =============================================
-- تأكيد نجاح العملية
-- =============================================
SELECT 'Profiles trigger setup completed successfully!' AS status;
