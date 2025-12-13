
import React from 'react';
import { Mail, Info } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'من نحن - DFK Team',
    description: 'تعرف على فريق DFK Team، المنصة الرائدة لترجمة المانهوا والمانجا العربية.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#000000] text-gray-100 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black text-red-600">من نحن</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        تعرف على فريق DFK والرسالة التي نسعى لتحقيقها
                    </p>
                </div>

                {/* Content */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-10 space-y-8">

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <Info size={24} />
                            <h2 className="text-2xl font-bold text-white">من هي DFK Team؟</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            نحن منصة عربية رائدة متخصصة في ترجمة وعرض المانهوا والمانجا بجودة عالية.
                            تأسس فريق DFK Team بهدف سد الفجوة في المحتوى العربي وتوفير تجربة قراءة فريدة وممتعة للقارئ العربي.
                            نؤمن بأن القصص المصورة هي وسيلة رائعة للترفيه والثقافة، ونسعى جاهدين لتقديم أفضل الأعمال العالمية بلغة عربية سليمة وواضحة.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white border-r-4 border-red-600 pr-4">رؤيتنا</h2>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            نطمح لأن نكون المصدر الأول والموثوق لكل عشاق المانهوا والمانجا في العالم العربي.
                            نركز على الجودة، السرعة، وسهولة الاستخدام في موقعنا لضمان أفضل تجربة للمستخدم.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white border-r-4 border-red-600 pr-4">ماذا نقدم؟</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 text-lg marker:text-red-500">
                            <li>ترجمات حصرية واحترافية لأحدث الأعمال.</li>
                            <li>جودة صور عالية وتجربة تصفح سلسة.</li>
                            <li>موقع متوافق مع جميع الأجهزة (هواتف، أجهزة لوحية، حواسيب).</li>
                            <li>تحديثات يومية ومستمرة للفصول.</li>
                        </ul>
                    </section>

                    <section className="pt-8 border-t border-white/10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0a0a0a] p-6 rounded-xl border border-white/5">
                            <div className="text-center md:text-right">
                                <h3 className="text-xl font-bold text-white mb-2">تواصل معنا</h3>
                                <p className="text-gray-400">لديك استفسار أو اقتراح؟ لا تتردد في مراسلتنا</p>
                            </div>
                            <a
                                href="mailto:ymcreation2020@gmail.com"
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                            >
                                <Mail size={20} />
                                ymcreation2020@gmail.com
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
