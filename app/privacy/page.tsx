
import React from 'react';
import { Shield, Lock, Eye, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'سياسة الخصوصية - DFK Team',
    description: 'تعرف على سياسة الخصوصية وكيفية حماية بياناتك في موقع DFK Team.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#000000] text-gray-100 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black text-red-600">سياسة الخصوصية</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        خصوصيتكم تهمنا. نوضح هنا كيفية جمع واستخدام وحماية بياناتكم.
                    </p>
                </div>

                {/* Content */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-10 space-y-8">

                    <p className="text-gray-400 text-sm">
                        آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
                    </p>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <Shield size={24} />
                            <h2 className="text-2xl font-bold text-white">مقدمة</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            مرحباً بكم في DFK Team. نحن ندرك أهمية الخصوصية بالنسبة لكم ونلتزم بحماية المعلومات الشخصية التي تشاركونها معنا. توضح هذه السياسة ممارساتنا بخصوص جمع المعلومات واستخدامها عند استخدامكم لموقعنا.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white border-r-4 border-red-600 pr-4">المعلومات التي نجمعها</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 marker:text-red-500">
                            <li><strong>معلومات التصفح:</strong> مثل نوع الجهاز، المتصفح، عنوان IP، ووقت الزيارة.</li>
                            <li><strong>سجل التفاعل:</strong> الفصول التي تمت قراءتها، الصفحات التي تمت زيارتها، والمفضلة (إذا كنتم مسجلين).</li>
                            <li><strong>الكوكيز (ملفات تعريف الارتباط):</strong> نستخدم الكوكيز لتحسين تجربة المستخدم وتخصيص المحتوى.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white border-r-4 border-red-600 pr-4">استخدام المعلومات</h2>
                        <p className="text-gray-300 leading-relaxed">
                            نستخدم المعلومات التي نجمعها للأغراض التالية:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 marker:text-red-500">
                            <li>تحسين أداء الموقع وتجربة المستخدم.</li>
                            <li>تحليل الزيارات وفهم اهتمامات الجمهور.</li>
                            <li>عرض محتوى وإعلانات تناسب اهتماماتكم.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <Eye size={24} />
                            <h2 className="text-2xl font-bold text-white">إعلانات Google وخدمات الطرف الثالث</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            قد نستخدم شركات إعلان كطرف ثالث (مثل Google AdSense) لعرض الإعلانات عند زيارتكم لموقعنا. حق لهذه الشركات استخدام معلومات حول زيارتكم لهذا الموقع (باستثناء الاسم أو العنوان أو البريد الإلكتروني أو رقم الهاتف) وذلك من أجل تقديم إعلانات حول البضائع والخدمات التي تهمكم.
                        </p>
                        <p className="text-gray-300 leading-relaxed mt-2">
                            بصفتنا مورداً خارجياً، تستخدم Google ملفات تعريف الارتباط لعرض الإعلانات على موقعنا. يمكن للمستخدمين تعطيل استخدام ملفات تعريف الارتباط للإعلانات المخصصة من خلال زيارة إعدادات الإعلانات في Google.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white border-r-4 border-red-600 pr-4">حماية البيانات</h2>
                        <p className="text-gray-300 leading-relaxed">
                            نحن نتخذ إجراءات أمنية مناسبة لحماية بياناتكم من الوصول غير المصرح به أو التغيير أو الإفشاء أو الإتلاف. ومع ذلك، لا يمكن ضمان أمان نقل البيانات عبر الإنترنت بنسبة 100%.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-white/10">
                        <p className="text-gray-400 mb-4">
                            إذا كان لديكم أي أسئلة حول سياسة الخصوصية هذه، يمكنكم التواصل معنا عبر:
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
