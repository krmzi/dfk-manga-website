-- ============================================================
-- إضافة بيانات تجريبية للاختبار
-- ============================================================

-- حذف البيانات القديمة (اختياري)
-- TRUNCATE TABLE public.chapters CASCADE;
-- TRUNCATE TABLE public.mangas CASCADE;

-- إضافة مانجا تجريبية
INSERT INTO public.mangas (id, title, slug, description, cover_image, bg_image, country, rating, status)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Solo Leveling',
  'solo-leveling',
  'في عالم حيث يوجد صيادون يحاربون الوحوش، سونغ جين وو هو أضعف صياد من الرتبة E. لكن بعد نجاته من زنزانة مميتة، يحصل على قوة غامضة تسمح له بالارتقاء بمستواه بلا حدود!',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200',
  'كوريا',
  9.5,
  'مستمر'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'The Beginning After The End',
  'the-beginning-after-the-end',
  'الملك غراي لديه قوة وثروة وهيبة لا مثيل لها في عالم تحكمه القدرة القتالية. لكن الوحدة تكمن خلف تلك القوة. تحت القشرة الساحرة لملك قوي، يكمن قشرة فارغة خالية من الهدف والإرادة.',
  'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400',
  'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1200',
  'كوريا',
  9.3,
  'مستمر'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Omniscient Reader',
  'omniscient-reader',
  'دوكجا كيم هو القارئ الوحيد لرواية ويب غامضة "طرق البقاء في عالم الخيال". عندما يصبح عالم الرواية حقيقة، يستخدم معرفته بالقصة للبقاء على قيد الحياة.',
  'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400',
  'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=1200',
  'كوريا',
  9.7,
  'مستمر'
)
ON CONFLICT (id) DO NOTHING;

-- إضافة فصول تجريبية لـ Solo Leveling
INSERT INTO public.chapters (manga_id, chapter_number, slug, images)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  1,
  'chapter-1',
  '["https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1200", "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=1200", "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=1200"]'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  2,
  'chapter-2',
  '["https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1200", "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=1200"]'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  3,
  'chapter-3',
  '["https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=1200", "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1200"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- إضافة فصول تجريبية لـ The Beginning After The End
INSERT INTO public.chapters (manga_id, chapter_number, slug, images)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440002',
  1,
  'chapter-1',
  '["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=1200", "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=1200"]'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  2,
  'chapter-2',
  '["https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1200", "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=1200"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- إضافة فصول تجريبية لـ Omniscient Reader
INSERT INTO public.chapters (manga_id, chapter_number, slug, images)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440003',
  1,
  'chapter-1',
  '["https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=1200", "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1200", "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=1200"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- التحقق من النتائج
SELECT 
  '✅ تم إضافة البيانات التجريبية بنجاح!' as status,
  (SELECT COUNT(*) FROM public.mangas) as total_mangas,
  (SELECT COUNT(*) FROM public.chapters) as total_chapters;

-- عرض المانجا المضافة
SELECT id, title, slug, rating, status FROM public.mangas ORDER BY created_at DESC;
