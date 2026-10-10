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
    
    # 1. Check Home Screen FIRST: Deep cyan/blue hero header and pure white bottom navbar
    is_home_header = (p_top[2] > 70 and p_top[0] < 80)
    is_white_navbar = (p_bot[0] > 210 and p_bot[1] > 210 and p_bot[2] > 210)
    if is_home_header and is_white_navbar:
        return 'home'

    # 2. Check Logout Confirmation Dialog (ActionableSheet with red "Ya, Keluar" button)
    p_logout_btn = px(540, 2020)
    if p_logout_btn[0] > 200 and p_logout_btn[1] < 80 and p_logout_btn[2] < 80:
        return 'logout_dialog'

    # 3. Check Auth Sheet / Login Sheet ("Masuk ke Akun Anda")
    # Has blue "Masuk" button at (540, 1480) or blue "Daftar di sini" at (650, 1680) or "Daftar dengan Email" at (540, 1890)
    p_login_btn = px(540, 1480)
    p_daftar_link = px(650, 1680)
    p_sheet_btn = px(540, 1890)
    
    is_login_blue = (p_login_btn[0] < 60 and p_login_btn[1] > 120 and p_login_btn[2] > 180)
    is_daftar_link_blue = (p_daftar_link[0] < 60 and p_daftar_link[1] > 120 and p_daftar_link[2] > 180)
    is_sheet_btn_blue = (p_sheet_btn[0] < 60 and p_sheet_btn[1] > 120 and p_sheet_btn[2] > 180)

    if is_login_blue or is_daftar_link_blue or is_sheet_btn_blue:
        return 'auth_sheet'

    # 4. Check Register Form ("Buat Akun Baru")
    # White background, dark title "Buat Akun Baru" at y≈450-550, and input fields
    p_bg = px(540, 100)
    if p_bg[0] > 230 and p_bg[1] > 230 and p_bg[2] > 230:
        has_reg_title = sum(1 for x in range(350, 750, 30) if px(x, 500)[0] < 100) >= 3
        # Verify it's not login form (in register form, login button at 1480 is NOT blue)
        if has_reg_title and not is_login_blue:
            return 'register_form'

    # 5. Check Onboarding Slides (ONLY if bottom navbar is NOT white)
    if not is_white_navbar:
        # Blue slide 1 (solid blue all over)
        if p_top[2] > 170 and p_top[0] < 60 and p_bot[2] > 150:
            return 'onboarding'
        # Pink / gradient slides
        if p_top[0] > 190 and p_top[1] < 130 and p_top[2] > 110:
            return 'onboarding'
        # Check "Lewati" text button area at top right (845, 140)
        p_skip = px(845, 140)
        if p_skip[0] > 200 and p_skip[1] > 200 and p_skip[2] > 200:
            return 'onboarding'

    # 6. Check Profile Screen (when user is already logged in): White top and white bottom
    if p_top[0] > 220 and p_top[1] > 220 and p_top[2] > 220 and is_white_navbar:
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
