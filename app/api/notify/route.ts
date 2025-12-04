import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - web-push doesn't have TypeScript definitions
import webpush from 'web-push';
import { supabase } from '@/app/utils/supabase';

// Configure web-push with VAPID keys only if they exist
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@dfk-team.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function POST(request: NextRequest) {
    try {
        const { title, body, mangaSlug, chapterSlug } = await request.json();

        // Get all subscriptions from database
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (error) {
            console.error('Error fetching subscriptions:', error);
            return NextResponse.json(
                { error: 'Failed to fetch subscriptions' },
                { status: 500 }
            );
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: 'No subscriptions found' });
        }

        // Prepare notification payload
        const payload = JSON.stringify({
            title,
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            data: {
                url: `/manga/${mangaSlug}/chapter/${chapterSlug}`,
            },
        });

        // Send notifications to all subscribers
        const results = await Promise.allSettled(
            subscriptions.map((sub: any) =>
                webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: sub.keys,
                    },
                    payload
                )
            )
        );

        // Count successes and failures
        const successful = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        return NextResponse.json({
            success: true,
            sent: successful,
            failed,
            total: subscriptions.length,
        });
    } catch (error) {
        console.error('Error sending notifications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
