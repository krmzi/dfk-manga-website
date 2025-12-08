-- ═══════════════════════════════════════════════════════════════
-- 🔧 COMPLETE DATABASE FIX - December 2025
-- ═══════════════════════════════════════════════════════════════
-- هذا الملف يحل جميع مشاكل قاعدة البيانات بشكل نهائي
-- ═══════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 1: تنظيف وإعادة إنشاء جميع الـ RLS Policies            │
-- └─────────────────────────────────────────────────────────────┘

-- 1.1 حذف جميع الـ Policies القديمة
DROP POLICY IF EXISTS "Allow public read access to mangas" ON mangas;
DROP POLICY IF EXISTS "Allow admin insert mangas" ON mangas;
DROP POLICY IF EXISTS "Allow admin update mangas" ON mangas;
DROP POLICY IF EXISTS "Allow admin delete mangas" ON mangas;
DROP POLICY IF EXISTS "Allow authenticated users to insert mangas" ON mangas;
DROP POLICY IF EXISTS "Allow authenticated users to update mangas" ON mangas;
DROP POLICY IF EXISTS "Allow authenticated users to delete mangas" ON mangas;

DROP POLICY IF EXISTS "Allow public read access to chapters" ON chapters;
DROP POLICY IF EXISTS "Allow admin insert chapters" ON chapters;
DROP POLICY IF EXISTS "Allow admin update chapters" ON chapters;
DROP POLICY IF EXISTS "Allow admin delete chapters" ON chapters;
DROP POLICY IF EXISTS "Allow authenticated users to insert chapters" ON chapters;
DROP POLICY IF EXISTS "Allow authenticated users to update chapters" ON chapters;
DROP POLICY IF EXISTS "Allow authenticated users to delete chapters" ON chapters;

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Allow authenticated users to manage their bookmarks" ON bookmarks;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own chapter reads" ON chapter_reads;
DROP POLICY IF EXISTS "Users can insert their own chapter reads" ON chapter_reads;
DROP POLICY IF EXISTS "Users can update their own chapter reads" ON chapter_reads;

DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 2: تفعيل RLS على جميع الجداول                         │
-- └─────────────────────────────────────────────────────────────┘

ALTER TABLE mangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 3: إنشاء Policies جديدة ومحسّنة                       │
-- └─────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════
-- 📚 MANGAS TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════

-- الجميع يمكنهم القراءة
CREATE POLICY "mangas_select_policy" ON mangas
    FOR SELECT
    USING (true);

-- المستخدمين المسجلين يمكنهم الإضافة
CREATE POLICY "mangas_insert_policy" ON mangas
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- المستخدمين المسجلين يمكنهم التعديل
CREATE POLICY "mangas_update_policy" ON mangas
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- المستخدمين المسجلين يمكنهم الحذف
CREATE POLICY "mangas_delete_policy" ON mangas
    FOR DELETE
    TO authenticated
    USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 📖 CHAPTERS TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════

-- الجميع يمكنهم القراءة
CREATE POLICY "chapters_select_policy" ON chapters
    FOR SELECT
    USING (true);

-- المستخدمين المسجلين يمكنهم الإضافة
CREATE POLICY "chapters_insert_policy" ON chapters
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- المستخدمين المسجلين يمكنهم التعديل
CREATE POLICY "chapters_update_policy" ON chapters
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- المستخدمين المسجلين يمكنهم الحذف
CREATE POLICY "chapters_delete_policy" ON chapters
    FOR DELETE
    TO authenticated
    USING (true);

-- ═══════════════════════════════════════════════════════════════
-- ❤️ BOOKMARKS TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════

-- المستخدمين يمكنهم قراءة البوكمارك الخاصة بهم فقط
CREATE POLICY "bookmarks_select_policy" ON bookmarks
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- المستخدمين يمكنهم إضافة بوكمارك لأنفسهم فقط
CREATE POLICY "bookmarks_insert_policy" ON bookmarks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- المستخدمين يمكنهم حذف البوكمارك الخاصة بهم فقط
CREATE POLICY "bookmarks_delete_policy" ON bookmarks
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 👤 PROFILES TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════

-- الجميع يمكنهم قراءة جميع الملفات الشخصية
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT
    USING (true);

-- المستخدمين يمكنهم إنشاء ملفهم الشخصي
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- المستخدمين يمكنهم تعديل ملفهم الشخصي فقط
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════
-- 📚 CHAPTER_READS TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════

-- المستخدمين يمكنهم قراءة سجل القراءة الخاص بهم
CREATE POLICY "chapter_reads_select_policy" ON chapter_reads
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- المستخدمين يمكنهم إضافة سجل قراءة لأنفسهم
CREATE POLICY "chapter_reads_insert_policy" ON chapter_reads
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- المستخدمين يمكنهم تعديل سجل القراءة الخاص بهم
CREATE POLICY "chapter_reads_update_policy" ON chapter_reads
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 💬 COMMENTS TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════

-- الجميع يمكنهم قراءة التعليقات
CREATE POLICY "comments_select_policy" ON comments
    FOR SELECT
    USING (true);

-- المستخدمين المسجلين يمكنهم إضافة تعليقات
CREATE POLICY "comments_insert_policy" ON comments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- المستخدمين يمكنهم تعديل تعليقاتهم فقط
CREATE POLICY "comments_update_policy" ON comments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- المستخدمين يمكنهم حذف تعليقاتهم فقط
CREATE POLICY "comments_delete_policy" ON comments
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 4: إنشاء Indexes لتحسين الأداء                        │
-- └─────────────────────────────────────────────────────────────┘

-- حذف الـ Indexes القديمة إن وجدت
DROP INDEX IF EXISTS idx_bookmarks_user_id;
DROP INDEX IF EXISTS idx_bookmarks_manga_id;
DROP INDEX IF EXISTS idx_bookmarks_user_manga;
DROP INDEX IF EXISTS idx_chapters_manga_id;
DROP INDEX IF EXISTS idx_chapter_reads_user_id;
DROP INDEX IF EXISTS idx_chapter_reads_chapter_id;
DROP INDEX IF EXISTS idx_comments_chapter_id;
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_mangas_slug;
DROP INDEX IF EXISTS idx_chapters_slug;

-- إنشاء Indexes جديدة
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_manga_id ON bookmarks(manga_id);
CREATE INDEX idx_bookmarks_user_manga ON bookmarks(user_id, manga_id);
CREATE INDEX idx_chapters_manga_id ON chapters(manga_id);
CREATE INDEX idx_chapter_reads_user_id ON chapter_reads(user_id);
CREATE INDEX idx_chapter_reads_chapter_id ON chapter_reads(chapter_id);
CREATE INDEX idx_comments_chapter_id ON comments(chapter_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_mangas_slug ON mangas(slug);
CREATE INDEX idx_chapters_slug ON chapters(slug);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 5: التأكد من وجود الـ Functions                        │
-- └─────────────────────────────────────────────────────────────┘

-- إعادة إنشاء دالة زيادة المشاهدات
CREATE OR REPLACE FUNCTION increment_views(manga_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE mangas
    SET views = COALESCE(views, 0) + 1
    WHERE id = manga_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ┌─────────────────────────────────────────────────────────────┐
-- │ STEP 6: التحقق من البيانات                                 │
-- └─────────────────────────────────────────────────────────────┘

-- عرض عدد السجلات في كل جدول
SELECT 'mangas' as table_name, COUNT(*) as count FROM mangas
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'bookmarks', COUNT(*) FROM bookmarks
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'chapter_reads', COUNT(*) FROM chapter_reads
UNION ALL
SELECT 'comments', COUNT(*) FROM comments;

-- ═══════════════════════════════════════════════════════════════
-- ✅ انتهى الإصلاح!
-- ═══════════════════════════════════════════════════════════════
-- الآن يجب أن تعمل جميع الميزات بشكل صحيح:
-- ✓ البوكمارك
-- ✓ رفع المانجا والفصول
-- ✓ لوحة التحكم للأدمن
-- ✓ التعليقات
-- ✓ سجل القراءة
-- ═══════════════════════════════════════════════════════════════
