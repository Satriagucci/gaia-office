import sys
import time
import subprocess
import os
from PIL import Image

def run_adb(device_id, *args):
    full_cmd = ['adb', '-s', device_id] + list(args)
    res = subprocess.run(full_cmd, capture_output=True, text=True, errors='ignore')
    return res.stdout.strip()

def capture_screen(device_id, local_path):
    run_adb(device_id, 'shell', 'screencap', '-p', '/sdcard/_val_tmp.png')
    run_adb(device_id, 'pull', '/sdcard/_val_tmp.png', local_path)
    run_adb(device_id, 'shell', 'rm', '/sdcard/_val_tmp.png')

def check_app_focus(device_id):
    out = run_adb(device_id, 'shell', 'dumpsys', 'window')
    for line in out.splitlines():
        if ('mCurrentFocus' in line or 'mFocusedApp' in line) and 'com.bukainjalan.app' in line:
            return True
    return False

def analyze_screen(img_path):
    """
    Returns detected screen type:
    'home', 'onboarding', 'auth_sheet', 'profile_logged_in', 'logout_dialog', 'register_form', 'login_form', 'unknown'
    """
    try:
        im = Image.open(img_path)
    except Exception:
        return 'unknown'
    
    w, h = im.size
    
    # Sample points (scaled to 1080x2280 basis)
    def px(x, y):
        sx = int(x * w / 1080)
        sy = int(y * h / 2280)
        return im.getpixel((min(sx, w-1), min(sy, h-1)))
    
    p_top = px(100, 150)
    p_bot = px(100, 2150)
    p_center = px(540, 1140)
    
    # 1. Check Logout Confirmation Dialog (ActionableSheet with red "Ya, Keluar" button)
    p_logout_btn = px(540, 2020)
    if p_logout_btn[0] > 200 and p_logout_btn[1] < 80 and p_logout_btn[2] < 80:
        return 'logout_dialog'
    
    # 2. Check Auth Sheet (Bottom sheet with blue "Daftar dengan Email" button at 540, 1890)
    p_sheet_btn = px(540, 1890)
    if p_sheet_btn[0] < 50 and p_sheet_btn[1] > 120 and p_sheet_btn[2] > 180 and p_top[2] > 60:
        return 'auth_sheet'
        
    # 3. Check Register Form: White header/top, blue logo or title
    p_bg = px(540, 100)
    if p_bg[0] > 235 and p_bg[1] > 235 and p_bg[2] > 235:
        has_title = any(px(x, 495)[0] < 80 for x in range(350, 750, 20))
        has_logo = any(px(x, 220)[2] > 160 and px(x, 220)[0] < 120 for x in range(400, 600, 20))
        if has_title or has_logo:
            return 'register_form'

    # 4. Check Login Form: White background with login elements
    if p_bg[0] > 235 and p_bg[1] > 235 and p_bg[2] > 235:
        p_login_btn = px(540, 1450)
        if p_login_btn[0] < 60 and p_login_btn[1] > 120 and p_login_btn[2] > 180:
            return 'login_form'

    # 5. Check Onboarding Slides (Top Skip button or carousel)
    # Blue slide 1
    if p_top[2] > 170 and p_top[0] < 60 and p_bot[2] > 150:
        return 'onboarding'
    # Pink / gradient slides
    if p_top[0] > 190 and p_top[1] < 130 and p_top[2] > 110:
        return 'onboarding'
    # Check "Lewati" text button area at top right (845, 140)
    p_skip = px(845, 140)
    if p_skip[0] > 200 and p_skip[1] > 200 and p_skip[2] > 200 and p_bot[0] < 50:
        return 'onboarding'

    # 6. Check Home Screen: Deep cyan/blue hero header and white bottom navbar
    if (p_top[2] > 70 and p_top[0] < 60) and (p_bot[0] > 210 and p_bot[1] > 210 and p_bot[2] > 210):
        return 'home'
        
    # 7. Check Profile Screen (when user is already logged in): White/light bg with profile menus
    if p_top[0] > 220 and p_top[1] > 220 and p_top[2] > 220 and p_bot[0] > 210:
        # Check if logout button is present near bottom (red icon/text)
        p_menu = px(100, 1800)
        return 'profile_logged_in'

    return 'unknown'

def main():
    if len(sys.argv) < 3:
        print("Usage: python validate_screen.py <device_id> <target_screen> [timeout_sec]", flush=True)
        sys.exit(1)
        
    device_id = sys.argv[1]
    target_screen = sys.argv[2]
    # Default 60s for home launching to allow cold-start on slow emulators
    default_timeout = 60.0 if target_screen == 'home' else 25.0
    timeout_sec = float(sys.argv[3]) if len(sys.argv) > 3 else default_timeout
    
    tmp_img = os.path.join(os.path.dirname(__file__), f"_val_{device_id}.png")
    start_time = time.time()
    last_am_start = 0
    
    while time.time() - start_time < timeout_sec:
        elapsed = time.time() - start_time
        
        # 1. Verify app has focus
        is_focused = check_app_focus(device_id)
        if not is_focused:
            # Rate limit am start: only retry after 12 seconds to prevent killing app init
            if time.time() - last_am_start > 12.0:
                print(f"WAIT|{elapsed:.1f}|Meluncurkan aplikasi & menunggu inisialisasi window...", flush=True)
                run_adb(device_id, 'shell', 'am', 'start', '-n', 'com.bukainjalan.app/.MainActivity')
                last_am_start = time.time()
            else:
                print(f"WAIT|{elapsed:.1f}|Menunggu engine React Native booting di emulator...", flush=True)
            time.sleep(1.2)
            continue
            
        # 2. Capture and inspect
        capture_screen(device_id, tmp_img)
        detected = analyze_screen(tmp_img)
        
        # If target is Home, but we hit onboarding, auto handle it
        if target_screen == 'home':
            if detected == 'onboarding':
                print(f"WAIT|{elapsed:.1f}|Terdeteksi layar Onboarding: Menekan 'Lewati'...", flush=True)
                run_adb(device_id, 'shell', 'input', 'tap', '845', '140')
                time.sleep(1.2)
                # Juga coba tap Mulai Sekarang jika berada di slide terakhir
                run_adb(device_id, 'shell', 'input', 'tap', '520', '2010')
                time.sleep(1.0)
                continue
        
        # Match target
        if detected == target_screen:
            total_time = time.time() - start_time
            print(f"SUCCESS|{total_time:.1f}|{detected}", flush=True)
            if os.path.exists(tmp_img):
                try: os.remove(tmp_img)
                except: pass
            sys.exit(0)
            
        print(f"WAIT|{elapsed:.1f}|Menunggu layar '{target_screen}' (terdeteksi: '{detected}')...", flush=True)
        time.sleep(1.0)
        
    # Timeout reached
    total_time = time.time() - start_time
    print(f"TIMEOUT|{total_time:.1f}|Gagal mencapai layar '{target_screen}' dalam batas waktu {timeout_sec}s", flush=True)
    sys.exit(1)

if __name__ == '__main__':
    main()
