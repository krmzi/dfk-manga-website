"use client";
import { useToast } from '@/app/providers/ToastProvider';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <XCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />,
        warning: <AlertTriangle size={20} className="text-yellow-500" />,
    };

    const bgColors = {
        success: 'bg-green-500/10 border-green-500/20',
        error: 'bg-red-500/10 border-red-500/20',
        info: 'bg-blue-500/10 border-blue-500/20',
        warning: 'bg-yellow-500/10 border-yellow-500/20',
    };

    return (
        <div className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 z-[10000] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${bgColors[toast.type]} border backdrop-blur-xl rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto max-w-md`}
                >
                    {icons[toast.type]}
                    <p className="flex-1 text-white font-bold text-sm">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
}
