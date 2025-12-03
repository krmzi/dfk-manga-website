import Link from "next/link";
import { Heart, BookOpen, Home, Library, Mail } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-gradient-to-b from-[#050505] to-[#000000] border-t border-white/5 pt-12 pb-20 md:pb-8 mt-20">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">

                    {/* Brand Section */}
                    <div className="col-span-1 text-center md:text-right">
                        <Link href="/" className="inline-block mb-4 md:mb-6 group">
                            <span className="text-3xl md:text-4xl font-black text-white group-hover:text-red-600 transition-colors">
                                DFK<span className="text-red-600 group-hover:text-white">TEAM</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium max-w-sm mx-auto md:mx-0">
                            أفضل منصة عربية لقراءة المانهوا والمانجا بجودة عالية
                        </p>

                        {/* Stats - Mobile & Desktop */}
                        <div className="hidden md:flex gap-6 mt-6 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span>متاح الآن</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart size={12} className="text-red-500" />
                                <span>مجاني بالكامل</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1 text-center md:text-right">
                        <h4 className="text-white font-black mb-4 md:mb-6 text-lg">روابط سريعة</h4>
                        <ul className="flex flex-col gap-3 text-sm md:text-base">
                            <li>
                                <Link
                                    href="/"
                                    className="text-gray-400 hover:text-red-500 transition-colors font-medium flex items-center justify-center md:justify-start gap-2 group min-h-[44px] md:min-h-0"
                                >
                                    <Home size={16} className="group-hover:scale-110 transition-transform" />
                                    الرئيسية
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/manga"
                                    className="text-gray-400 hover:text-red-500 transition-colors font-medium flex items-center justify-center md:justify-start gap-2 group min-h-[44px] md:min-h-0"
                                >
                                    <Library size={16} className="group-hover:scale-110 transition-transform" />
                                    قائمة المانهوا
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/bookmarks"
                                    className="text-gray-400 hover:text-red-500 transition-colors font-medium flex items-center justify-center md:justify-start gap-2 group min-h-[44px] md:min-h-0"
                                >
                                    <Heart size={16} className="group-hover:scale-110 transition-transform" />
                                    المفضلة
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-1 text-center md:text-right">
                        <h4 className="text-white font-black mb-4 md:mb-6 text-lg">تواصل معنا</h4>
                        <div className="flex flex-col gap-3">
                            <a
                                href="mailto:contact@dfkteam.com"
                                className="text-gray-400 hover:text-red-500 transition-colors font-medium flex items-center justify-center md:justify-start gap-2 group min-h-[44px] md:min-h-0"
                            >
                                <Mail size={16} className="group-hover:scale-110 transition-transform" />
                                contact@dfkteam.com
                            </a>

                            {/* Social Buttons - Compact */}
                            <div className="flex gap-3 justify-center md:justify-start mt-2">
                                <SocialButton
                                    href="https://twitter.com"
                                    label="Twitter"
                                    icon={
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    }
                                />
                                <SocialButton
                                    href="https://instagram.com"
                                    label="Instagram"
                                    icon={
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    }
                                />
                                <SocialButton
                                    href="https://github.com"
                                    label="GitHub"
                                    icon={
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm">
                    <p className="text-gray-500 font-medium text-center md:text-right">
                        © {currentYear} <span className="text-white font-bold">DFK Team</span>. جميع الحقوق محفوظة
                    </p>
                    <p className="text-gray-600 font-medium flex items-center gap-2">
                        صنع بـ <Heart size={14} className="text-red-500 animate-pulse" fill="currentColor" /> لعشاق المانهوا
                    </p>
                </div>

                {/* Mobile Bottom Spacing */}
                <div className="h-4 md:hidden"></div>
            </div>
        </footer>
    );
}

function SocialButton({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-10 h-10 md:w-9 md:h-9 rounded-lg bg-[#111] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all hover:scale-110 active:scale-95"
        >
            {icon}
        </a>
    );
}