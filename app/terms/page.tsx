
import React from 'react';
import { Gavel, AlertTriangle, FileText, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'شروط الاستخدام - DFK Team',
    description: 'اقرأ شروط الاستخدام والقوانين الخاصة بموقع DFK Team.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#000000] text-gray-100 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black text-red-600">شروط الاستخدام</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        يرجى قراءة هذه الشروط بعناية قبل استخدام موقع DFK Team
                    </p>
                </div>

                {/* Content */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-10 space-y-8">

                    <p className="text-gray-400 text-sm">
                        آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
                    </p>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <FileText size={24} />
                            <h2 className="text-2xl font-bold text-white">قبول الشروط</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            بوصولك واستخدامك لموقع DFK Team، فإنك تقر بأنك قرأت وفهمت ووافقت على الالتزام بشروط الاستخدام هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام الموقع.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white border-r-4 border-red-600 pr-4">الاستخدام المسموح به</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 marker:text-red-500">
                            <li>المحتوى المتوفر على الموقع مخصص للاستخدام الشخصي وغير التجاري.</li>
                            <li>يمنع نسخ أو توزيع أو تعديل أو بيع أي جزء من المحتوى دون إذن مسبق.</li>
                            <li>يجب استخدام الموقع بطريقة قانونية وعدم استخدامه في أي أنشطة ضارة أو احتيالية.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white border-r-4 border-red-600 pr-4">حقوق الملكية الفكرية</h2>
                        <p className="text-gray-300 leading-relaxed">
                            جميع الحقوق الفكرية للأعمال المترجمة تعود لأصحابها الأصليين (المؤلفين والرسامين والناشرين). DFK Team هو فريق ترجمة غير ربحي يهدف لنشر الثقافة ومساعدة القراء العرب على الوصول لهذه الأعمال. إذا كنت صاحب حق وترغب في إزالة عملك، يرجى التواصل معنا.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle size={24} />
                            <h2 className="text-2xl font-bold text-white">إخلاء المسؤولية</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            يتم توفير الموقع والمحتوى "كما هو" ودون أي ضمانات صريحة أو ضمنية. لا نضمن أن الموقع سيكون خاليًا من الأخطاء أو التوقفات، ولا نتحمل مسؤولية أي أضرار قد تنشأ عن استخدامك للموقع.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white border-r-4 border-red-600 pr-4">التعديلات على الشروط</h2>
                        <p className="text-gray-300 leading-relaxed">
                            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات هنا، ويُعتبر استمرارك في استخدام الموقع بعد نشر التعديلات قبولاً لها.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-white/10">
                        <p className="text-gray-400 mb-4">
                            للتواصل بخصوص شروط الاستخدام أو الإبلاغ عن انتهاكات:
                        </p>
                        <a
                            href="mailto:ymcreation2020@gmail.com"
                            className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-bold transition-colors"
                        >
                            <Mail size={18} />
                            ymcreation2020@gmail.com
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}
