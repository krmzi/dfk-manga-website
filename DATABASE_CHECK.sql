-- ============================================
-- QUICK DATABASE CHECK
-- ============================================
-- استخدم هذا الملف للتحقق السريع من حالة الـ Database

-- 1. التحقق من عدد المستخدمين والأدوار
SELECT 
    'Total Users' as category,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Users with Profiles',
    COUNT(*)
FROM public.profiles
UNION ALL
SELECT 
    'Super Admins',
    COUNT(*)
FROM public.profiles
WHERE role = 'super_admin'
UNION ALL
SELECT 
    'Admins',
    COUNT(*)
FROM public.profiles
WHERE role = 'admin'
UNION ALL
SELECT 
    'Editors',
    COUNT(*)
FROM public.profiles
WHERE role = 'editor'
UNION ALL
SELECT 
    'Regular Users',
    COUNT(*)
FROM public.profiles
WHERE role = 'user' OR role IS NULL;

-- 2. التحقق من المحتوى
SELECT 
    'Total Mangas' as category,
    COUNT(*) as count
FROM public.mangas
UNION ALL
SELECT 
    'Total Chapters',
    COUNT(*)
FROM public.chapters
UNION ALL
SELECT 
    'Total Bookmarks',
    COUNT(*)
FROM public.bookmarks
UNION ALL
SELECT 
    'Total Comments',
    COUNT(*)
FROM public.comments;

-- 3. التحقق من RLS Policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. التحقق من الـ Super Admin
SELECT 
    id,
    email,
    role,
    created_at
FROM public.profiles
WHERE role = 'super_admin'
ORDER BY created_at;

-- 5. التحقق من آخر 10 مانجا
SELECT 
    id,
    title,
    slug,
    country,
    status,
    rating,
    views,
    created_at
FROM public.mangas
ORDER BY created_at DESC
LIMIT 10;

-- 6. التحقق من آخر 10 فصول
SELECT 
    c.id,
    m.title as manga_title,
    c.chapter_number,
    c.slug,
    array_length(c.images::text[], 1) as image_count,
    c.created_at
FROM public.chapters c
JOIN public.mangas m ON c.manga_id = m.id
ORDER BY c.created_at DESC
LIMIT 10;

-- 7. التحقق من الـ Triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 8. التحقق من الـ Functions
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
