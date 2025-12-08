"use client";
import { useState, Suspense } from 'react'; // ✅ إضافة Suspense
import { supabase } from '@/app/utils/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

// 1. قمنا بنقل منطق الصفحة بالكامل إلى هذا المكون الفرعي
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  // قراءة رابط العودة
  const nextUrl = searchParams.get('next') || '/';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password
        });

        if (error) throw error;

        // ✅ الحل الجذري: استخدام window.location للإجبار على الانتقال
        // هذا يضمن تحديث الكوكيز والتوكن قبل تحميل الصفحة التالية
        window.location.href = nextUrl;
        
    } catch (err: any) {
        setError(err.message || 'بيانات الدخول غير صحيحة');
        setLoading(false); // نوقف التحميل فقط في حال الخطأ
    } 
    // ملاحظة: لا نضع setLoading(false) في النجاح لأننا سننتقل لصفحة أخرى
  };
  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 animate-fade-in bg-[#050505]">
        <div className="w-full max-w-md space-y-8">
            
            <div className="text-center lg:text-right space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tighter">
                    أهلاً بعودتك <span className="text-red-600">يا صياد!</span>
                </h1>
                <p className="text-gray-400 font-medium">سجل دخولك لمتابعة مكتبتك المفضلة</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300">البريد الإلكتروني</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Mail className="text-gray-500 group-focus-within:text-red-600 transition-colors" size={20} />
                        </div>
                        <input 
                            type="email" required placeholder="name@example.com"
                            className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pr-12 pl-4 text-white placeholder-gray-600 focus:border-red-600 focus:bg-black outline-none transition-all font-medium text-right"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-300">كلمة المرور</label>
                        <Link href="#" className="text-xs font-bold text-red-500 hover:text-red-400">نسيت كلمة السر؟</Link>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Lock className="text-gray-500 group-focus-within:text-red-600 transition-colors" size={20} />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"} required placeholder="••••••••"
                            className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pr-12 pl-12 text-white placeholder-gray-600 focus:border-red-600 focus:bg-black outline-none transition-all font-medium text-right"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 hover:text-white transition"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold p-4 rounded-xl text-center">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>دخول <LogIn size={20} /></>}
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#222]"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050505] px-2 text-gray-500 font-bold">أو</span></div>
            </div>

            <div className="text-center">
                <p className="text-gray-400 font-medium">ليس لديك حساب؟{' '}
                    <Link href="/register" className="text-white font-bold hover:underline hover:text-red-500 transition">
                        إنشاء حساب جديد
                    </Link>
                </p>
            </div>
        </div>
    </div>
  );
}

// 2. المكون الأساسي (يغلف الفورم بـ Suspense لحل مشكلة الشاشة السوداء)
export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#050505] text-[#ededed]">
        
        {/* تغليف الفورم لحل مشكلة useSearchParams */}
        <Suspense fallback={<div className="w-full lg:w-1/2 flex items-center justify-center h-screen"><Loader2 className="animate-spin text-red-600" size={40} /></div>}>
            <LoginForm />
        </Suspense>

        {/* الجزء الأيسر: الصورة */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#111]">
            <img 
                src="https://images.alphacoders.com/134/1346105.jpeg" 
                className="w-full h-full object-cover opacity-60 mix-blend-overlay hover:scale-105 transition-transform duration-[10s]"
                alt="Login Visual"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
            
            <div className="absolute bottom-16 right-16 left-16 z-10 text-right">
                <blockquote className="space-y-4">
                    <p className="text-3xl font-black text-white leading-tight">
                        "لا تتوقف عن التطور، القوة الحقيقية تأتي لأولئك الذين يستمرون بالمحاولة."
                    </p>
                    <footer className="text-red-500 font-bold text-lg">— سونغ جين-وو</footer>
                </blockquote>
            </div>
        </div>

    </div>
  );
}
