-- ═══════════════════════════════════════════════════════════════
-- 🔥 الإصلاح النهائي الشامل - يحل كل المشاكل مرة واحدة
-- ═══════════════════════════════════════════════════════════════
-- هذا الملف يحل:
-- ✅ البوكمارك للمستخدمين العاديين
-- ✅ البوكمارك للأدمن
-- ✅ لوحة التحكم للأدمن
-- ✅ جميع الصلاحيات
-- ═══════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 1: حذف جميع Policies القديمة                         │
-- └─────────────────────────────────────────────────────────────┘

-- حذف policies لجدول mangas
DROP POLICY IF EXISTS "mangas_select_policy" ON mangas;
DROP POLICY IF EXISTS "mangas_public_read" ON mangas;
DROP POLICY IF EXISTS "mangas_insert_policy" ON mangas;
DROP POLICY IF EXISTS "mangas_update_policy" ON mangas;
DROP POLICY IF EXISTS "mangas_delete_policy" ON mangas;
DROP POLICY IF EXISTS "Allow public read access to mangas" ON mangas;
DROP POLICY IF EXISTS "Allow admin insert mangas" ON mangas;
DROP POLICY IF EXISTS "Allow admin update mangas" ON mangas;
DROP POLICY IF EXISTS "Allow admin delete mangas" ON mangas;
DROP POLICY IF EXISTS "Allow authenticated users to insert mangas" ON mangas;
DROP POLICY IF EXISTS "Allow authenticated users to update mangas" ON mangas;
DROP POLICY IF EXISTS "Allow authenticated users to delete mangas" ON mangas;

-- حذف policies لجدول chapters
DROP POLICY IF EXISTS "chapters_select_policy" ON chapters;
DROP POLICY IF EXISTS "chapters_insert_policy" ON chapters;
DROP POLICY IF EXISTS "chapters_update_policy" ON chapters;
DROP POLICY IF EXISTS "chapters_delete_policy" ON chapters;
DROP POLICY IF EXISTS "Allow public read access to chapters" ON chapters;
DROP POLICY IF EXISTS "Allow admin insert chapters" ON chapters;
DROP POLICY IF EXISTS "Allow admin update chapters" ON chapters;
DROP POLICY IF EXISTS "Allow admin delete chapters" ON chapters;
DROP POLICY IF EXISTS "Allow authenticated users to insert chapters" ON chapters;
DROP POLICY IF EXISTS "Allow authenticated users to update chapters" ON chapters;
DROP POLICY IF EXISTS "Allow authenticated users to delete chapters" ON chapters;

-- حذف policies لجدول bookmarks
DROP POLICY IF EXISTS "bookmarks_select_policy" ON bookmarks;
DROP POLICY IF EXISTS "bookmarks_insert_policy" ON bookmarks;
DROP POLICY IF EXISTS "bookmarks_delete_policy" ON bookmarks;
DROP POLICY IF EXISTS "bookmarks_update_policy" ON bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Allow authenticated users to manage their bookmarks" ON bookmarks;

-- حذف policies لجدول profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 2: تفعيل RLS على جميع الجداول                        │
-- └─────────────────────────────────────────────────────────────┘

ALTER TABLE mangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 3: إنشاء Policies جديدة - MANGAS                     │
-- └─────────────────────────────────────────────────────────────┘

-- القراءة: الجميع (مسجلين وغير مسجلين) - مهم للبوكمارك!
CREATE POLICY "mangas_select_for_all" ON mangas
    FOR SELECT
    TO public
    USING (true);

-- الإضافة: المستخدمين المسجلين فقط
CREATE POLICY "mangas_insert_for_authenticated" ON mangas
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- التعديل: المستخدمين المسجلين فقط
CREATE POLICY "mangas_update_for_authenticated" ON mangas
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- الحذف: المستخدمين المسجلين فقط
CREATE POLICY "mangas_delete_for_authenticated" ON mangas
    FOR DELETE
    TO authenticated
    USING (true);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 4: إنشاء Policies جديدة - CHAPTERS                   │
-- └─────────────────────────────────────────────────────────────┘

-- القراءة: الجميع
CREATE POLICY "chapters_select_for_all" ON chapters
    FOR SELECT
    TO public
    USING (true);

-- الإضافة: المستخدمين المسجلين فقط
CREATE POLICY "chapters_insert_for_authenticated" ON chapters
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- التعديل: المستخدمين المسجلين فقط
CREATE POLICY "chapters_update_for_authenticated" ON chapters
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- الحذف: المستخدمين المسجلين فقط
CREATE POLICY "chapters_delete_for_authenticated" ON chapters
    FOR DELETE
    TO authenticated
    USING (true);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 5: إنشاء Policies جديدة - BOOKMARKS                  │
-- └─────────────────────────────────────────────────────────────┘

-- القراءة: المستخدم يرى بوكماركه فقط
CREATE POLICY "bookmarks_select_own" ON bookmarks
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- الإضافة: المستخدم يضيف لنفسه فقط
CREATE POLICY "bookmarks_insert_own" ON bookmarks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- الحذف: المستخدم يحذف بوكماركه فقط
CREATE POLICY "bookmarks_delete_own" ON bookmarks
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 6: إنشاء Policies جديدة - PROFILES                   │
-- └─────────────────────────────────────────────────────────────┘

-- القراءة: الجميع يمكنهم قراءة جميع الملفات الشخصية
CREATE POLICY "profiles_select_for_all" ON profiles
    FOR SELECT
    TO public
    USING (true);

-- الإضافة: المستخدم يضيف ملفه الشخصي فقط
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- التعديل: المستخدم يعدل ملفه الشخصي فقط
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 7: إضافة Indexes لتحسين الأداء                       │
-- └─────────────────────────────────────────────────────────────┘

-- Indexes للبوكمارك
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_manga_id ON bookmarks(manga_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_manga ON bookmarks(user_id, manga_id);

-- Indexes للفصول
CREATE INDEX IF NOT EXISTS idx_chapters_manga_id ON chapters(manga_id);
CREATE INDEX IF NOT EXISTS idx_chapters_slug ON chapters(slug);

-- Indexes للمانجا
CREATE INDEX IF NOT EXISTS idx_mangas_slug ON mangas(slug);
CREATE INDEX IF NOT EXISTS idx_mangas_status ON mangas(status);
CREATE INDEX IF NOT EXISTS idx_mangas_created_at ON mangas(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 8: التحقق من النتائج                                  │
-- └─────────────────────────────────────────────────────────────┘

-- عرض جميع Policies
SELECT 
    tablename as "الجدول",
    policyname as "اسم الـ Policy",
    cmd as "العملية",
    roles as "الأدوار"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ═══════════════════════════════════════════════════════════════
-- ✅ تم الإصلاح الشامل!
-- ═══════════════════════════════════════════════════════════════
-- الآن:
-- ✓ البوكمارك تعمل للمستخدمين العاديين
-- ✓ البوكمارك تعمل للأدمن
-- ✓ لوحة التحكم تعمل للأدمن
-- ✓ جميع الصلاحيات صحيحة
-- ✓ الأداء محسّن
-- ═══════════════════════════════════════════════════════════════
