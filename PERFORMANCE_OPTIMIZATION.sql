-- ═══════════════════════════════════════════════════════════════
-- 🚀 تحسين أداء رفع الصور والبيانات
-- ═══════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 1. زيادة حد الرفع في Storage                               │
-- └─────────────────────────────────────────────────────────────┘

-- تحقق من إعدادات Storage الحالية
SELECT * FROM storage.buckets;

-- ملاحظة: لزيادة حد الرفع، يجب القيام بذلك من Dashboard:
-- 1. اذهب إلى Storage في Supabase Dashboard
-- 2. اختر bucket الخاص بك
-- 3. Settings > File size limit
-- 4. اضبطه على 50MB على الأقل

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 2. تحسين أداء الاستعلامات                                  │
-- └─────────────────────────────────────────────────────────────┘

-- تحديث إحصائيات PostgreSQL لتحسين خطط الاستعلام
ANALYZE mangas;
ANALYZE chapters;
ANALYZE bookmarks;
ANALYZE profiles;
ANALYZE chapter_reads;
ANALYZE comments;

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 3. إضافة Indexes إضافية لتحسين الأداء                     │
-- └─────────────────────────────────────────────────────────────┘

-- Index لتسريع البحث بالعنوان
CREATE INDEX IF NOT EXISTS idx_mangas_title ON mangas USING gin(to_tsvector('arabic', title));

-- Index لتسريع البحث بالحالة
CREATE INDEX IF NOT EXISTS idx_mangas_status ON mangas(status);

-- Index لتسريع الترتيب حسب التقييم
CREATE INDEX IF NOT EXISTS idx_mangas_rating ON mangas(rating DESC);

-- Index لتسريع الترتيب حسب المشاهدات
CREATE INDEX IF NOT EXISTS idx_mangas_views ON mangas(views DESC);

-- Index لتسريع الترتيب حسب تاريخ الإنشاء
CREATE INDEX IF NOT EXISTS idx_mangas_created_at ON mangas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapters_created_at ON chapters(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 4. تفعيل Connection Pooling                                │
-- └─────────────────────────────────────────────────────────────┘

-- ملاحظة: Connection Pooling يتم تفعيله من Dashboard:
-- 1. اذهب إلى Settings > Database
-- 2. Connection pooling > Enable
-- 3. استخدم Connection string مع port 6543 بدلاً من 5432

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 5. تنظيف البيانات القديمة (اختياري)                        │
-- └─────────────────────────────────────────────────────────────┘

-- حذف البوكمارك للمانجا المحذوفة
DELETE FROM bookmarks 
WHERE manga_id NOT IN (SELECT id FROM mangas);

-- حذف الفصول للمانجا المحذوفة
DELETE FROM chapters 
WHERE manga_id NOT IN (SELECT id FROM mangas);

-- حذف سجلات القراءة للفصول المحذوفة
DELETE FROM chapter_reads 
WHERE chapter_id NOT IN (SELECT id FROM chapters);

-- حذف التعليقات للفصول المحذوفة
DELETE FROM comments 
WHERE chapter_id NOT IN (SELECT id FROM chapters);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 6. تحسين RLS Policies للأداء                              │
-- └─────────────────────────────────────────────────────────────┘

-- إعادة إنشاء Policies مع تحسينات الأداء

-- Mangas: استخدام USING (true) للقراءة العامة (أسرع)
DROP POLICY IF EXISTS "mangas_select_policy" ON mangas;
CREATE POLICY "mangas_select_policy" ON mangas
    FOR SELECT
    USING (true);

-- Chapters: استخدام USING (true) للقراءة العامة
DROP POLICY IF EXISTS "chapters_select_policy" ON chapters;
CREATE POLICY "chapters_select_policy" ON chapters
    FOR SELECT
    USING (true);

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 7. إضافة Materialized View للإحصائيات (اختياري)          │
-- └─────────────────────────────────────────────────────────────┘

-- إنشاء Materialized View للمانجا الشائعة
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_mangas AS
SELECT 
    id,
    title,
    slug,
    cover_image,
    rating,
    views,
    status,
    genres
FROM mangas
ORDER BY views DESC, rating DESC
LIMIT 100;

-- إنشاء Index على Materialized View
CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_mangas_id ON popular_mangas(id);

-- Function لتحديث Materialized View
CREATE OR REPLACE FUNCTION refresh_popular_mangas()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_mangas;
END;
$$ LANGUAGE plpgsql;

-- ملاحظة: يمكنك تحديث Materialized View يدوياً بتنفيذ:
-- SELECT refresh_popular_mangas();

-- أو إنشاء Cron Job لتحديثها تلقائياً كل ساعة:
-- (يتطلب تفعيل pg_cron extension)

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 8. تحسين Function زيادة المشاهدات                         │
-- └─────────────────────────────────────────────────────────────┘

-- إعادة إنشاء Function مع تحسينات
CREATE OR REPLACE FUNCTION increment_views(manga_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE mangas
    SET views = COALESCE(views, 0) + 1
    WHERE id = manga_id;
    
    -- لا نحتاج EXCEPTION handling هنا لتحسين الأداء
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 9. إضافة Function لضغط الصور (سيتم استخدامها من الكود)   │
-- └─────────────────────────────────────────────────────────────┘

-- ملاحظة: ضغط الصور يتم في الـ Frontend قبل الرفع
-- سنضيف الكود في الخطوة التالية

-- ┌─────────────────────────────────────────────────────────────┐
-- │ 10. التحقق من الأداء                                       │
-- └─────────────────────────────────────────────────────────────┘

-- عرض حجم الجداول
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- عرض الـ Indexes وأحجامها
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- عرض أكثر الاستعلامات استخداماً
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 10;

-- ملاحظة: pg_stat_statements يجب أن يكون مفعلاً من Dashboard

-- ═══════════════════════════════════════════════════════════════
-- ✅ تم تحسين الأداء!
-- ═══════════════════════════════════════════════════════════════
-- التحسينات المطبقة:
-- ✓ Indexes إضافية لتسريع الاستعلامات
-- ✓ تحديث إحصائيات PostgreSQL
-- ✓ تنظيف البيانات القديمة
-- ✓ تحسين RLS Policies
-- ✓ Materialized View للمانجا الشائعة
-- ✓ تحسين Function زيادة المشاهدات
-- ═══════════════════════════════════════════════════════════════
