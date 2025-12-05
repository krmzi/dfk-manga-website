-- ============================================
-- 🚀 تنفيذ سريع - نفذ هذا الملف الآن!
-- ============================================
-- نسخة مبسطة ومصححة

-- 1. إصلاح جدول profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- إنشاء الجدول بدون عمود updated_at
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. إنشاء profiles لجميع المستخدمين
INSERT INTO public.profiles (id, email, role, created_at)
SELECT 
    id,
    email,
    CASE 
        WHEN email = 'dfk_admin2002@gmail.com' THEN 'super_admin'
        ELSE 'user'
    END as role,
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE 
        WHEN EXCLUDED.email = 'dfk_admin2002@gmail.com' THEN 'super_admin'
        ELSE profiles.role
    END;

-- 3. إنشاء Trigger تلقائي
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.email = 'dfk_admin2002@gmail.com' THEN 'super_admin'
            ELSE 'user'
        END,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. تفعيل RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- 5. Policies للـ profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 6. Policies للـ mangas
DROP POLICY IF EXISTS "Enable read access for all users" ON public.mangas;
DROP POLICY IF EXISTS "Editors and admins can insert" ON public.mangas;
DROP POLICY IF EXISTS "Editors and admins can update" ON public.mangas;
DROP POLICY IF EXISTS "Only admins can delete" ON public.mangas;

CREATE POLICY "Enable read access for all users" ON public.mangas FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert" ON public.mangas FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin'))
);
CREATE POLICY "Editors and admins can update" ON public.mangas FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin'))
);
CREATE POLICY "Only admins can delete" ON public.mangas FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 7. Policies للـ chapters
DROP POLICY IF EXISTS "Enable read access for all users" ON public.chapters;
DROP POLICY IF EXISTS "Editors and admins can insert" ON public.chapters;
DROP POLICY IF EXISTS "Editors and admins can update" ON public.chapters;
DROP POLICY IF EXISTS "Only admins can delete" ON public.chapters;

CREATE POLICY "Enable read access for all users" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert" ON public.chapters FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin'))
);
CREATE POLICY "Editors and admins can update" ON public.chapters FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('editor', 'admin', 'super_admin'))
);
CREATE POLICY "Only admins can delete" ON public.chapters FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 8. التحقق النهائي
SELECT 
    '✅ Database Fix Completed!' as status,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'super_admin') as super_admins,
    (SELECT COUNT(*) FROM public.mangas) as total_mangas,
    (SELECT COUNT(*) FROM public.chapters) as total_chapters;

SELECT 
    '👤 Super Admin:' as info,
    email,
    role
FROM public.profiles
WHERE role = 'super_admin';
