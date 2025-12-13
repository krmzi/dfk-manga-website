import os
import time
import re
import shutil
import requests
import boto3
from io import BytesIO
from PIL import Image
from DrissionPage import ChromiumPage, ChromiumOptions

# ==========================================
# 1. إعدادات النظام ومفاتيح R2
# ==========================================
API_SECRET = "hadahowaLPASS&123"
BASE_URL = "https://www.dfk-team.site" 
SYNC_ENDPOINT = f"{BASE_URL}/api/bot/sync"
UPLOAD_ENDPOINT = f"{BASE_URL}/api/bot/upload"

# 🔴🔴 ضع مفاتيح R2 هنا 🔴🔴
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "dfk-manga-storage")
R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN", "https://cdn.dfk-team.site")

# تهيئة عميل R2
r2_client = None
try:
    # محاولة قراءة المفاتيح (سواء من هنا أو من البيئة)
    acc_id = R2_ACCOUNT_ID if "ضع_" not in R2_ACCOUNT_ID else os.getenv("R2_ACCOUNT_ID")
    acc_key = R2_ACCESS_KEY if "ضع_" not in R2_ACCESS_KEY else os.getenv("R2_ACCESS_KEY_ID")
    sec_key = R2_SECRET_KEY if "ضع_" not in R2_SECRET_KEY else os.getenv("R2_SECRET_ACCESS_KEY")

    if acc_id and acc_key and sec_key:
        r2_client = boto3.client(
            's3',
            endpoint_url=f"https://{acc_id}.r2.cloudflarestorage.com",
            aws_access_key_id=acc_key,
            aws_secret_access_key=sec_key
        )
        print("✅ [R2] Client Connected Successfully.")
    else:
        print("⚠️ [R2] WARNING: Keys are missing. Uploads will FAIL.")
except Exception as e:
    print(f"❌ [R2] Connection Error: {e}")

MONITOR_URLS = [
    "https://lekmanga.net/manga/absolute-regression/",
    "https://olympustaff.com/series/absolute-regression",
    "https://lekmanga.net/manga/after-the-school-belle-dumped-me-i-became-a-martial-arts-god/",      
    "https://olympustaff.com/series/after-the-school-belle-dumped-me-i-became-a-martial-arts-god",    
    "https://lekmanga.net/manga/chronicle-of-runes/",
    "https://olympustaff.com/series/chronicle-of-runes",
    "https://lekmanga.net/manga/colorist/",
    "https://olympustaff.com/series/colorist",
    "https://lekmanga.net/manga/crimson-reset/",
    "https://olympustaff.com/series/crimson-reset",
    "https://lekmanga.net/manga/daoist-master-wants-to-ascend/",
    "https://olympustaff.com/series/daoist-master-wants-to-ascend",
    "https://lekmanga.net/manga/dont-tell-me-you-think-cultivating-immortality-is-difficult/",        
    "https://olympustaff.com/series/dont-tell-me-you-think-cultivating-immortality-is-difficult",    
    "https://lekmanga.net/manga/echoes-of-the-reverse-planet/",
    "https://olympustaff.com/series/echoes-of-the-reverse-planet",
    "https://lekmanga.net/manga/half-blood/",
    "https://olympustaff.com/series/half-blood",
    "https://lekmanga.net/manga/i-became-the-berserker-of-the-world-i-created/",
    "https://olympustaff.com/series/i-became-the-berserker-of-the-world-i-created",
    "https://lekmanga.net/manga/lord-of-summoning-when-the-world-changes/",
    "https://olympustaff.com/series/lord-of-summoning-when-the-world-changes",
    "https://lekmanga.net/manga/rebirth-of-the-divine-demon/",
    "https://olympustaff.com/series/rebirth-of-the-divine-demon",
    "https://lekmanga.net/manga/reverend-insanity-master-of-gu/",
    "https://olympustaff.com/series/reverend-insanity-master-of-gu",
    "https://lekmanga.net/manga/rise-of-the-fallen-kingdoms-third-prince/",
    "https://olympustaff.com/series/rise-of-the-fallen-kingdoms-third-prince",
    "https://lekmanga.net/manga/the-dark-swordsman-returns/",
    "https://olympustaff.com/series/the-dark-swordsman-returns",
    "https://lekmanga.net/manga/the-demonic-cult-instructor-returns/",
    "https://olympustaff.com/series/the-demonic-cult-instructor-returns",
    "https://lekmanga.net/manga/the-divine-demons-grand-ascension/",
    "https://olympustaff.com/series/the-divine-demons-grand-ascension",
    "https://lekmanga.net/manga/the-mad-dog-of-the-dukes-estate/",
    "https://olympustaff.com/series/the-mad-dog-of-the-dukes-estate",
    "https://lekmanga.net/manga/the-supreme-martial-academy/",
    "https://olympustaff.com/series/the-supreme-martial-academy",
    "https://lekmanga.net/manga/what-a-bountiful-harvest-demon-lord/",
    "https://olympustaff.com/series/what-a-bountiful-harvest-demon-lord",
]

CHECK_INTERVAL = 600

# ==========================================
# 2. Helpers (Logging & Utils)
# ==========================================
def log(step, msg):
    print(f"[{time.strftime('%H:%M:%S')}] [{step}] {msg}")

def clean_slug(url):
    try:
        url = url.rstrip('/')
        if '/series/' in url: return url.split('/series/')[-1].split('/')[0]
        if '/manga/' in url: return url.split('/manga/')[-1].split('/')[0]
    except: pass
    return "unknown"

def bypass_protection(page):
    """
    التعامل الصارم مع كلاود فلير والإعلانات المنبثقة
    """
    try:
        # 1. إغلاق التبويبات الزائدة (إعلانات)
        if len(page.tab_ids) > 1:
            curr = page.tab_id
            for tid in page.tab_ids:
                if tid != curr:
                    try: page.get_tab(tid).close()
                    except: pass
        
        # 2. انتظار كلاود فلير
        if "Just a moment" in page.title or "Cloudflare" in page.title:
            log("PROTECT", "Cloudflare detected. Waiting up to 30s...")
            start = time.time()
            while "Just a moment" in page.title:
                time.sleep(1)
                if time.time() - start > 10:
                    try: 
                        ifr = page.ele('xpath://iframe[contains(@src, "cloudflare")]')
                        if ifr: ifr.click()
                    except: pass
                if time.time() - start > 30: break
    except Exception as e:
        log("WARN", f"Protection bypass error: {e}")

# ==========================================
# 3. Chapter Scanning Logic
# ==========================================
def extract_strict_number(element_text, element_href):
    text = str(element_text).lower().strip()
    href = str(element_href).lower().strip()
    
    # Priority 1: From Href
    try:
        slug_part = href.rstrip('/').split('/')[-1]
        match = re.search(r'(\d+(\.\d+)?)', slug_part)
        if match: return float(match.group(1))
    except: pass
    
    # Priority 2: From Text
    match_text = re.search(r'(chapter|ch|chap|فصل|ep|vol)\.?\s*(\d+(\.\d+)?)', text)
    if match_text: return float(match_text.group(2))
    
    return None

def scan_site_chapters(page, url):
    """
    فحص الفصول بالطريقة الطويلة المفصلة للبحث في كل الاحتمالات
    """
    chapters = []
    log("SCAN", f"Accessing: {url}")
    try:
        page.get(url, retry=1, timeout=20)
        bypass_protection(page)
        
        # محاولة الضغط على Load More
        try:
            load_btn = page.ele('.load-more') or page.ele('#load-more-ajax') or page.ele('text:Show more')
            if load_btn: 
                load_btn.click()
                time.sleep(2)
        except: pass

        # محاولة البحث عن روابط الفصول
        found_links = []
        
        # Selectors مرتبة حسب الأهمية بناء على صورك
        selectors = [
            'li.wp-manga-chapter > a',    # Standard Madara (Lekmanga)
            '.chapter-link',              # Olympus New
            '.version-chap li a',         # Other themes
            '.listing-chapters_wrap a',   
            'div#chapterlist a'
        ]
        
        for sel in selectors:
            found_links = page.eles(sel)
            if found_links:
                break # وجدنا القائمة، نتوقف عن البحث
        
        if not found_links:
            # بحث عام إذا فشلت المحددات الدقيقة
            found_links = page.eles('a[href*="/chapter/"]') or page.eles('a[href*="/manga/"][href*="-"]')

        for el in found_links:
            try:
                href = el.attr('href')
                if not href or '#' in href or 'javascript' in href: continue
                
                num = extract_strict_number(el.text, href)
                if num is not None and 0 < num < 9000:
                    chapters.append((num, href))
            except: continue
            
    except Exception as e:
        log("ERROR", f"Scan failed: {e}")
    
    # إزالة التكرار
    unique = {}
    for n, l in chapters:
        if n not in unique: unique[n] = l
    
    res = sorted([(n, l) for n, l in unique.items()])
    log("SCAN", f"Found {len(res)} chapters.")
    return res

# ==========================================
# 4. Image Extraction (The Heavy Logic)
# ==========================================
def smooth_scroll(page):
    """
    تمرير متدرج لإجبار الموقع على تحميل الصور
    """
    log("SCROLL", "Scrolling down to trigger LazyLoad...")
    try:
        page.scroll.to_top()
        time.sleep(0.5)
        last_height = page.run_js("return document.body.scrollHeight")
        
        for i in range(1, 15): # تمرير طويل
            page.scroll.down(600)
            time.sleep(0.3)
            new_height = page.run_js("return document.body.scrollHeight")
            # إذا وصلنا للنهاية نتوقف
            if (i * 600) > new_height: break
            
        page.scroll.to_bottom()
        time.sleep(1.5)
    except: pass

def get_images_detailed(page, url):
    """
    استخراج الصور وطباعة الروابط لكي تراها
    """
    # 1. إجبار الانتظار (هام جداً لحل مشكلة 0 images)
    try:
        log("WAIT", "Waiting for .reading-content container...")
        page.wait.ele(['.reading-content', '#readerarea', '.entry-content'], timeout=15)
    except:
        log("WARN", "Container not appeared, trying scan anyway...")

    # 2. التمرير
    smooth_scroll(page)

    valid_urls = []
    seen = set()
    
    try:
        # البحث عن الصور
        raw_imgs = []
        
        # استراتيجية المحددات الدقيقة من صورك
        container = page.ele('.reading-content')
        if container:
            # ليك مانجا
            raw_imgs = container.eles('img.wp-manga-chapter-img')
            if not raw_imgs:
                # أوليمبوس
                raw_imgs = container.eles('img.manga-chapter-img')
            if not raw_imgs:
                # عام
                raw_imgs = container.eles('img')
        else:
            raw_imgs = page.eles('img')

        log("EXTRACT", f"Scanning {len(raw_imgs)} img elements...")

        for idx, img in enumerate(raw_imgs):
            try:
                # التحقق من الأبعاد (تجاهل الإعلانات الصغيرة)
                if img.rect.size[0] < 150: continue

                # سحب الرابط
                src = img.attr('src') or img.attr('data-src') or img.attr('data-lazy-src')
                if not src: continue
                src = src.strip()
                
                # تجاهل غير المهم
                if 'svg' in src or 'base64' in src or 'logo' in src: continue

                # إصلاح البروتوكول
                if src.startswith('//'): src = 'https:' + src
                if not src.startswith('http'):
                    base = url.split('/manga')[0] if '/manga' in url else "https://lekmanga.net"
                    if src.startswith('/'): src = base + src
                    else: src = base + '/' + src
                
                # تنظيف وتخزين
                clean = src.split('?')[0]
                if clean not in seen:
                    print(f"    --> Found URL [{idx}]: {clean}") # طباعة الرابط كما طلبت
                    valid_urls.append(clean)
                    seen.add(clean)
            except: continue

    except Exception as e:
        log("ERROR", f"Image extraction error: {e}")
        
    return valid_urls

# ==========================================
# 5. Downloading & Uploading
# ==========================================
def download_files_locally(urls, save_dir, cookies, user_agent, referer):
    """
    تحميل الملفات واحداً تلو الآخر مع طباعة الحالة
    """
    local_paths = []
    
    headers = {
        'User-Agent': user_agent,
        'Referer': referer,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }

    log("DL", f"Starting download of {len(urls)} images...")
    
    for i, url in enumerate(urls):
        try:
            ext = 'jpg'
            if 'png' in url: ext = 'png'
            elif 'webp' in url: ext = 'webp'
            
            filename = f"{i:03d}.{ext}"
            filepath = os.path.join(save_dir, filename)
            
            print(f"    --> Downloading Image {i+1}/{len(urls)}...", end='')
            
            # الطلب باستخدام الكوكيز لتجنب الحجب
            r = requests.get(url, headers=headers, cookies=cookies, timeout=20)
            
            if r.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(r.content)
                local_paths.append(filepath)
                print(f" [OK] Size: {len(r.content)} bytes")
            else:
                print(f" [FAIL] Code: {r.status_code}")
                
            time.sleep(0.2) # استراحة قصيرة لتجنب الحظر
            
        except Exception as e:
            print(f" [ERR] {e}")

    return local_paths

def upload_to_r2(local_files, slug, chapter):
    """
    رفع الصور إلى R2
    """
    if not r2_client: return None
    
    final_urls = []
    log("UPLOAD", f"Uploading {len(local_files)} files to R2...")
    
    local_files.sort() # ضمان الترتيب
    
    for i, fpath in enumerate(local_files):
        try:
            print(f"    --> Uploading {os.path.basename(fpath)}... ", end='')
            
            # فتح وضغط الصورة
            img = Image.open(fpath).convert('RGB')
            
            # تصغير العرض إذا كانت كبيرة جداً (توفير مساحة)
            if img.width > 1200:
                ratio = 1200 / img.width
                img = img.resize((1200, int(img.height * ratio)), Image.Resampling.LANCZOS)
            
            buf = BytesIO()
            img.save(buf, 'webp', quality=85)
            buf.seek(0)
            
            # تسمية الملف في السيرفر
            remote_name = f"{os.path.basename(fpath).split('.')[0]}.webp"
            object_key = f"manga/{slug}/{chapter}/{remote_name}"
            
            r2_client.put_object(
                Bucket=R2_BUCKET_NAME,
                Key=object_key,
                Body=buf.getvalue(),
                ContentType='image/webp'
            )
            
            public_url = f"{R2_PUBLIC_DOMAIN}/{object_key}"
            final_urls.append(public_url)
            print("[OK]")
            
        except Exception as e:
            print(f"[FAIL] {e}")
            
    return final_urls

# ==========================================
# 6. Main Execution
# ==========================================
def run():
    print("="*60)
    print(" DFK AUTO BOT - FULL VERBOSE MODE")
    print(" Please keep Chrome open and watch the terminal.")
    print("="*60)
    
    co = ChromiumOptions()
    co.set_address('127.0.0.1:9222')
    
    try:
        browser = ChromiumPage(co)
        log("INIT", "Connected to Browser.")
    except:
        log("FATAL", "Cannot connect to Chrome. Run: chrome --remote-debugging-port=9222")
        return

    while True:
        grouped = {}
        for u in MONITOR_URLS:
            s = clean_slug(u)
            if s not in grouped: grouped[s] = []
            grouped[s].append(u)
        
        for slug, urls in grouped.items():
            print(f"\n[{time.strftime('%H:%M')}] --- Checking Series: {slug} ---")
            
            # 1. Sync
            db_chap = 0
            manga_id = None
            try:
                r = requests.get(f"{SYNC_ENDPOINT}?slug={slug}", timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    db_chap = float(data.get('last_chapter', 0))
                    manga_id = data.get('manga_id')
                else:
                    print(f"    [DB] Sync Error: {r.status_code}")
                    continue
            except:
                print("    [DB] Connection Failed.")
                continue
            
            if not manga_id: continue

            # 2. Scan
            scan_results = {}
            for url in urls:
                res = scan_site_chapters(browser, url)
                for num, link in res:
                    if num > db_chap:
                        if num not in scan_results: scan_results[num] = []
                        if link not in scan_results[num]: scan_results[num].append(link)
            
            if not scan_results:
                print(f"    [OK] Up to date (Last: {db_chap})")
                continue
            
            log("INFO", f"Found new chapters: {list(scan_results.keys())}")
            
            # 3. Process
            sorted_chaps = sorted(scan_results.keys())
            for ch in sorted_chaps:
                links = scan_results[ch]
                # ترتيب المصادر (Olympus أولاً)
                links.sort(key=lambda x: 0 if 'olympustaff' in x else 1)
                
                success_flag = False
                
                for link in links:
                    log("PROCESS", f"Working on Chapter {ch} from {link}")
                    
                    # مجلد مؤقت
                    temp_dir = os.path.join("_temp", slug, str(ch))
                    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
                    os.makedirs(temp_dir, exist_ok=True)
                    
                    try:
                        # أ. تصفح
                        browser.get(link)
                        bypass_protection(browser)
                        
                        # ب. استخراج الصور
                        imgs = get_images_detailed(browser, link)
                        
                        if len(imgs) < 2:
                            log("WARN", f"Found {len(imgs)} images only. Trying next link.")
                            continue
                        
                        # ج. تحميل محلي
                        cookies = {c['name']:c['value'] for c in browser.cookies()}
                        ua = browser.user_agent
                        
                        local_files = download_files_locally(imgs, temp_dir, cookies, ua, link)
                        
                        if len(local_files) < 2:
                            log("FAIL", "Download failed locally (empty files?).")
                            continue
                        
                        # د. رفع R2
                        if r2_client:
                            r2_urls = upload_to_r2(local_files, slug, ch)
                            
                            if r2_urls:
                                log("DB", "Updating Database...")
                                payload = {
                                    "manga_id": manga_id, 
                                    "chapter_number": ch, 
                                    "images": r2_urls, 
                                    "secret_key": API_SECRET
                                }
                                resp = requests.post(UPLOAD_ENDPOINT, json=payload)
                                if resp.status_code == 200:
                                    log("SUCCESS", f"Chapter {ch} Finished successfully.")
                                    success_flag = True
                                    break
                                else:
                                    log("ERR", f"API Upload Error: {resp.text}")
                            else:
                                log("ERR", "R2 Upload returned 0 URLs.")
                        else:
                            log("TEST", "R2 Keys Missing - Skipping Upload.")
                            
                    except Exception as e:
                        log("ERR", f"Unexpected error: {e}")
                    finally:
                        # تنظيف
                        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
                
                if not success_flag:
                    log("FAIL", f"Could not process Chapter {ch} from any source.")

            log("SLEEP", f"Waiting {CHECK_INTERVAL}s...")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    run()