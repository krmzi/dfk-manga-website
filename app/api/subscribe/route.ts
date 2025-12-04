import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';

export async function POST(request: NextRequest) {
    try {
        const subscription = await request.json();

        // Store subscription in Supabase
        const { error } = await (supabase as any)
            .from('push_subscriptions')
            .upsert({
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                created_at: new Date().toISOString(),
            }, {
                onConflict: 'endpoint'
            });

        if (error) {
            console.error('Error storing subscription:', error);
            return NextResponse.json(
                { error: 'Failed to store subscription' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in subscribe API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
