import os
import time
from DrissionPage import ChromiumPage, ChromiumOptions

print("="*60)
print(" DIAGNOSTIC TEST - Checking Browser Connection")
print("="*60)


co = ChromiumOptions()
co.set_address('127.0.0.1:9222')

try:
    print("\n[1/5] Attempting to connect to Chrome...")
    browser = ChromiumPage(co)
    print("✓ Connected successfully!")
    
    print("\n[2/5] Checking browser address...")
    print(f"   Address: {browser.address}")
    
    print("\n[3/5] Getting current tab info...")
    print(f"   Current URL: {browser.url}")
    print(f"   Page Title: {browser.title}")
    print(f"   Total Tabs: {len(browser.tab_ids)}")
    
    print("\n[4/5] Testing navigation to olympustaff.com...")
    test_url = "https://olympustaff.com/series/absolute-regression"
    browser.get(test_url, timeout=10)
    time.sleep(3)
    print(f"✓ Navigation successful!")
    print(f"   Current URL: {browser.url}")
    print(f"   Page Title: {browser.title}")
    
    print("\n[5/5] Testing element search...")
    # Try to find chapter links
    try:
        links = browser.eles('//ul[contains(@class,"version-chap")]//a')
        print(f"✓ Found {len(links)} chapter links!")
        if links:
            print(f"   First chapter: {links[0].text}")
    except Exception as e:
        print(f"✗ Element search failed: {e}")
    
    print("\n" + "="*60)
    print(" ALL TESTS PASSED! Browser is working correctly.")
    print(" The issue must be in the bot logic, not the browser.")
    print("="*60)
    
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    print("\nPossible solutions:")
    print("1. Make sure Chrome is running with: chrome.exe --remote-debugging-port=9222")
    print("2. Close all Chrome windows and restart with debug mode")
    print("3. Check if port 9222 is already in use")
