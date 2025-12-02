"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BookOpen, User, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";

export default function MobileBottomNav() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: "الرئيسية", path: "/", icon: Home },
        { name: "بحث", path: "/manga?search=", icon: Search },
        { name: "المانهوا", path: "/manga", icon: BookOpen },
        { name: "المفضلة", path: "/bookmarks", icon: Heart },
        { name: "حسابي", path: user ? "/profile" : "/login", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
            {/* Blur Backdrop */}
            <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"></div>

            <div className="relative flex justify-around items-center h-[70px] px-2 pb-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${active ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-red-500/10 -translate-y-1' : ''}`}>
                                <Icon size={active ? 24 : 22} strokeWidth={active ? 2.5 : 2} />
                                {active && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold ${active ? 'opacity-100' : 'opacity-0 scale-0'} transition-all duration-300 absolute bottom-1.5`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
