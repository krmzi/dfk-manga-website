-- ═══════════════════════════════════════════════════════════════
-- 🔥 إصلاح اختفاء المانهوات والترقيم (Pagination Fix)
-- ═══════════════════════════════════════════════════════════════
-- هذا الملف يقوم بإنشاء وظيفة (Function) خاصة لجلب المانهوات
-- مرتبة حسب آخر فصل بدقة، مع دعم الصفحات (Page 1, 2, 3...)
-- ═══════════════════════════════════════════════════════════════

-- 1. تسريع الاستعلامات (Index)
CREATE INDEX IF NOT EXISTS idx_chapters_created_at_desc ON chapters(created_at DESC);

-- 2. دالة جلب المانهوات المحدثة مع الترقيم
CREATE OR REPLACE FUNCTION get_latest_updated_mangas(
  page_offset INT,
  page_limit INT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  cover_image TEXT,
  rating NUMERIC,
  status TEXT,
  country TEXT,
  latest_chapter_date TIMESTAMPTZ,
  total_chapters BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.slug,
    m.cover_image,
    m.rating,
    m.status,
    m.country,
    MAX(c.created_at) as latest_chapter_date,
    COUNT(c.id) as total_chapters
  FROM mangas m
  JOIN chapters c ON m.id = c.manga_id
  GROUP BY m.id
  ORDER BY latest_chapter_date DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;
