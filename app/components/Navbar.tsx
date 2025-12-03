"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, ChevronDown, ShieldCheck, Heart, Home, BookOpen, User as UserIcon } from "lucide-react";
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

    // إغلاق القوائم عند تغيير الصفحة
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setShowUserMenu(false);
    }, [pathname]);

    // منع scroll عند فتح القائمة المحمولة
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
        setIsMobileMenuOpen(false);
        window.location.reload();
    };

    const canAccessDashboard = userRole === 'super_admin' || userRole === 'admin' || userRole === 'editor';

    const navLinks = [
        { name: "الرئيسية", path: "/", icon: Home },
        { name: "قائمة المانهوا", path: "/manga", icon: BookOpen },
    ];

    return (
        <>
            <nav className="fixed top-0 w-full z-[100] h-[64px] md:h-[72px] bg-[#050505]/90 backdrop-blur-xl shadow-lg border-b border-white/5">
                <div className="h-full w-full max-w-[1600px] mx-auto px-3 md:px-8 flex items-center justify-between">
                    {/* Logo + Desktop Links */}
                    <div className="flex items-center gap-4 md:gap-12">
                        <Link href="/" className="text-xl md:text-2xl font-black text-white">
                            DFK<span className="text-red-600">TEAM</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    className={`font-bold transition-colors ${pathname === link.path
                                        ? 'text-red-500'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: User Menu + Mobile Hamburger */}
                    <div className="flex items-center gap-3">
                        {/* Desktop User Menu */}
                        <div className="hidden md:block">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-all min-h-[44px]"
                                    >
                                        <span className="text-sm font-bold text-white truncate max-w-[120px]">
                                            {user.email?.split('@')[0]}
                                        </span>
                                        <ChevronDown size={16} className="text-gray-500" />
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowUserMenu(false)}
                                            />
                                            <div className="absolute top-14 left-0 w-56 bg-[#111] border border-white/10 rounded-xl p-1 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                                {canAccessDashboard && (
                                                    <Link
                                                        href="/admin"
                                                        className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-bold text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <ShieldCheck size={18} /> لوحة التحكم
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/bookmarks"
                                                    className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-bold text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                                                >
                                                    <Heart size={18} /> المفضلة
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                >
                                                    <LogOut size={18} /> خروج
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="bg-red-600 text-white px-6 py-2.5 rounded-full font-black text-sm hover:bg-red-700 transition-colors min-h-[44px] flex items-center"
                                >
                                    دخول
                                </Link>
                            )}
                        </div>

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-white/20 transition-all active:scale-95"
                            aria-label="القائمة"
                        >
                            {isMobileMenuOpen ? (
                                <X size={24} className="text-white" />
                            ) : (
                                <Menu size={24} className="text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer Menu */}
            {isMobileMenuOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="fixed top-0 right-0 h-full w-[280px] bg-[#0a0a0a] border-l border-white/10 z-50 lg:hidden shadow-2xl animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/10">
                            <Link href="/" className="text-xl font-black text-white">
                                DFK<span className="text-red-600">TEAM</span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors active:scale-95"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        {/* User Section */}
                        <div className="px-6 py-6 border-b border-white/5">
                            {user ? (
                                <div className="space-y-3">
                                    <Link href="/profile" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors active:scale-95">
                                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                                            <UserIcon size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">
                                                {user.email?.split('@')[0]}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {userRole === 'super_admin' ? 'مدير عام' : userRole === 'admin' ? 'مدير' : 'عضو'}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-colors active:scale-95"
                                >
                                    <UserIcon size={18} />
                                    تسجيل الدخول
                                </Link>
                            )}
                        </div>

                        {/* Navigation Links */}
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map(link => {
                                const Icon = link.icon;
                                const isActive = pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        href={link.path}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all active:scale-95 ${isActive
                                            ? 'bg-red-600 text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {user && (
                                <>
                                    {canAccessDashboard && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all active:scale-95"
                                        >
                                            <ShieldCheck size={20} />
                                            لوحة التحكم
                                        </Link>
                                    )}
                                    <Link
                                        href="/bookmarks"
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all active:scale-95 ${pathname === '/bookmarks'
                                            ? 'bg-red-600 text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Heart size={20} />
                                        المفضلة
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Logout Button */}
                        {user && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all active:scale-95"
                                >
                                    <LogOut size={20} />
                                    تسجيل الخروج
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}