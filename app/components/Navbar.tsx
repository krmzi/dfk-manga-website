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
    const [isAdmin, setIsAdmin] = useState(false); // هل هو مشرف؟
    const [showUserMenu, setShowUserMenu] = useState(false);

    // التحقق من الصلاحيات
    useEffect(() => {
        const checkUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // جلب الرتبة
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                // التحقق: هل هو أدمن أو سوبر أدمن؟
                const userRole = profile?.role;
                if (userRole === 'admin' || userRole === 'super_admin') {
                    setIsAdmin(true);
                }
            }
        };

        checkUserRole();

        // الاستماع لتغيرات تسجيل الدخول
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_OUT') {
                setIsAdmin(false);
                setShowUserMenu(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        setShowUserMenu(false);
        router.refresh();
        router.push('/login');
    };

    const isActive = (path: string) => pathname === path ? "text-red-500 font-black" : "text-gray-300 font-bold hover:text-white";

    const navLinks = [
        { name: "الرئيسية", path: "/" },
        { name: "قائمة المانهوا", path: "/manga" },
        { name: "المفضلة", path: "/bookmarks" },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 h-[72px] transition-all border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl shadow-lg">
            <div className="h-full w-full max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between">

                <div className="flex items-center gap-12">
                    <Link href="/" className="group flex items-center gap-1 select-none hover:scale-105 transition-transform">
                        <span className="text-2xl md:text-3xl font-black tracking-tighter text-white">DFK</span>
                        <span className="text-2xl md:text-3xl font-black tracking-tighter text-red-600">TEAM</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link key={link.path} href={link.path} className={`text-base transition-colors duration-300 ${isActive(link.path)}`}>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    {/* البحث */}
                    {/* مربع البحث الذكي */}
                    <div className="hidden md:flex items-center bg-[#151515] border border-white/10 rounded-full px-4 py-2 w-56 lg:w-64 hover:border-red-600/50 transition-all group focus-within:w-72 duration-300">
                        <Search size={18} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="ابحث عن عمل..."
                            className="bg-transparent border-none outline-none text-sm text-white mr-3 w-full placeholder-gray-600 font-bold text-right"
                            // ✅ التعديل هنا:
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = (e.currentTarget.value).trim();
                                    if (val) {
                                        router.push(`/manga?search=${encodeURIComponent(val)}`);

                                        // 1. تفريغ الخانة
                                        e.currentTarget.value = "";

                                        // 2. إزالة التركيز (لإبعاد الكيبورد أو المؤشر)
                                        e.currentTarget.blur();
                                    }
                                }
                            }}
                        />
                    </div>

                    {user ? (
                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 rounded-full pl-4 pr-1 py-1 transition-all">
                                <span className="text-xs font-bold text-white hidden sm:block max-w-[100px] truncate">{user.user_metadata.full_name || "الأدمن"}</span>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <ChevronDown size={14} className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                                    <div className="absolute top-12 left-0 w-56 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden flex flex-col p-1.5 animate-in fade-in zoom-in-95">
                                        <div className="px-3 py-2 border-b border-white/5 mb-1">
                                            <p className="text-xs text-gray-500 font-medium">مسجل بـ</p>
                                            <p className="text-xs text-white font-bold truncate">{user.email}</p>
                                        </div>

                                        <Link href="/bookmarks" onClick={() => setShowUserMenu(false)} className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg font-bold transition">
                                            المفضلة <Heart size={16} />
                                        </Link>

                                        {/* ✅ هذا هو الزر المفقود: يظهر الآن للأدمن والسوبر أدمن */}
                                        {isAdmin && (
                                            <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center justify-between px-3 py-2.5 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-500 rounded-lg font-black transition my-1 border border-red-500/20">
                                                لوحة التحكم <ShieldCheck size={16} />
                                            </Link>
                                        )}

                                        <div className="h-px bg-white/5 my-1" />
                                        <button onClick={handleLogout} className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-400 hover:text-red-500 hover:bg-white/5 rounded-lg font-bold w-full transition">
                                            <span>خروج</span> <LogOut size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link href="/login">
                            <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black rounded-full transition-all active:scale-95">
                                <User size={18} fill="currentColor" /> <span className="text-sm">دخول</span>
                            </button>
                        </Link>
                    )}

                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2.5 text-white bg-white/5 rounded-xl border border-white/5">{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
                </div>
            </div>
        </nav>
    );
}