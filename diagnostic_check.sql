-- ============================================================
-- DIAGNOSTIC CHECK - Run this FIRST
-- ============================================================
-- This script will tell us exactly what's wrong

-- 1. Check if profiles table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    )
    THEN '✅ Profiles table EXISTS'
    ELSE '❌ Profiles table MISSING - This is the problem!'
  END as profiles_table_status;

-- 2. Check your user's profile (if table exists)
SELECT 
  id,
  email,
  role,
  created_at,
  CASE 
    WHEN role IN ('super_admin', 'admin', 'editor') 
    THEN '✅ Has admin access' 
    ELSE '❌ NOT admin - This is why buttons are hidden!'
  END as access_status
FROM public.profiles
WHERE email = 'dfk_admin2002@gmail.com'
LIMIT 1;

-- 3. Count all data
SELECT 
  'Mangas' as table_name,
  COUNT(*) as total_records
FROM public.mangas
UNION ALL
SELECT 
  'Chapters' as table_name,
  COUNT(*) as total_records  
FROM public.chapters
UNION ALL
SELECT 
  'Profiles' as table_name,
  COUNT(*) as total_records
FROM public.profiles;

-- 4. Check RLS status
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '🔒 RLS ENABLED' 
    ELSE '🔓 RLS DISABLED' 
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('mangas', 'chapters', 'profiles');

-- 5. Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('mangas', 'chapters', 'profiles')
ORDER BY tablename, policyname;

-- 6. Get your current user ID
SELECT 
  auth.uid() as your_user_id,
  auth.email() as your_email;

-- ============================================================
-- RESULT INTERPRETATION:
-- ============================================================
-- If profiles table is MISSING → Run EMERGENCY_FIX.sql
-- If your role is NOT admin → Run EMERGENCY_FIX.sql
-- If data counts are 0 but you uploaded data → RLS is blocking
-- If RLS is ENABLED but no policies exist → Run EMERGENCY_FIX.sql
-- ============================================================
