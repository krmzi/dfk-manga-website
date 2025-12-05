"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/app/utils/supabase';

export default function DiagnosticPage() {
    const [results, setResults] = useState<any>({
        envCheck: 'جاري الفحص...',
        connectionCheck: 'جاري الفحص...',
        tablesCheck: 'جاري الفحص...',
        authCheck: 'جاري الفحص...',
    });

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = async () => {
        const newResults: any = {};

        // 1. Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            newResults.envCheck = '❌ فشل: متغيرات البيئة مفقودة في .env.local';
        } else if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
            newResults.envCheck = '❌ فشل: يجب تحديث بيانات Supabase في .env.local';
        } else {
            newResults.envCheck = '✅ نجح: متغيرات البيئة موجودة';
        }

        // 2. Check Supabase connection
        try {
            const { data, error } = await supabase.from('mangas').select('count').limit(1);
            if (error) {
                newResults.connectionCheck = `❌ فشل: ${error.message}`;
                newResults.tablesCheck = '⏭️ تم التخطي بسبب فشل الاتصال';
            } else {
                newResults.connectionCheck = '✅ نجح: الاتصال بـ Supabase يعمل';

                // 3. Check tables
                const { count } = await supabase.from('mangas').select('*', { count: 'exact', head: true });
                newResults.tablesCheck = `✅ نجح: جدول mangas موجود (${count || 0} صف)`;
            }
        } catch (err: any) {
            newResults.connectionCheck = `❌ فشل: ${err.message}`;
            newResults.tablesCheck = '⏭️ تم التخطي بسبب فشل الاتصال';
        }

        // 4. Check authentication
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                newResults.authCheck = `✅ مسجل دخول: ${user.email}`;
            } else {
                newResults.authCheck = '⚠️ غير مسجل دخول (هذا طبيعي)';
            }
        } catch (err: any) {
            newResults.authCheck = `❌ فشل: ${err.message}`;
        }

        setResults(newResults);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-red-500">🔍 صفحة التشخيص</h1>

                <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                    <h2 className="text-2xl font-bold mb-4">نتائج الفحص:</h2>

                    <div className="space-y-4">
                        <div className="p-4 bg-black/30 rounded-lg">
                            <h3 className="font-bold mb-2">1. فحص متغيرات البيئة (.env.local)</h3>
                            <p className="text-lg">{results.envCheck}</p>
                        </div>

                        <div className="p-4 bg-black/30 rounded-lg">
                            <h3 className="font-bold mb-2">2. فحص الاتصال بـ Supabase</h3>
                            <p className="text-lg">{results.connectionCheck}</p>
                        </div>

                        <div className="p-4 bg-black/30 rounded-lg">
                            <h3 className="font-bold mb-2">3. فحص الجداول</h3>
                            <p className="text-lg">{results.tablesCheck}</p>
                        </div>

                        <div className="p-4 bg-black/30 rounded-lg">
                            <h3 className="font-bold mb-2">4. فحص المصادقة</h3>
                            <p className="text-lg">{results.authCheck}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-3 text-yellow-500">📋 التعليمات:</h2>
                    <ul className="space-y-2 text-sm">
                        <li>• إذا فشل فحص متغيرات البيئة: راجع ملف <code className="bg-black/50 px-2 py-1 rounded">.env.local</code></li>
                        <li>• إذا فشل الاتصال: تأكد من صحة بيانات Supabase</li>
                        <li>• إذا فشل فحص الجداول: نفذ ملف <code className="bg-black/50 px-2 py-1 rounded">COMPLETE_FIX.sql</code> في Supabase</li>
                        <li>• راجع ملف <code className="bg-black/50 px-2 py-1 rounded">FIX_FAILED_TO_FETCH.md</code> للحصول على دليل كامل</li>
                    </ul>
                </div>

                <button
                    onClick={runDiagnostics}
                    className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                    🔄 إعادة الفحص
                </button>
            </div>
        </div>
    );
}
