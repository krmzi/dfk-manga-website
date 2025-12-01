"use client";
import { useState } from 'react';
import { supabase } from '@/app/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, UserPlus, Loader2, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);

    try {
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { full_name: form.name } // حفظ الاسم
            }
        });

        if (error) throw error;
        
        alert('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
        router.push('/login');
        
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-[#ededed]">
        
        {/* الفورم */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 animate-fade-in">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center lg:text-right space-y-2">
                    <h1 className="text-4xl font-black text-white">انضم إلى <span className="text-red-600">الفريق!</span></h1>
                    <p className="text-gray-400 font-medium">أنشئ حساباً مجانياً وابدأ رحلتك.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">الاسم الكامل</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <User className="text-gray-500 group-focus-within:text-red-600" size={20} />
                            </div>
                            <input type="text" required placeholder="اكتب اسمك..."
                                className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pr-12 pl-4 focus:border-red-600 outline-none text-white transition-all font-medium"
                                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">البريد الإلكتروني</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <Mail className="text-gray-500 group-focus-within:text-red-600" size={20} />
                            </div>
                            <input type="email" required placeholder="name@example.com"
                                className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pr-12 pl-4 focus:border-red-600 outline-none text-white transition-all font-medium"
                                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">كلمة المرور</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <Lock className="text-gray-500 group-focus-within:text-red-600" size={20} />
                            </div>
                            <input type="password" required placeholder="••••••••" minLength={6}
                                className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pr-12 pl-4 focus:border-red-600 outline-none text-white transition-all font-medium"
                                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}

                    <button type="submit" disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <>إنشاء حساب <UserPlus size={20} /></>}
                    </button>
                </form>

                <div className="text-center text-gray-400 font-medium">
                    لديك حساب بالفعل؟ <Link href="/login" className="text-white font-bold hover:underline">سجل دخولك</Link>
                </div>
            </div>
        </div>

        <div className="hidden lg:flex w-1/2 relative bg-[#111]">
            <img src="https://images.alphacoders.com/132/1328639.png" className="w-full h-full object-cover opacity-50" alt="Register Visual" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
        </div>
    </div>
  );
}