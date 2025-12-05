-- ============================================
-- 🔥 ULTIMATE DATABASE FIX - الإصلاح النهائي
-- ============================================
-- هذا الملف يحل جميع المشاكل بشكل جذري ونهائي
-- تاريخ: 2025-12-05

-- ============================================
-- 1. إصلاح جدول profiles
-- ============================================

-- حذف الـ trigger القديم إن وجد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- إنشاء أو تحديث جدول profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة index للأداء
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- 2. إنشاء profiles لجميع المستخدمين الموجودين
-- ============================================

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
    updated_at = NOW();

-- ============================================
-- 3. إنشاء Trigger تلقائي لإنشاء profile عند التسجيل
-- ============================================

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

-- ============================================
-- 4. تفعيل RLS وإضافة Policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- إنشاء policies جديدة محسّنة
CREATE POLICY "Enable read access for all users"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- 5. إصلاح جدول mangas
-- ============================================

ALTER TABLE public.mangas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mangas are viewable by everyone" ON public.mangas;
DROP POLICY IF EXISTS "Admins can insert mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can update mangas" ON public.mangas;
DROP POLICY IF EXISTS "Admins can delete mangas" ON public.mangas;

CREATE POLICY "Enable read access for all users"
    ON public.mangas FOR SELECT
    USING (true);

CREATE POLICY "Editors and admins can insert"
    ON public.mangas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('editor', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Editors and admins can update"
    ON public.mangas FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('editor', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can delete"
    ON public.mangas FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- 6. إصلاح جدول chapters
-- ============================================

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chapters are viewable by everyone" ON public.chapters;
DROP POLICY IF EXISTS "Admins can insert chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can update chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can delete chapters" ON public.chapters;

CREATE POLICY "Enable read access for all users"
    ON public.chapters FOR SELECT
    USING (true);

CREATE POLICY "Editors and admins can insert"
    ON public.chapters FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('editor', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Editors and admins can update"
    ON public.chapters FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('editor', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can delete"
    ON public.chapters FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- 7. التحقق النهائي
-- ============================================

-- عرض عدد المستخدمين والأدوار
SELECT 
    'Database Fix Completed!' as status,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'super_admin') as super_admins,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admins,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'editor') as editors,
    (SELECT COUNT(*) FROM public.mangas) as total_mangas,
    (SELECT COUNT(*) FROM public.chapters) as total_chapters;

-- عرض Super Admin
SELECT 
    'Super Admin Account:' as info,
    email,
    role,
    created_at
FROM public.profiles
WHERE role = 'super_admin';
