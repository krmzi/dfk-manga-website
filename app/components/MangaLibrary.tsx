"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { Search, ChevronDown, Clock, Star, Filter, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const GENRES = ["Action", "Adventure", "Fantasy", "System", "Murim", "Magic", "Drama", "Romance", "Horror"];
const STATUS = ["Ongoing", "Completed", "Hiatus"];
const TYPES = ["Manhwa", "Manga", "Manhua"];

const getFlag = (code: string) => {
    if (code === "KR") return "https://cdn-icons-png.flaticon.com/512/197/197582.png";
    if (code === "CN") return "https://cdn-icons-png.flaticon.com/512/197/197375.png";
    if (code === "JP") return "https://cdn-icons-png.flaticon.com/512/197/197604.png";
    return null;
};

const BrowseCard = ({ id, title, cover_image, rating, status, country, latestChNum, slug }: any) => (
    <Link href={`/manga/${slug}`} className="group flex flex-col bg-[#0f0f10] border border-white/5 rounded-2xl overflow-hidden hover:border-red-600/40 hover:-translate-y-1 transition-all duration-300 shadow-lg">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1a1a1a]">
            <img
                src={cover_image || "/placeholder.jpg"} alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; e.currentTarget.onerror = null; }}
            />
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold border border-white/10 text-yellow-400 shadow-lg">
                <Star size={11} fill="currentColor" /> {rating || 0}
            </div>
            <div className="absolute top-3 left-3">
                <span className={`text-[10px] font-black px-2 py-1 rounded text-white shadow-lg uppercase tracking-wider ${status === 'Ongoing' ? 'bg-green-600' : 'bg-blue-600'}`}>
                    {status || 'Ongoing'}
                </span>
            </div>
        </div>
        <div className="p-4 flex flex-col gap-3 flex-1">
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-black text-lg leading-snug line-clamp-2 group-hover:text-red-500 transition-colors">{title}</h3>
                {getFlag(country) && <img src={getFlag(country)!} className="w-6 h-6 rounded-full border border-white/10" alt={country} />}
            </div>
            <div className="w-full h-px bg-white/5 mt-auto"></div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                <span className="bg-white/5 px-2 py-1 rounded text-gray-400 uppercase">{country === 'KR' ? 'MANHWA' : country === 'JP' ? 'MANGA' : 'MANHUA'}</span>
                <span className="flex items-center gap-1 text-gray-400"><Clock size={12} /> {latestChNum ? `فصل ${latestChNum}` : 'جديد'}</span>
            </div>
        </div>
    </Link>
);

function MangaFilterLogic({ initialMangas }: { initialMangas: any[] }) {
    const searchParams = useSearchParams();

    const [search, setSearch] = useState("");
    const [filterGenre, setFilterGenre] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterType, setFilterType] = useState("");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        const query = searchParams.get("search");
        if (query) {
            setSearch(query);
        }
    }, [searchParams]);

    const filteredMangas = useMemo(() => {
        return initialMangas.filter(manga => {
            const matchesSearch = manga.title.toLowerCase().includes(search.toLowerCase());

            let genres = [];
            if (Array.isArray(manga.genres)) genres = manga.genres;
            else if (typeof manga.genres === 'string') genres = [manga.genres];

            const matchesGenre = filterGenre ? genres.includes(filterGenre) : true;
            const matchesStatus = filterStatus ? manga.status === filterStatus : true;

            let mType = "";
            if (manga.country === 'KR') mType = "Manhwa";
            else if (manga.country === 'JP') mType = "Manga";
            else if (manga.country === 'CN') mType = "Manhua";
            const matchesType = filterType ? mType === filterType : true;

            return matchesSearch && matchesGenre && matchesStatus && matchesType;
        });
    }, [initialMangas, search, filterGenre, filterStatus, filterType]);

    const DropdownFilter = ({ label, currentVal, options, type }: any) => (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === type ? null : type); }}
                className={`px-5 h-12 bg-[#111] border rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap select-none ${currentVal ? 'text-red-500 border-red-600/50' : 'text-gray-400 border-white/10 hover:text-white hover:bg-[#161616]'}`}
            >
                {currentVal || label} <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === type ? "rotate-180" : ""}`} />
            </button>
            {openDropdown === type && (
                <div className="absolute top-14 left-0 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <button onClick={() => { if (type === 'genre') setFilterGenre(""); if (type === 'status') setFilterStatus(""); if (type === 'type') setFilterType(""); setOpenDropdown(null); }} className="text-right px-4 py-3 hover:bg-white/5 text-xs text-red-500 font-bold border-b border-white/5">إلغاء الفلتر</button>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {options.map((opt: string) => (
                            <button key={opt} onClick={() => { if (type === 'genre') setFilterGenre(opt); if (type === 'status') setFilterStatus(opt); if (type === 'type') setFilterType(opt); setOpenDropdown(null); }} className={`text-right w-full px-3 py-2.5 text-sm font-bold rounded-lg transition-colors ${currentVal === opt ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>{opt}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div onClick={() => setOpenDropdown(null)} className="min-h-screen">
            <div className="sticky top-20 z-40 bg-[#050505]/95 backdrop-blur-xl border-y border-white/5 py-4 mb-12 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors"><Search size={20} /></div>
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن عمل..." className="w-full h-12 bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-red-600/50 focus:bg-[#151515] transition-all font-bold text-right" />
                        {search && <button onClick={() => { setSearch(""); setFilterGenre(""); setFilterStatus(""); setFilterType(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={16} /></button>}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
                        <DropdownFilter label="التصنيف" type="genre" currentVal={filterGenre} options={GENRES} />
                        <DropdownFilter label="الحالة" type="status" currentVal={filterStatus} options={STATUS} />
                        <DropdownFilter label="النوع" type="type" currentVal={filterType} options={TYPES} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredMangas.length > 0 ? (
                    filteredMangas.map((manga: any) => <BrowseCard key={manga.id} {...manga} />)
                ) : (
                    <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-3xl bg-[#111]">
                        <div className="flex flex-col items-center gap-4 opacity-50">
                            <Filter size={48} />
                            <h3 className="text-xl font-bold text-white">لا توجد نتائج تطابق "{search}"</h3>
                            <button onClick={() => { setSearch(""); setFilterGenre(""); }} className="text-red-500 font-bold underline hover:text-red-400">إعادة تعيين الفلاتر</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MangaLibrary(props: { initialMangas: any[] }) {
    return (
        <Suspense fallback={<div className="text-white text-center py-20">جاري التحميل...</div>}>
            <MangaFilterLogic {...props} />
        </Suspense>
    );
}