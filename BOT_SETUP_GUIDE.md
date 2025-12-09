# دليل إعداد نظام البوت (Bot Setup Guide)

لقد تم إنشاء نقاط الاتصال (API Endpoints) بنجاح في الموقع. الآن عليك القيام بالخطوات التالية لتفعيل النظام بشكل كامل وآمن.

## 1. إعداد متغيرات البيئة (Environment Variables)

لكي يعمل النظام، يجب عليك إضافة مفتاحين سريين في ملف `.env.local` (أو `.env`) في مجلد المشروع الرئيسي.

افتح ملف `.env.local` وأضف السطور التالية:

```env
# مفتاح الأمان الخاص بالبوت (يجب أن يكون طويلاً ومعقداً)
BOT_API_SECRET="dfk_bot_xxxxxxxxxxxxxx_secure_key"

# مفتاح الخدمة الخاص بـ Supabase (لتجاوز الصلاحيات والكتابة في القاعدة)
# تجده في Supabase Dashboard > Project Settings > API > service_role secret
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> **ملاحظة هامة:** لا تشارك `SUPABASE_SERVICE_ROLE_KEY` مع أي أحد، لأنه يمنح صلاحيات كاملة على قاعدة البيانات.

## 2. تفاصيل الروابط للطرف الآخر (للمبرمج/البوت)

عندما يطلب منك المبرمج (أو البوت) تفاصيل الربط، أعطه هذه المعلومات:

### أ. رابط المزامنة (Sync URL)
- **الطريقة:** `GET`
- **الرابط:** `https://your-domain.com/api/bot/sync`
- **مثال الاستخدام:** `/api/bot/sync?slug=solo-leveling`
- **الرد المتوقع:**
  ```json
  {
    "manga_id": "uuid-string...",
    "last_chapter": 24.5,
    "status": "success"
  }
  ```

### ب. رابط الرفع (Upload URL)
- **الطريقة:** `POST`
- **الرابط:** `https://your-domain.com/api/bot/upload`
- **جسم الطلب (Body) - JSON:**
  ```json
  {
    "manga_id": "uuid-string...",
    "chapter_number": 25,
    "images": ["url1.webp", "url2.webp"],
    "secret_key": "نفس الكود الذي وضعته في BOT_API_SECRET"
  }
  ```

## 3. كيفية اختبار النظام يدوياً (اختياري)

يمكنك استخدام برنامج مثل **Postman** أو **Thunder Client** لاختبار الروابط بعد رفع التعديلات.

1.  ارفع التعديلات (`git push`) لكي تصل الـ API إلى السيرفر.
2.  جرب طلب `GET /api/bot/sync?slug=ANY_EXISTING_SLUG` وتأكد أنه يرد عليك ببيانات صحيحة.
