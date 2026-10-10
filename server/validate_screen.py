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
        if 'mCurrentFocus' in line and 'com.bukainjalan.app' in line:
            return True
    return False

def analyze_screen(img_path):
    """
    Returns detected screen type: 'home', 'onboarding_blue', 'onboarding_pink', 'auth_sheet', 'register_form', 'login_form', 'unknown'
    """
    try:
        im = Image.open(img_path)
    except Exception:
        return 'unknown'
    
    w, h = im.size
    
    # 1. Top bar at (100, 150)
    p_top = im.getpixel((100, 150))
    p_bot = im.getpixel((100, 2150))
    
    # Check if Auth Sheet is open (bottom sheet with blue "Daftar dengan Email" button)
    p_sheet_btn = im.getpixel((540, 1890))
    if p_sheet_btn[0] < 50 and p_sheet_btn[1] > 130 and p_sheet_btn[2] > 190 and p_top[2] > 90:
        return 'auth_sheet'
    
    # Check Register Form: White background at top, title "Buat Akun Baru" or logo
    p_bg = im.getpixel((540, 100))
    if p_bg[0] > 240 and p_bg[1] > 240 and p_bg[2] > 240:
        has_title = any(im.getpixel((x, 495))[0] < 60 for x in range(350, 750, 10))
        has_logo = any(im.getpixel((x, 220))[2] > 180 and im.getpixel((x, 220))[0] < 100 for x in range(400, 600, 10))
        if has_title or has_logo:
            return 'register_form'

    # Check Home Screen: Deep blue header and white bottom navigation
    if (p_top[2] > 80 and p_top[0] < 50) and (p_bot[0] > 220 and p_bot[1] > 220 and p_bot[2] > 220):
        return 'home'
    
    # Check Onboarding Slides
    if p_top[2] > 180 and p_top[0] < 50:
        return 'onboarding_blue'
    if p_top[0] > 200 and p_top[1] < 120 and p_top[2] > 120:
        return 'onboarding_pink'

    return 'unknown'

def main():
    if len(sys.argv) < 3:
        print("Usage: python validate_screen.py <device_id> <target_screen> [timeout_sec]", flush=True)
        sys.exit(1)
        
    device_id = sys.argv[1]
    target_screen = sys.argv[2]
    timeout_sec = float(sys.argv[3]) if len(sys.argv) > 3 else 25.0
    
    tmp_img = os.path.join(os.path.dirname(__file__), f"_val_{device_id}.png")
    start_time = time.time()
    
    while time.time() - start_time < timeout_sec:
        elapsed = time.time() - start_time
        
        # 1. Verify app has focus
        is_focused = check_app_focus(device_id)
        if not is_focused:
            print(f"WAIT|{elapsed:.1f}|Menunggu aplikasi BukainJalan fokus di layar...", flush=True)
            run_adb(device_id, 'shell', 'am', 'start', '-n', 'com.bukainjalan.app/.MainActivity')
            time.sleep(1.0)
            continue
            
        # 2. Capture and inspect
        capture_screen(device_id, tmp_img)
        detected = analyze_screen(tmp_img)
        
        # If target is Home, but we hit onboarding, auto skip it
        if target_screen == 'home':
            if detected == 'onboarding_blue':
                print(f"WAIT|{elapsed:.1f}|Melewati onboarding (tekan Lewati)...", flush=True)
                run_adb(device_id, 'shell', 'input', 'tap', '845', '140')
                time.sleep(0.8)
                continue
            elif detected == 'onboarding_pink':
                print(f"WAIT|{elapsed:.1f}|Menyelesaikan onboarding (tekan Mulai Sekarang)...", flush=True)
                run_adb(device_id, 'shell', 'input', 'tap', '520', '2010')
                time.sleep(1.5)
                continue
        
        if detected == target_screen:
            total_time = time.time() - start_time
            print(f"SUCCESS|{total_time:.1f}|{detected}", flush=True)
            if os.path.exists(tmp_img):
                try: os.remove(tmp_img)
                except: pass
            sys.exit(0)
            
        print(f"WAIT|{elapsed:.1f}|Menunggu layar '{target_screen}' (terdeteksi: '{detected}')...", flush=True)
        time.sleep(0.8)
        
    # Timeout reached
    total_time = time.time() - start_time
    print(f"TIMEOUT|{total_time:.1f}|Gagal mencapai layar '{target_screen}' dalam batas waktu", flush=True)
    sys.exit(1)

if __name__ == '__main__':
    main()
