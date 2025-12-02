"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Menu, User, X, LogOut, ChevronDown, ShieldCheck, Heart } from "lucide-react";
import { supabase } from "@/app/utils/supabase";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // جلب بيانات المستخدم ودوره
    useEffect(() => {
        const getUserAndRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // جلب الدور من جدول profiles
                const { data: profile } = await supabase
                    .from('profiles' as any)
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserRole((profile as any).role);
                }
            }
        };

        getUserAndRole();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles' as any)
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                if (profile) setUserRole((profile as any).role);
            } else {
                setUserRole(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
        window.location.reload();
    };

    // التحقق من الصلاحية
    const canAccessDashboard = userRole === 'super_admin' || userRole === 'admin' || userRole === 'editor';

    return (
        <nav className="fixed top-0 w-full z-50 h-[72px] bg-[#050505]/90 backdrop-blur-xl shadow-lg border-b border-white/5">
            <div className="h-full w-full max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    <Link href="/" className="text-2xl font-black text-white">DFK<span className="text-red-600">TEAM</span></Link>
                    {/* روابط سطح المكتب */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link href="/" className="text-gray-300 font-bold hover:text-white">الرئيسية</Link>
                        <Link href="/manga" className="text-gray-300 font-bold hover:text-white">قائمة المانهوا</Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* منطقة المستخدم */}
                    {user ? (
                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-white/10">
                                <span className="text-xs font-bold text-white truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
                                <ChevronDown size={14} className="text-gray-500" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute top-12 left-0 w-56 bg-[#111] border border-white/10 rounded-xl p-1 z-50 shadow-xl">
                                    {/* عرض الزر بناءً على الصلاحية */}
                                    {canAccessDashboard && (
                                        <Link href="/admin" className="flex items-center gap-2 px-3 py-2.5 mb-1 text-sm font-bold text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
                                            <ShieldCheck size={16} /> لوحة التحكم
                                        </Link>
                                    )}
                                    <Link href="/bookmarks" className="flex items-center gap-2 px-3 py-2.5 mb-1 text-sm font-bold text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                                        <Heart size={16} /> المفضلة
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 w-full text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                        <LogOut size={16} /> خروج
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-sm hover:bg-red-700 transition-colors">دخول</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}