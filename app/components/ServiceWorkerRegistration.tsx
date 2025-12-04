"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration);

                    // Check for updates every 60 seconds
                    setInterval(() => {
                        registration.update();
                    }, 60000);

                    // Force update when new SW is waiting
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New service worker available, reload page
                                    console.log('New version available! Reloading...');
                                    window.location.reload();
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

    return null;
}
