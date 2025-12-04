"use client";
import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { useToast } from '@/app/providers/ToastProvider';

export default function NotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const { addToast } = useToast();

    useEffect(() => {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            return;
        }

        setPermission(Notification.permission);

        // Show prompt after 10 seconds if not already granted or denied
        if (Notification.permission === 'default') {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, []);

    const requestPermission = async () => {
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                addToast('تم تفعيل الإشعارات بنجاح!', 'success');

                // Subscribe to push notifications
                await subscribeToPush();
            } else {
                addToast('تم رفض الإشعارات', 'info');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            addToast('حدث خطأ في تفعيل الإشعارات', 'error');
        }

        setShowPrompt(false);
    };

    const subscribeToPush = async () => {
        try {
            // Register service worker
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
                ),
            });

            // Send subscription to server
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription),
            });
        } catch (error) {
            console.error('Error subscribing to push:', error);
        }
    };

    if (!showPrompt || permission !== 'default') {
        return null;
    }

    return (
        <div className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 z-[10000] max-w-md">
            <div className="bg-[#111] border border-[#222] backdrop-blur-xl rounded-xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-red-600" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-bold text-sm mb-1">
                            تفعيل الإشعارات
                        </h3>
                        <p className="text-gray-400 text-xs mb-3">
                            احصل على إشعارات فورية عند نزول فصول جديدة من المانهوا المفضلة لديك
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={requestPermission}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-all active:scale-95"
                            >
                                تفعيل
                            </button>
                            <button
                                onClick={() => setShowPrompt(false)}
                                className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-gray-400 rounded-lg font-bold text-xs transition-all active:scale-95"
                            >
                                لاحقاً
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPrompt(false)}
                        className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
