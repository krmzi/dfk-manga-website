"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import { Upload, Plus, Image as ImageIcon, Loader2, Save, Users, Shield, Search, Trash2, List, ArrowRight, XCircle, Edit, FolderArchive, X } from 'lucide-react';
import { supabase } from '@/app/utils/supabase';

const AVAILABLE_GENRES = ["Action", "Adventure", "Fantasy", "System", "Murim", "Magic", "Drama", "Romance", "Horror", "Mystery", "Supernatural", "Sci-Fi"];

interface MangaOption { id: string; title: string; cover_image?: string | null; description?: string | null; country?: string; status?: string | null; rating?: number; genres?: string[]; bg_image?: string | null; slug?: string; }
interface ChapterOption { id: string; chapter_number: number; created_at: string; images: string[]; }

export default function AdminDashboard() {
  const router = useRouter();
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'add-manga' | 'upload-chapter' | 'bulk-upload' | 'manage-content' | 'manage-team'>('add-manga');
  const [mangaList, setMangaList] = useState<MangaOption[]>([]);

  const [selectedMangaId, setSelectedMangaId] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [chapterImages, setChapterImages] = useState<File[]>([]);
  const [chapterUploading, setChapterUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  const [mangaForm, setMangaForm] = useState({ title: '', description: '', country: 'KR', status: 'Ongoing', rating: '0.0' });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const chapterInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [contentMangas, setContentMangas] = useState<MangaOption[]>([]);
  const [viewingMangaId, setViewingMangaId] = useState<string | null>(null);
  const [mangaChapters, setMangaChapters] = useState<ChapterOption[]>([]);
  const [searchManga, setSearchManga] = useState('');
  const [editingChapter, setEditingChapter] = useState<ChapterOption | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [bulkTotal, setBulkTotal] = useState(0);

  const [bulkCurrent, setBulkCurrent] = useState(0);

  // EDIT MANGA STATE
  const [editingManga, setEditingManga] = useState<MangaOption | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', country: 'KR', status: 'Ongoing', rating: '0.0', genres: [] as string[] });
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const editCoverInputRef = useRef<HTMLInputElement>(null);
  const editBgInputRef = useRef<HTMLInputElement>(null);

  // IMAGE COMPRESSOR
  const compressImage = async (file: File | Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 800;
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) { reject("Canvas error"); return; }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Compression failed");
          URL.revokeObjectURL(url);
        }, 'image/webp', 0.75);
      };

      img.onerror = reject;
      img.src = url;
    });
  };

  const uploadToCloudinary = async (file: File | Blob) => {
    const compressedFile = await compressImage(file);

    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('upload_preset', 'manga_upload');

    const res = await fetch(`https://api.cloudinary.com/v1_1/dilcisoms/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error("فشل الرفع");
    const data = await res.json();
    return data.secure_url;
  };

  const fetchMangaList = async () => {
    const { data } = await supabase
      .from('mangas')
      .select('id, title')
      .order('title');
    if (data) setMangaList(data as unknown as MangaOption[]);
  };

  const fetchUsersList = async () => {
    const { data } = await supabase
      .from('profiles' as any)
      .select('*');
    if (data) setUsersList(data);
  };

  const fetchContentMangas = async () => {
    const { data } = await supabase
      .from('mangas')
      .select('id, title, cover_image')
      .order('created_at', { ascending: false });
    if (data) setContentMangas(data as unknown as MangaOption[]);
  };

  const fetchMangaChapters = async (mangaId: string) => {
    const { data } = await supabase
      .from('chapters')
      .select('*')
      .eq('manga_id', mangaId)
      .order('chapter_number', { ascending: false });
    if (data) setMangaChapters(data as unknown as ChapterOption[]);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    await supabase.from('profiles' as any).update({ role: newRole }).eq('id', userId);
    fetchUsersList();
  };

  const deleteManga = async (id: string) => {
    if (confirm("حذف؟")) {
      await supabase.from('mangas').delete().eq('id', id);
      fetchContentMangas();
      setViewingMangaId(null);
    }
  };

  const deleteChapter = async (id: string) => {
    if (confirm("حذف؟")) {
      await supabase.from('chapters').delete().eq('id', id);
      if (viewingMangaId) fetchMangaChapters(viewingMangaId);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) setCoverPreview(URL.createObjectURL(file)); };
  const toggleGenre = (genre: string) => { if (selectedGenres.includes(genre)) setSelectedGenres(prev => prev.filter(g => g !== genre)); else { if (selectedGenres.length >= 5) return alert("5 حد أقصى"); setSelectedGenres(prev => [...prev, genre]); } };
  const openEditChapter = (chapter: ChapterOption) => { setEditingChapter(chapter); setEditingImages(chapter.images || []); };
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...editingImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setEditingImages(newImages);
    }
  };
  const removeImage = (index: number) => {
    if (!confirm("حذف؟")) return;
    setEditingImages(editingImages.filter((_, i) => i !== index));
  };
  const saveReorder = async () => {
    if (!editingChapter) return;
    await supabase.from('chapters').update({ images: editingImages }).eq('id', editingChapter.id);
    alert("تم ✅");
    setEditingChapter(null);
    if (viewingMangaId) fetchMangaChapters(viewingMangaId);
  };

  // EDIT MANGA FUNCTIONS
  const handleEditMangaClick = async (manga: MangaOption) => {
    // Fetch full details
    const { data } = await supabase.from('mangas').select('*').eq('id', manga.id).single();
    if (data) {
      setEditingManga(data);
      setEditForm({
        title: data.title,
        description: data.description || '',
        country: data.country || 'KR',
        status: data.status || 'Ongoing',
        rating: data.rating?.toString() || '0.0',
        genres: (data as any).genres || []
      });
      setEditCoverPreview(data.cover_image);
    }
  };

  const saveMangaChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManga) return;

    setUploading(true);
    try {
      let coverUrl = editingManga.cover_image;
      let bgUrl = editingManga.bg_image;

      if (editCoverInputRef.current?.files?.[0]) {
        coverUrl = await uploadToCloudinary(editCoverInputRef.current.files[0]);
      }
      if (editBgInputRef.current?.files?.[0]) {
        bgUrl = await uploadToCloudinary(editBgInputRef.current.files[0]);
      }

      const cleanSlug = editForm.title.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

      await supabase.from('mangas').update({
        title: editForm.title,
        slug: cleanSlug,
        description: editForm.description,
        country: editForm.country,
        status: editForm.status,
        rating: parseFloat(editForm.rating),
        genres: editForm.genres,
        cover_image: coverUrl,
        bg_image: bgUrl
      }).eq('id', editingManga.id);

      alert("✅ تم تحديث المانهوا بنجاح!");
      setEditingManga(null);
      fetchContentMangas();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleEditGenre = (genre: string) => {
    if (editForm.genres.includes(genre)) {
      setEditForm(prev => ({ ...prev, genres: prev.genres.filter(g => g !== genre) }));
    } else {
      if (editForm.genres.length >= 5) return alert("5 حد أقصى");
      setEditForm(prev => ({ ...prev, genres: [...prev.genres, genre] }));

      // ✅ تم تحديث دالة الرفع الجماعي لتستخدم المنطق المحسن (Regex + Sorting)
      const handleBulkUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        const zipFile = zipInputRef.current?.files?.[0];
        if (!selectedMangaId || !zipFile) return alert("البيانات ناقصة");

        setChapterUploading(true);
        try {
          const zip = new JSZip();
          const content = await zip.loadAsync(zipFile);
          const chaptersMap: Record<string, any[]> = {};

          Object.keys(content.files).forEach(path => {
            const file = content.files[path];
            // تجاهل المجلدات والملفات المخفية
            if (!file.dir && !path.includes('__MACOSX') && !path.includes('.DS_Store')) {
              const parts = path.split('/');
              const folderName = parts[0];
              // ✅ استخدام Regex المحسن لاستخراج رقم الفصل
              const match = folderName.match(/(\d+(\.\d+)?)/);

              if (match) {
                const num = match[0];
                if (!chaptersMap[num]) chaptersMap[num] = [];
                chaptersMap[num].push(file);
              }
            }
          });

          const chapterNumbers = Object.keys(chaptersMap).sort((a, b) => parseFloat(a) - parseFloat(b));
          if (chapterNumbers.length === 0) throw new Error("لم يتم العثور على مجلدات مرقمة داخل ZIP");

          setBulkTotal(chapterNumbers.length);

          for (let i = 0; i < chapterNumbers.length; i++) {
            const chNum = chapterNumbers[i];
            setBulkCurrent(i + 1);

            // ✅ ترتيب الصور داخل الفصل لضمان التسلسل الصحيح
            const files = chaptersMap[chNum].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

            // ✅ رفع الصور بشكل متوازي (5 صور في نفس الوقت)
            const BATCH_SIZE = 5;
            const uploadedUrls: string[] = [];

            for (let j = 0; j < files.length; j += BATCH_SIZE) {
              const batch = files.slice(j, j + BATCH_SIZE);
              setUploadStatus(`رفع فصل ${chNum}: ${j + 1}-${Math.min(j + BATCH_SIZE, files.length)}/${files.length}`);

              // رفع الدفعة بشكل متوازي
              const batchUrls = await Promise.all(
                batch.map(async (file) => {
                  const blob = await file.async('blob');
                  return uploadToCloudinary(blob);
                })
              );

              uploadedUrls.push(...batchUrls);
            }
            await supabase.from('chapters').insert({
              manga_id: selectedMangaId,
              chapter_number: parseFloat(chNum),
              slug: `${chNum}`,
              images: uploadedUrls
            });
          }
          alert("✅ تم الرفع بنجاح!");
          if (zipInputRef.current) zipInputRef.current.value = '';
        } catch (err: any) { alert(err.message); }
        finally { setChapterUploading(false); setBulkTotal(0); setBulkCurrent(0); setUploadStatus(""); }
      };

      // ✅ تم تحسين توليد الـ Slug
      const handleAddManga = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mangaForm.title || !coverInputRef.current?.files?.[0]) return alert("بيانات ناقصة");
        setUploading(true);
        try {
          const coverUrl = await uploadToCloudinary(coverInputRef.current.files[0]);
          let bgUrl = coverUrl;
          if (bgInputRef.current?.files?.[0]) bgUrl = await uploadToCloudinary(bgInputRef.current.files[0]);

          // ✅ تحسين توليد الـ Slug بإضافة trim
          const cleanSlug = mangaForm.title.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

          await supabase.from('mangas').insert({
            title: mangaForm.title, slug: cleanSlug, description: mangaForm.description,
            cover_image: coverUrl, bg_image: bgUrl, country: mangaForm.country,
            status: mangaForm.status, rating: parseFloat(mangaForm.rating), genres: selectedGenres
          });
          alert("✅ تم!");
          setMangaForm({ title: '', description: '', country: 'KR', status: 'Ongoing', rating: '0.0' });
          setSelectedGenres([]); setCoverPreview(null);
          fetchMangaList();
        } catch (err: any) { alert(err.message); } finally { setUploading(false); }
      };

      const handleUploadChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMangaId || !chapterNum || chapterImages.length === 0) return alert("بيانات ناقصة");
        setChapterUploading(true);
        try {
          const urls = [];
          for (let i = 0; i < chapterImages.length; i++) {
            setUploadStatus(`رفع صورة ${i + 1}/${chapterImages.length}`);
            setUploadProgress(Math.round(((i + 1) / chapterImages.length) * 100));
            urls.push(await uploadToCloudinary(chapterImages[i]));
          }
          await supabase.from('chapters').insert({
            manga_id: selectedMangaId, chapter_number: parseFloat(chapterNum), slug: `${chapterNum}`, images: urls
          });
          alert("✅ تم النشر!");
          setChapterNum(''); setChapterImages([]);
        } catch (e: any) { alert(e.message) } finally { setChapterUploading(false); setUploadStatus(""); }
      };

      if (loadingCheck) return (
        <div className="h-screen bg-black flex items-center justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-red-900/20 via-black to-black animate-pulse"></div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative">
              <Loader2 className="animate-spin text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)]" size={56} />
              <div className="absolute inset-0 animate-ping"><Loader2 className="text-red-600/30" size={56} /></div>
            </div>
            <p className="text-xl font-bold text-gray-400 animate-pulse">جاري التحميل...</p>
          </div>
        </div>
      );

      return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-20 relative overflow-hidden" dir="rtl">
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-green-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative w-full bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#111] p-8 rounded-3xl border border-[#222] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.05)] hover:shadow-[0_12px_48px_rgba(220,38,38,0.2)] transition-all duration-500">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                      <div className="relative bg-gradient-to-br from-red-600 to-red-800 p-4 rounded-2xl">
                        <Shield className="text-white" size={36} />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        إدارة الفريق والمحتوى
                      </h1>
                      <p className="text-gray-400 mt-1 font-bold text-sm flex items-center gap-2">
                        <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">⚡ النسخة الاقتصادية</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-yellow-500 uppercase">{currentUserRole.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button onClick={() => { setActiveTab('bulk-upload'); setViewingMangaId(null); }} className={`tab-btn ${activeTab === 'bulk-upload' ? 'bg-green-600 text-white' : 'bg-[#111] text-gray-500'}`}>
                <FolderArchive size={18} /> رفع مضغوط (Bulk)
              </button>
              <button onClick={() => { setActiveTab('upload-chapter'); setViewingMangaId(null); }} className={`tab-btn ${activeTab === 'upload-chapter' ? 'bg-blue-600 text-white' : 'bg-[#111] text-gray-500'}`}>
                <Upload size={18} /> رفع فردي
              </button>
              {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && (
                <>
                  <button onClick={() => { setActiveTab('add-manga'); setViewingMangaId(null); }} className={`tab-btn ${activeTab === 'add-manga' ? 'bg-red-600 text-white' : 'bg-[#111] text-gray-500'}`}>
                    <Plus size={18} /> إضافة عمل
                  </button>
                  <button onClick={() => { setActiveTab('manage-content'); setViewingMangaId(null); }} className={`tab-btn ${activeTab === 'manage-content' ? 'bg-purple-600 text-white' : 'bg-[#111] text-gray-500'}`}>
                    <List size={18} /> المحتوى
                  </button>
                </>
              )}
              {currentUserRole === 'super_admin' && (
                <button onClick={() => { setActiveTab('manage-team'); setViewingMangaId(null); }} className={`tab-btn ${activeTab === 'manage-team' ? 'bg-yellow-600 text-white' : 'bg-[#111] text-gray-500'}`}>
                  <Users size={18} /> الفريق
                </button>
              )}
            </div>

            {/* BULK UPLOAD */}
            {activeTab === 'bulk-upload' && (
              <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#111] p-10 rounded-3xl border border-[#222] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#222]">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-600 to-green-800 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <FolderArchive className="text-green-500" size={28} /> الرافع الذكي المتعدد
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-green-900/20 to-green-950/10 p-6 rounded-2xl border border-green-500/30 mb-8 shadow-inner">
                  <h4 className="font-black text-green-400 mb-3 flex items-center gap-2 text-lg">
                    <span className="text-2xl">🚀</span> نظام التوفير الذكي مفعّل
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    سيتم ضغط جميع الصور تلقائياً إلى صيغة <span className="text-green-400 font-bold">WebP</span> وتقليل حجمها بنسبة تصل إلى <span className="text-green-400 font-bold">90%</span> قبل الرفع.<br />
                    <span className="text-green-500">✓</span> توفير مساحة الكلاود المجانية<br />
                    <span className="text-green-500">✓</span> تحميل أسرع للمستخدمين
                  </p>
                </div>

                <form onSubmit={handleBulkUpload} className="space-y-8">
                  <div>
                    <label className="label-text">اختر العمل</label>
                    <select className="custom-input" value={selectedMangaId} onChange={e => setSelectedMangaId(e.target.value)}>
                      <option value="">-- اختر المانهوا --</option>
                      {mangaList.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                  </div>

                  <div className="relative bg-gradient-to-br from-[#0a0a0a] to-[#050505] p-16 rounded-2xl border-2 border-dashed border-[#333] hover:border-green-500 transition-all cursor-pointer text-center group shadow-inner overflow-hidden" onClick={() => zipInputRef.current?.click()}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 via-transparent to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <input type="file" accept=".zip" className="hidden" ref={zipInputRef} />
                    <div className="relative z-10">
                      <FolderArchive size={56} className="mx-auto text-gray-600 group-hover:text-green-500 transition-colors duration-500 group-hover:animate-bounce" />
                      <p className="font-black text-lg text-gray-400 group-hover:text-white mt-4 transition-colors">اختر ملف ZIP</p>
                      <p className="text-sm text-gray-600 mt-2">مجلدات مرقمة: 1، 2، 3...</p>
                    </div>
                  </div>

                  {chapterUploading && (
                    <div className="space-y-3 bg-[#0a0a0a] p-6 rounded-2xl border border-[#222]">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-gray-400">{uploadStatus}</span>
                        <span className="text-green-400">{bulkCurrent} / {bulkTotal}</span>
                      </div>
                      <div className="relative w-full h-3 bg-[#222] rounded-full overflow-hidden shadow-inner">
                        <div className="absolute top-0 right-0 h-full bg-gradient-to-l from-green-500 via-green-600 to-green-500 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.6)]" style={{ width: `${(bulkCurrent / bulkTotal) * 100}%` }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={chapterUploading} className="relative w-full py-5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-black rounded-2xl shadow-[0_8px_32px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_48px_rgba(34,197,94,0.6)] disabled:opacity-50 transition-all text-lg overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <div className="relative flex justify-center items-center gap-3">
                      {chapterUploading ? <Loader2 className="animate-spin" size={22} /> : <Upload size={22} />}
                      <span>{chapterUploading ? 'جاري المعالجة والرفع...' : 'بدء العملية'}</span>
                    </div>
                  </button>
                </form>
              </div>
            )}

            {/* SINGLE CHAPTER */}
            {activeTab === 'upload-chapter' && (
              <form onSubmit={handleUploadChapter} className="max-w-3xl mx-auto bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#111] p-10 rounded-3xl border border-[#222] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#222]">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
                  <h3 className="text-2xl font-black">رفع فصل فردي</h3>
                </div>
                <div className="space-y-8">
                  <div><label className="label-text">اختر العمل</label><select className="custom-input" value={selectedMangaId} onChange={e => setSelectedMangaId(e.target.value)}><option value="">-- اختر --</option>{mangaList.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
                  <div><label className="label-text">رقم الفصل</label><input type="number" className="custom-input font-mono text-lg" placeholder="1" value={chapterNum} onChange={e => setChapterNum(e.target.value)} /></div>
                  <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] p-16 rounded-2xl border-2 border-dashed border-[#333] hover:border-blue-500 transition-all cursor-pointer text-center group shadow-inner" onClick={() => chapterInputRef.current?.click()}>
                    <input type="file" multiple accept="image/*" className="hidden" ref={chapterInputRef} onChange={e => e.target.files && setChapterImages(Array.from(e.target.files))} />
                    <Plus size={56} className="mx-auto text-gray-600 group-hover:text-blue-500 transition-colors" />
                    <p className="font-black text-lg text-gray-400 group-hover:text-white mt-4 transition-colors">اضغط لاختيار الصور</p>
                    {chapterImages.length > 0 && <p className="text-green-500 text-sm mt-2 font-bold">تم اختيار {chapterImages.length} صورة</p>}
                  </div>
                  {chapterUploading && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-gray-400">{uploadStatus}</span>
                        <span className="text-blue-500">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-l from-blue-500 to-blue-600 transition-all shadow-[0_0_20px_rgba(37,99,235,0.6)]" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}
                  <button type="submit" disabled={chapterUploading} className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl shadow-[0_8px_32px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all text-lg">{chapterUploading ? 'جاري النشر...' : 'نشر الفصل'}</button>
                </div>
              </form>
            )}

            {/* ADD MANGA */}
            {activeTab === 'add-manga' && (
              <form onSubmit={handleAddManga} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
                <div className="lg:col-span-2 bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#111] p-8 rounded-3xl border border-[#222] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-8">
                  <div className="flex items-center gap-3 pb-6 border-b border-[#222]">
                    <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-800 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.6)]"></div>
                    <h3 className="text-2xl font-black">بيانات العمل</h3>
                  </div>
                  <div><label className="label-text">العنوان</label><input type="text" className="custom-input" placeholder="أدخل العنوان..." value={mangaForm.title} onChange={e => setMangaForm({ ...mangaForm, title: e.target.value })} /></div>
                  <div><label className="label-text">الوصف</label><textarea className="custom-input h-32 resize-none" placeholder="أضف وصفاً..." value={mangaForm.description} onChange={e => setMangaForm({ ...mangaForm, description: e.target.value })} /></div>
                  <div>
                    <label className="label-text">التصنيفات (5 كحد أقصى)</label>
                    <div className="flex flex-wrap gap-3 p-6 bg-[#0a0a0a] rounded-2xl border border-[#222] shadow-inner">
                      {AVAILABLE_GENRES.map(g => (
                        <button type="button" key={g} onClick={() => toggleGenre(g)} className={`text-sm font-bold py-3 px-5 rounded-xl border-2 transition-all ${selectedGenres.includes(g) ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500 shadow-[0_4px_20px_rgba(220,38,38,0.4)] scale-105' : 'bg-gradient-to-br from-[#151515] to-[#0a0a0a] border-[#333] text-gray-400 hover:border-red-600/50 hover:scale-105'}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <div><label className="label-text">النوع</label><select className="custom-input" value={mangaForm.country} onChange={e => setMangaForm({ ...mangaForm, country: e.target.value })}><option value="KR">🇰🇷 Manhwa</option><option value="JP">🇯🇵 Manga</option><option value="CN">🇨🇳 Manhua</option></select></div>
                    <div><label className="label-text">الحالة</label><select className="custom-input" value={mangaForm.status} onChange={e => setMangaForm({ ...mangaForm, status: e.target.value })}><option value="Ongoing">🔄 Ongoing</option><option value="Completed">✅ Completed</option></select></div>
                    <div><label className="label-text">التقييم</label><input type="number" step="0.1" className="custom-input text-yellow-500 font-black" value={mangaForm.rating} onChange={e => setMangaForm({ ...mangaForm, rating: e.target.value })} /></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#111] p-6 rounded-3xl border border-[#222] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                    <h3 className="text-xl font-black mb-5">الغلاف</h3>
                    <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-[#0a0a0a] to-[#050505] border-2 border-dashed border-[#333] rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-red-600 transition-all group shadow-inner" onClick={() => coverInputRef.current?.click()}>
                      {coverPreview ? (
                        <div className="relative w-full h-full">
                          <img src={coverPreview} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-bold">تغيير</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 group-hover:text-red-500 transition-colors">
                          <ImageIcon size={48} className="mx-auto mb-3" />
                          <span className="text-sm font-bold">اختر صورة</span>
                        </div>
                      )}
                      <input type="file" className="hidden" ref={coverInputRef} onChange={handleFileChange} accept="image/*" />
                    </div>
                    <div className="mt-6"><p className="label-text">الخلفية (اختياري)</p><input type="file" className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer file:transition-all" ref={bgInputRef} accept="image/*" /></div>
                  </div>
                  <button type="submit" disabled={uploading} className="w-full py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black rounded-2xl shadow-[0_8px_32px_rgba(220,38,38,0.4)] disabled:opacity-50 transition-all flex justify-center gap-2">{uploading ? <Loader2 className="animate-spin" /> : <Save />} حفظ</button>
                </div>
              </form>
            )}

            {/* MANAGE CONTENT */}
            {activeTab === 'manage-content' && (
              <div className="bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#111] p-8 rounded-3xl border border-[#222] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in">
                {!viewingMangaId ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold flex items-center gap-2"><List /> كل الأعمال ({contentMangas.length})</h2>
                      <input type="text" placeholder="بحث..." className="custom-input w-64" onChange={(e) => setSearchManga(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contentMangas.filter(m => m.title.toLowerCase().includes(searchManga.toLowerCase())).map(m => (
                        <div key={m.id} className="flex items-center gap-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] p-4 rounded-2xl border border-[#333] hover:border-purple-600/50 transition-all group shadow-lg">
                          <div className="w-14 h-20 rounded-xl overflow-hidden bg-[#222] flex-shrink-0 shadow-md">
                            <img src={m.cover_image || "/placeholder.jpg"} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate">{m.title}</h4>
                            <div className="flex gap-2 mt-3">
                              <button onClick={() => { setViewingMangaId(m.id); fetchMangaChapters(m.id) }} className="px-4 py-2 bg-blue-600/10 text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"><List size={14} /> الفصول</button>
                              <button onClick={() => handleEditMangaClick(m)} className="px-4 py-2 bg-yellow-600/10 text-yellow-400 text-xs font-bold rounded-xl hover:bg-yellow-600 hover:text-white transition-all flex items-center gap-2"><Edit size={14} /> تعديل</button>
                              <button onClick={() => deleteManga(m.id)} className="px-4 py-2 bg-red-600/10 text-red-400 text-xs font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"><Trash2 size={14} /> حذف</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="animate-in slide-in-from-right-8 duration-300">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#222]">
                      <button onClick={() => setViewingMangaId(null)} className="p-3 bg-gradient-to-br from-[#222] to-[#111] rounded-xl hover:from-white hover:to-gray-200 hover:text-black transition-all shadow-lg"><ArrowRight size={20} /></button>
                      <h2 className="text-2xl font-bold">الفصول</h2>
                    </div>
                    {mangaChapters.length > 0 ? (
                      <div className="space-y-3">
                        {mangaChapters.map(c => (
                          <div key={c.id} className="flex justify-between items-center bg-gradient-to-r from-[#0a0a0a] to-[#111] p-5 rounded-2xl border border-[#333] hover:border-white/30 transition-all shadow-lg">
                            <div className="font-mono font-bold text-lg text-white">Chapter <span className="text-blue-400">{c.chapter_number}</span></div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => openEditChapter(c)} className="px-4 py-2 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 text-sm font-bold"><Edit size={16} /> تعديل</button>
                              <button onClick={() => deleteChapter(c.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={20} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-500 bg-[#0a0a0a] rounded-2xl border border-dashed border-[#333]"><XCircle className="mx-auto mb-2 opacity-50" size={40} /><p>لا توجد فصول</p></div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EDIT CHAPTER MODAL */}
            {editingChapter && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#111] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#222] shadow-[0_20px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#0a0a0a]">
                    <h3 className="text-2xl font-black">تعديل الفصل <span className="text-blue-400">{editingChapter.chapter_number}</span></h3>
                    <div className="flex gap-3">
                      <button onClick={saveReorder} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Save size={18} /> حفظ</button>
                      <button onClick={() => setEditingChapter(null)} className="bg-gradient-to-br from-[#222] to-[#111] hover:bg-red-600 text-white p-3 rounded-xl transition-all shadow-lg"><X size={20} /></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {editingImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-[2/3] bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-2xl overflow-hidden border border-[#333] shadow-lg">
                          <img src={img} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-black/80 px-3 py-1 rounded-lg text-xs font-bold border border-white/20">#{idx + 1}</div>
                          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <div className="flex gap-2">
                              <button onClick={() => moveImage(idx, 'up')} className="p-2 bg-white text-black rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-lg" title="تقديم"><ArrowRight size={16} /></button>
                              <button onClick={() => moveImage(idx, 'down')} className="p-2 bg-white text-black rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-lg" title="تأخير"><ArrowRight size={16} className="rotate-180" /></button>
                            </div>
                            <button onClick={() => removeImage(idx)} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 shadow-lg">حذف</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT MANGA MODAL */}
            {editingManga && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#111] w-full max-w-5xl max-h-[90vh] rounded-3xl border border-[#222] shadow-[0_20px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#0a0a0a]">
                    <h3 className="text-2xl font-black">تعديل المانهوا</h3>
                    <button onClick={() => setEditingManga(null)} className="bg-gradient-to-br from-[#222] to-[#111] hover:bg-red-600 text-white p-3 rounded-xl transition-all shadow-lg"><X size={20} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form onSubmit={(e) => { e.preventDefault(); saveMangaChanges(e); }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Cover Image Column */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="aspect-[2/3] relative rounded-2xl overflow-hidden border-2 border-dashed border-[#333] group hover:border-red-500 transition-all bg-[#050505]">
                          {editCoverPreview ? (
                            <img src={editCoverPreview} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                              <ImageIcon size={48} className="mb-2" />
                              <span>صورة الغلاف</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2">
                              <Upload size={18} /> تغيير الصورة
                              <input type="file" className="hidden" accept="image/*" ref={editCoverInputRef} onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setEditCoverPreview(URL.createObjectURL(file));
                                }
                              }} />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Fields Column */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400">العنوان</label>
                            <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="custom-input" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400">الحالة</label>
                            <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="custom-input">
                              <option value="Ongoing">Ongoing</option>
                              <option value="Completed">Completed</option>
                              <option value="Hiatus">Hiatus</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-400">القصة</label>
                          <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="custom-input h-32 resize-none" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-400">التصنيفات</label>
                          <div className="flex flex-wrap gap-2 bg-[#050505] p-4 rounded-xl border border-[#333]">
                            {AVAILABLE_GENRES.map(g => (
                              <button key={g} type="button" onClick={() => toggleEditGenre(g)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${editForm.genres.includes(g) ? 'bg-red-600 border-red-600 text-white' : 'bg-[#111] border-[#333] text-gray-400 hover:border-gray-500'}`}>
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button type="submit" className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4">
                          <Save size={20} /> حفظ التغييرات
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* MANAGE TEAM */}
            {activeTab === 'manage-team' && currentUserRole === 'super_admin' && (
              <div className="bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#111] p-10 rounded-3xl border border-[#222] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black">أعضاء الموقع <span className="text-yellow-500">({usersList.length})</span></h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchUsersList}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      تحديث القائمة
                    </button>
                    <input type="text" placeholder="بحث..." className="custom-input w-80" onChange={(e) => setSearchUser(e.target.value)} />
                  </div>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-[#222] bg-[#0a0a0a]/50">
                  <table className="w-full text-right">
                    <thead className="text-gray-400 text-xs uppercase bg-gradient-to-r from-[#0a0a0a] via-[#111] to-[#0a0a0a] border-b border-[#222]">
                      <tr><th className="px-6 py-5 font-black">المستخدم</th><th className="px-6 py-5 font-black">الصلاحية</th><th className="px-6 py-5 font-black">تغيير</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      {usersList.filter(u => u.email?.includes(searchUser)).map((u) => (
                        <tr key={u.id} className="hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all">
                          <td className="px-6 py-5 font-bold">{u.email}</td>
                          <td className="px-6 py-5"><span className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-xl text-xs font-bold border border-[#333]">{u.role}</span></td>
                          <td className="px-6 py-5">
                            <select className="bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-sm outline-none hover:border-yellow-600 focus:border-yellow-600 transition-all cursor-pointer font-bold"
                              value={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)} disabled={u.role === 'super_admin'}>
                              <option value="user">User</option><option value="editor">Editor</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.875rem;
          border: 1px solid #222;
          transition: all 0.2s ease-in-out;
          background: #111;
          color: #888;
        }
        .tab-btn:hover {
          background: #1a1a1a;
          color: white;
          border-color: #333;
        }
        .tab-btn.bg-red-600 { background: #dc2626; color: white; border-color: #dc2626; box-shadow: 0 4px 12px rgba(220,38,38,0.3); }
        .tab-btn.bg-red-600:hover { background: #b91c1c; }
        
        .tab-btn.bg-blue-600 { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .tab-btn.bg-blue-600:hover { background: #1d4ed8; }
        
        .tab-btn.bg-green-600 { background: #16a34a; color: white; border-color: #16a34a; box-shadow: 0 4px 12px rgba(22,163,74,0.3); }
        .tab-btn.bg-green-600:hover { background: #15803d; }
        
        .tab-btn.bg-purple-600 { background: #9333ea; color: white; border-color: #9333ea; box-shadow: 0 4px 12px rgba(147,51,234,0.3); }
        .tab-btn.bg-purple-600:hover { background: #7e22ce; }
        
        .tab-btn.bg-yellow-600 { background: #ca8a04; color: white; border-color: #ca8a04; box-shadow: 0 4px 12px rgba(202,138,4,0.3); }
        .tab-btn.bg-yellow-600:hover { background: #a16207; }

        .custom-input {
          width: 100%;
          color: white;
          border: 1px solid #333;
          padding: 0.75rem;
          border-radius: 0.75rem;
          outline: none;
          background: #0a0a0a;
          transition: all 0.2s;
        }
        .custom-input:focus {
          border-color: #444;
          background: #111;
        }
        .custom-input:hover {
          border-color: #444;
        }
        
        select.custom-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='16' height='10' viewBox='0 0 16 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L8 8L15 1' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: calc(100% - 16px) center;
          padding-right: 48px;
        }
        select.custom-input option {
          background: #111 !important;
          color: white !important;
          padding: 12px;
        }

        .label-text {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #888;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #050505;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
          </div>
        </div>
      );
    }