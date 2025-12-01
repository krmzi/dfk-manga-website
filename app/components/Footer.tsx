import Link from "next/link";
import { Twitter, Instagram, Github, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#020202] border-t border-white/5 pt-16 pb-8 mt-20">
      <div className="max-w-[1400px] mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* 1. البراند والوصف */}
            <div className="col-span-1 md:col-span-1">
                <Link href="/" className="block mb-6">
                    <span className="text-3xl font-black text-white">DFK<span className="text-red-600">TEAM</span></span>
                </Link>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    أفضل منصة عربية لقراءة المانهوا والمانجا بجودة عالية. تحديثات يومية وسيرفرات سريعة.
                </p>
            </div>

            {/* 2. روابط سريعة */}
            <div>
                <h4 className="text-white font-bold mb-6">تصفح</h4>
                <ul className="flex flex-col gap-3 text-sm text-gray-500 font-medium">
                    <li><Link href="#" className="hover:text-red-500 transition-colors">الرئيسية</Link></li>
                    <li><Link href="#" className="hover:text-red-500 transition-colors">قائمة المانهوا</Link></li>
                    <li><Link href="#" className="hover:text-red-500 transition-colors">إصدارات جديدة</Link></li>
                    <li><Link href="#" className="hover:text-red-500 transition-colors">المفضلة</Link></li>
                </ul>
            </div>

             {/* 3. الدعم */}
             <div>
                <h4 className="text-white font-bold mb-6">الدعم</h4>
                <ul className="flex flex-col gap-3 text-sm text-gray-500 font-medium">
                    <li><Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">شروط الاستخدام</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">تواصل معنا</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">DMCA</Link></li>
                </ul>
            </div>

            {/* 4. التواصل الاجتماعي */}
            <div>
                <h4 className="text-white font-bold mb-6">تابعنا</h4>
                <div className="flex gap-3">
                    <SocialBtn icon={<Twitter size={18} />} />
                    <SocialBtn icon={<Instagram size={18} />} />
                    <SocialBtn icon={<Globe size={18} />} />
                </div>
            </div>
        </div>

        {/* الحقوق */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600 font-bold">
            <p>© 2025 DFK Team. All rights reserved.</p>
            <p>Made with ❤️ for Manga Lovers</p>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ icon }: { icon: any }) {
    return (
        <button className="w-10 h-10 rounded-lg bg-[#111] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
            {icon}
        </button>
    )
}