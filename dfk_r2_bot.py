import os
import time
import re
import shutil
import requests
import boto3
from PIL import Image
from io import BytesIO
from DrissionPage import ChromiumPage, ChromiumOptions
from dotenv import load_dotenv

# Load .env.local
load_dotenv('.env.local')

# ==========================================
# 1. System Config (R2 & Supabase)
# ==========================================
API_SECRET = os.getenv("BOT_API_SECRET", "hadahowaLPASS&123")
BASE_URL = "https://www.dfk-team.site"
SYNC_ENDPOINT = f"{BASE_URL}/api/bot/sync"
UPLOAD_ENDPOINT = f"{BASE_URL}/api/bot/upload"

# Cloudflare R2 Config
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "dfk-manga-storage")
R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN", "https://cdn.dfk-team.site")

print(f" [Config] R2 Bucket: {R2_BUCKET_NAME}")
print(f" [Config] R2 Domain: {R2_PUBLIC_DOMAIN}")

# Initializing S3 Client (R2)
r2_client = boto3.client(
    's3',
    endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY
)

MONITOR_URLS = [
    "https://olympustaff.com/series/the-wandering-knights-survival-manual"
    "https://olympustaff.com/series/did-someone-force-you-to-become-the-heavenly-demon"
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
# 2. Helpers
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

def cleanup_tabs(page):
    try:
        current_id = page.tab_id
        all_ids = page.tab_ids
        if len(all_ids) > 1:
            log("CLEAN", f"Detected {len(all_ids)} tabs. Closing {len(all_ids)-1} extra tabs...")
            for tid in all_ids:
                if tid != current_id:
                    try: page.get_tab(tid).close()
                    except: pass
    except: pass

def bypass_protection(page):
    try:
        cleanup_tabs(page)
        if "Just a moment" in page.title:
            log("PROTECT", "Cloudflare detected, waiting...")
            page.wait.ele('tag:body', timeout=15)
            time.sleep(2)
    except: pass

def optimize_image(image_path):
    """
    Optimizes image for R2:
    1. Resizes width to max 1100px (keeps aspect ratio).
    2. Converts to WebP with Quality 80.
    Returns: Tuple (optimized_bytes, new_filename)
    """
    try:
        img = Image.open(image_path).convert('RGB')
        width, height = img.size
        
        # 1. Reuse Logic: Split if too tall (WebP limit 16383)
        # However, R2 doesn't have a limit, but WebP format does.
        # If it's a Long Strip (>15000px), we slice it.
        # But wait, standard resizing handles width. Long strip slicing is handled in main loop usually.
        # Let's assume input is a standard slice or page.
        
        MAX_WIDTH = 1100
        
        # Resize if too wide
        if width > MAX_WIDTH:
            ratio = MAX_WIDTH / float(width)
            new_height = int(float(height) * ratio)
            img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
            
        # Save to buffer
        buffer = BytesIO()
        img.save(buffer, 'webp', quality=80)
        buffer.seek(0)
        
        # New filename
        original_name = os.path.basename(image_path)
        name_no_ext = os.path.splitext(original_name)[0]
        new_name = f"{name_no_ext}.webp"
        
        return buffer, new_name
    except Exception as e:
        print(f"   [Opt Fail] {e}")
        return None, None

def upload_to_r2(file_path, folder_path):
    """Uploads file to R2 bucket"""
    try:
        # Optimize first
        optimized_data, new_name = optimize_image(file_path)
        if not optimized_data:
            return None # Skip bad images
            
        object_key = f"{folder_path}/{new_name}"
        
        # Check if exists (Optional, saves bandwidth if re-running)
        # try:
        #     r2_client.head_object(Bucket=R2_BUCKET_NAME, Key=object_key)
        #     return f"{R2_PUBLIC_DOMAIN}/{object_key}"
        # except:
        #     pass

        r2_client.upload_fileobj(
            optimized_data,
            R2_BUCKET_NAME,
            object_key,
            ExtraArgs={'ContentType': 'image/webp'}
        )
        
        return f"{R2_PUBLIC_DOMAIN}/{object_key}"
    except Exception as e:
        print(f"   [Up Fail] {e}")
        return None

# ==========================================
# 3. Core Scanning Logic (Same as before)
# ==========================================
def extract_strict_number(element_text, element_href):
    text = str(element_text).lower().strip()
    href = str(element_href).lower().strip()
    try:
        slug_part = href.rstrip('/').split('/')[-1]
        match = re.search(r'(\d+(\.\d+)?)', slug_part)
        if match: return float(match.group(1))
    except: pass
    match_text = re.search(r'(chapter|ch|chap|فصل|ep|vol)\.?\s*(\d+(\.\d+)?)', text)
    if match_text: return float(match_text.group(2))
    try:
        clean = re.sub(r'[^\d\.]', '', text)
        if clean and len(clean) < 5: return float(clean)
    except: pass
    return None

def scan_site_chapters(page, url):
    chapters = []
    log("SCAN", f"Scanning: {url}")
    try:
        page.get(url, retry=1, timeout=20)
        bypass_protection(page)
        try:
            load_btn = page.ele('.load-more') or page.ele('#load-more-ajax')
            if load_btn: 
                load_btn.click()
                time.sleep(2)
        except: pass

        xpath_queries = [
            '//li[contains(@class,"wp-manga-chapter")]/a',
            '//ul[contains(@class,"version-chap")]//a',
            'tag:a@class=chapter-link', 
            'css:.chapter-link'
        ]
        
        for xpath in xpath_queries:
            try:
                if xpath.startswith('//'):
                    found_links = page.eles(f'xpath:{xpath}')
                else:
                    found_links = page.eles(xpath)
                
                for el in found_links:
                    try:
                        href = el.attr('href')
                        if not href or '#' in href or 'javascript' in href: continue
                        if '/manga/' not in href and '/series/' not in href: continue
                        num = extract_strict_number(el.text, href)
                        if num is not None and 0 < num < 9000:
                            chapters.append((num, href))
                    except: continue
            except: pass
    except Exception as e:
        log("ERROR", f"Scan failed: {e}")
    
    unique_chapters = {}
    for n, l in chapters:
        if n not in unique_chapters:
            unique_chapters[n] = l
    return sorted([(n, l) for n, l in unique_chapters.items()])

def get_images_scroller(page, url):
    log("Internal", "Scrolling to load images...")
    page.scroll.to_bottom()
    time.sleep(2)
    page.scroll.up(300)
    
    raw_images = []
    if 'olympustaff' in url:
        container = page.ele('.chapter-image-container') or page.ele('#readerarea') or page.ele('.reading-content')
        if container: raw_images = container.eles('tag:img')
        else: return []
    else:
        container = page.ele('.reading-content') or page.ele('.text-left') or page.ele('#readerarea')
        if container: raw_images = container.eles('tag:img')
        else: raw_images = page.eles('tag:img')
    
    def sort_key(img):
        try:
            eid = img.attr('id')
            if eid and 'image-' in eid: return int(eid.split('-')[-1])
        except: pass
        try:
            if img.rect: return img.rect.location[1]
        except: pass
        return 0

    try: raw_images.sort(key=sort_key)
    except: pass

    valid_urls = []
    seen = set()
    for img in raw_images:
        try:
            if img.rect.size[0] < 150: continue
            src = img.attr('src') or img.attr('data-src') or img.attr('lazy-src')
            if not src: continue
            src = src.strip()
            if any(x in src.lower() for x in ['cover', 'poster', 'logo', '.svg', 'avatar', 'facebook', 'twitter']): continue
            if src.startswith('//'): src = 'https:' + src
            if not src.startswith('http'): 
                base = "https://lekmanga.net"
                if 'olympustaff' in url: base = "https://olympustaff.com"
                if src.startswith('/'): src = base + src
                else: src = base + '/' + src
            clean = src.split('?')[0].lower()
            if clean not in seen:
                valid_urls.append(src)
                seen.add(clean)
        except: continue
    return valid_urls

# ==========================================
# 4. Main Run Loop
# ==========================================
def run():
    print("="*60)
    print(" DFK AUTO BOT - R2 EDITION 🚀")
    print(" Optimized for Max Storage Efficiency")
    print("="*60)
    
    co = ChromiumOptions()
    co.set_address('127.0.0.1:9222')
    
    browser = None
    try:
        browser = ChromiumPage(co)
        print(" [INFO] Connected to Browser.")
    except Exception as e:
        print(f" [FATAL] Could not connect: {e}")
        return

    while True:
        try:
            if browser: cleanup_tabs(browser)
            try:
                if not browser.address: raise Exception("Disconnected")
            except:
                log("WARN", "Browser disconnected. Reconnecting...")
                browser = ChromiumPage(co)

            grouped = {}
            for u in MONITOR_URLS:
                s = clean_slug(u)
                if s not in grouped: grouped[s] = []
                grouped[s].append(u)
            
            for slug, urls in grouped.items():
                print(f"\n--- Checking Series: {slug} ---")
                
                db_chap = 0
                manga_id = None
                try:
                    r = requests.get(f"{SYNC_ENDPOINT}?slug={slug}", timeout=10)
                    if r.status_code == 200:
                        data = r.json()
                        db_chap = float(data.get('last_chapter', 0))
                        manga_id = data.get('manga_id')
                except: 
                    log("ERROR", "DB Sync Failed. Skipping.")
                    continue
                
                if manga_id is None: continue

                available_map = {}
                sorted_urls = sorted(urls, key=lambda x: 0 if 'olympustaff' in x else 1)
                
                for u in sorted_urls:
                    found = scan_site_chapters(browser, u)
                    for n, l in found:
                        if n > db_chap:
                            if n not in available_map: available_map[n] = []
                            if l not in available_map[n]: available_map[n].append(l)
                
                if not available_map:
                    log("INFO", "Up to date.")
                    continue
                
                new_chaps = sorted(available_map.keys())
                log("INFO", f"Pending Chapters to Process: {new_chaps}")
                
                for idx, ch in enumerate(new_chaps):
                    print("-" * 50)
                    log(f"Chapter {ch}", f"Processing ({idx+1}/{len(new_chaps)})...")
                    
                    links = available_map[ch]
                    links.sort(key=lambda x: 0 if 'olympustaff' in x else 1)
                    
                    link_success = False 
                    
                    for link in links:
                        log("Step 1/3", f"Downloading from {link}")
                        
                        save_dir = os.path.join(os.getcwd(), slug, str(ch))
                        if os.path.exists(save_dir): 
                            try: shutil.rmtree(save_dir)
                            except: pass
                        os.makedirs(save_dir, exist_ok=True)
                        
                        try:
                            browser.get(link, retry=1, timeout=30)
                            cleanup_tabs(browser)
                            bypass_protection(browser)
                            
                            imgs = get_images_scroller(browser, link)
                            if len(imgs) < 2: continue
                            
                            log("DL", f"Found {len(imgs)} images. Downloading...")
                            
                            downloaded_files = []
                            for i, img_url in enumerate(imgs):
                                ext = "jpg"
                                if "png" in img_url.lower(): ext = "png"
                                elif "webp" in img_url.lower(): ext = "webp"
                                fname = f"{i:03d}.{ext}"
                                try:
                                    browser.download(img_url, save_path=save_dir, rename=fname)
                                    time.sleep(0.05)
                                except: pass
                            
                            # Wait for files
                            wait_timer = 0
                            while wait_timer < 60:
                                if os.path.exists(save_dir):
                                    files = sorted([os.path.join(save_dir, f) for f in os.listdir(save_dir)])
                                    if len(files) >= len(imgs) * 0.8: # Tolerance 80%
                                        downloaded_files = files
                                        break
                                time.sleep(1)
                                wait_timer += 1
                                
                            if not downloaded_files:
                                log("Error", "Download incomplete.")
                                continue

                            log("Step 2/3", f"Optimizing & Uploading to R2...")
                            r2_urls = []
                            
                            # Handle Long Strips (WEBP Limit) before Upload
                            # We iterate the downloaded files
                            # Note: `upload_to_r2` function handles resizing & webp.
                            # What about splitting extremely tall images?
                            # Let's add splitting logic here for safety or inside `upload_to_r2`?
                            # Inside `run` loop is safer to manage files.
                            
                            downloaded_files.sort(key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))
                            
                            for fpath in downloaded_files:
                                try:
                                    # SPLITTING LOGIC FOR LONG STRIPS
                                    im = Image.open(fpath)
                                    width, height = im.size
                                    WEBP_LIMIT = 16000 # Safety limit
                                    
                                    fragments = []
                                    if height > WEBP_LIMIT:
                                        print(f"   [Split] Image too tall ({height}px). Splitting...")
                                        num_parts = (height + WEBP_LIMIT - 1) // WEBP_LIMIT
                                        for k in range(num_parts):
                                            top = k * WEBP_LIMIT
                                            bottom = min((k + 1) * WEBP_LIMIT, height)
                                            crop_img = im.crop((0, top, width, bottom))
                                            # Save temp part
                                            part_name = f"{os.path.splitext(os.path.basename(fpath))[0]}_p{k}.png" # Temp png to avoid loss before optimization
                                            part_path = os.path.join(save_dir, part_name)
                                            crop_img.save(part_path)
                                            fragments.append(part_path)
                                    else:
                                        fragments.append(fpath)
                                        
                                    # Upload Fragments
                                    for frag in fragments:
                                        url = upload_to_r2(frag, f"manga/{slug}/{ch}")
                                        if url:
                                            r2_urls.append(url)
                                            print(f"       -> OK: {url}")
                                            
                                except Exception as e:
                                    print(f"       -> Err: {e}")

                            if len(r2_urls) > 0:
                                log("Step 3/3", f"Syncing {len(r2_urls)} images to DB...")
                                payload = {
                                    "manga_id": manga_id, 
                                    "chapter_number": ch, 
                                    "images": r2_urls, 
                                    "secret_key": API_SECRET
                                }
                                res_up = requests.post(UPLOAD_ENDPOINT, json=payload)
                                if res_up.status_code == 200:
                                    print(f" [DONE] Chapter {ch} Success!")
                                    link_success = True
                                    try: shutil.rmtree(save_dir)
                                    except: pass
                                    break 
                                else:
                                    log("Fail", f"API Error: {res_up.text}")
                            
                        except Exception as e:
                            log("Error", f"Processing exception: {e}")
                            if "disconnected" in str(e).lower(): break
                            
                    if not link_success:
                        print(f" [SKIP] Failed all sources for Chapter {ch}.")
            
            log("Sleep", f"Cycle done. Sleeping {CHECK_INTERVAL}s...")
            time.sleep(CHECK_INTERVAL)

        except Exception as e:
            log("CRASH", f"Main Loop Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    run()
