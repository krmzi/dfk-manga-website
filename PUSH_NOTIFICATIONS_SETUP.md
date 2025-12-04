# Push Notifications Setup Guide

## 1. Install Dependencies

```bash
npm install web-push
```

## 2. Create Supabase Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT UNIQUE NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users"
ON push_subscriptions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow select for service role only
CREATE POLICY "Allow select for service role"
ON push_subscriptions FOR SELECT
TO service_role
USING (true);

-- Create index on endpoint for faster lookups
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
```

## 3. Generate VAPID Keys

Run this command in your terminal:

```bash
npx web-push generate-vapid-keys
```

This will output something like:
```
Public Key: BKxxx...
Private Key: xxx...
```

## 4. Add Environment Variables

Add these to your `.env.local` file:

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY_HERE
VAPID_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
```

**Important:** 
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` must start with `NEXT_PUBLIC_` to be accessible in the browser
- `VAPID_PRIVATE_KEY` should be kept secret (server-side only)

## 5. Test Push Notifications

### From Admin Panel:

You can send test notifications using this code in your admin panel:

```tsx
const sendNotification = async () => {
  const response = await fetch('/api/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'فصل جديد!',
      body: 'تم نشر الفصل 10 من Absolute Dominion',
      mangaSlug: 'absolute-dominion',
      chapterSlug: 'chapter-10',
    }),
  });

  const result = await response.json();
  console.log('Notification sent:', result);
};
```

## 6. How It Works

1. **User visits site** → Service Worker registers automatically
2. **After 10 seconds** → Notification prompt appears
3. **User clicks "تفعيل"** → Browser asks for permission
4. **Permission granted** → Subscription saved to Supabase
5. **Admin sends notification** → All subscribed users receive it

## 7. Testing Locally

1. Open your site in Chrome/Edge
2. Wait 10 seconds for the prompt
3. Click "تفعيل" (Enable)
4. Grant permission when browser asks
5. Check browser console for "Service Worker registered"
6. Send test notification from admin panel

## 8. Production Checklist

- [ ] VAPID keys generated and added to `.env.local`
- [ ] `push_subscriptions` table created in Supabase
- [ ] Service Worker registered successfully
- [ ] Notification permission granted
- [ ] Test notification received
- [ ] Icons created for all sizes (72x72 to 512x512)

## 9. Troubleshooting

**Notifications not working?**
- Check browser console for errors
- Verify VAPID keys are correct
- Ensure HTTPS (required for service workers)
- Check if notifications are blocked in browser settings

**Service Worker not registering?**
- Clear browser cache
- Check `/sw.js` is accessible
- Verify no console errors

**Database errors?**
- Ensure `push_subscriptions` table exists
- Check RLS policies are correct
- Verify Supabase connection

## 10. Icon Requirements

You still need to create app icons. Use the generated icon and resize it to:
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

Save them in `public/icons/` as `icon-{size}.png`

**Quick way:** Use an online tool like https://www.pwabuilder.com/imageGenerator
