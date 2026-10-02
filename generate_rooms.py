#!/usr/bin/env python3
"""Generate pixel art room backgrounds for GAIA Office"""
import math
from PIL import Image, ImageDraw

def create_room(name, w=4800, h=3584, floor_color=(200, 180, 150), wall_color=(180, 200, 220)):
    """Create isometric pixel art room background"""
    img = Image.new('RGB', (w, h), (240, 235, 225))
    draw = ImageDraw.Draw(img)
    
    # Floor gradient
    for y in range(h//3, h):
        t = (y - h//3) / (h - h//3)
        r = int(floor_color[0] * (1 - t*0.3) + 220 * t*0.3)
        g = int(floor_color[1] * (1 - t*0.3) + 215 * t*0.3)
        b = int(floor_color[2] * (1 - t*0.3) + 205 * t*0.3)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    
    # Wall area (top third)
    for y in range(0, h//3):
        t = y / (h//3)
        r = int(wall_color[0] * (1 - t*0.2) + 200 * t*0.2)
        g = int(wall_color[1] * (1 - t*0.2) + 200 * t*0.2)
        b = int(wall_color[2] * (1 - t*0.2) + 210 * t*0.2)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    
    return img

def add_floor_tiles(draw, w, h, color=(180, 160, 130)):
    """Add isometric floor tiles"""
    for y in range(h//3, h, 40):
        offset = (y // 40) % 2 * 20
        for x in range(offset, w, 40):
            # Small diamond tile
            points = [(x, y), (x+20, y+10), (x, y+20), (x-20, y+10)]
            draw.polygon(points, outline=(*[c-20 for c in color],), fill=None)

def add_window(draw, x, y, w=200, h=300):
    """Add a window"""
    # Frame
    draw.rectangle([x, y, x+w, y+h], fill=(100, 150, 200), outline=(150, 170, 190), width=4)
    # Glass
    draw.rectangle([x+8, y+8, x+w-8, y+h-8], fill=(160, 200, 240, 80), outline=None)
    # Cross bars
    draw.line([(x+w//2, y+8), (x+w//2, y+h-8)], fill=(150, 170, 190), width=3)
    draw.line([(x+8, y+h//2), (x+w-8, y+h//2)], fill=(150, 170, 190), width=3)
    # Light reflection
    draw.rectangle([x+10, y+10, x+w//2-4, y+h//2-4], fill=(200, 225, 250, 40), outline=None)

def add_desk(draw, x, y, w=100, h=60, color=(140, 100, 60)):
    """Add an isometric desk"""
    # Desk top
    points = [(x, y), (x+w, y+20), (x, y+40), (x-w, y+20)]
    draw.polygon(points, fill=(*[c+20 for c in color],), outline=(80, 60, 30))
    # Front panel
    points2 = [(x-w, y+20), (x, y+40), (x, y+60), (x-w, y+40)]
    draw.polygon(points2, fill=color, outline=(80, 60, 30))
    # Monitor
    mx, my = x, y-10
    draw.rectangle([mx-15, my-10, mx+15, my+10], fill=(30, 40, 60), outline=(100, 100, 120))
    draw.rectangle([mx-12, my-8, mx+12, my+8], fill=(60, 100, 180))  # screen

def add_chair(draw, x, y, color=(100, 80, 60)):
    """Add an isometric chair"""
    # Seat
    points = [(x-15, y), (x+5, y+8), (x-15, y+16), (x-35, y+8)]
    draw.polygon(points, fill=color, outline=(60, 40, 20))
    # Back
    points2 = [(x-15, y), (x+5, y+8), (x+5, y-8), (x-15, y-16)]
    draw.polygon(points2, fill=(*[c+20 for c in color],), outline=(60, 40, 20))

def add_plant(draw, x, y, size=30):
    """Add a potted plant"""
    # Pot
    points = [(x-10, y), (x+10, y+5), (x-5, y+20), (x-25, y+15)]
    draw.polygon(points, fill=(160, 100, 60), outline=(100, 60, 30))
    # Leaves
    for i in range(5):
        angle = i * 72 + 30
        lx = x - 8 + int(math.cos(math.radians(angle)) * size)
        ly = y + int(math.sin(math.radians(angle)) * size * 0.5)
        draw.ellipse([lx-8, ly-12, lx+8, ly+4], fill=(50, 140, 60), outline=None)

def add_bookshelf(draw, x, y, w=60, h=80):
    """Add a bookshelf"""
    draw.rectangle([x, y, x+w, y+h], fill=(120, 80, 40), outline=(80, 50, 20))
    # Shelves
    for i in range(3):
        sy = y + 10 + i * 22
        draw.line([(x+2, sy), (x+w-2, sy)], fill=(80, 50, 20), width=2)
        # Books
        for j in range(3):
            bx = x + 5 + j * 18
            bw = 10 + (j*3)
            bh = 12 + (j*2)
            book_colors = [(200, 50, 50), (50, 100, 200), (50, 180, 80), (200, 180, 50)]
            draw.rectangle([bx, sy-bh+2, bx+bw, sy-1], fill=book_colors[(i+j)%4], outline=None)

# ====== GENERATE ALL ROOMS ======
rooms = {
    'office-day': {
        'floor': (200, 180, 150),
        'wall': (180, 200, 220),
        'desc': 'Main Office'
    },
    'office-night': {
        'floor': (120, 110, 90),
        'wall': (80, 90, 110),
        'desc': 'Main Office Night'
    },
    'ceo-office': {
        'floor': (180, 160, 130),
        'wall': (200, 180, 160),
        'desc': 'CEO Office'
    },
    'meeting-room': {
        'floor': (190, 200, 180),
        'wall': (200, 210, 190),
        'desc': 'Meeting Room'
    },
    'kitchen-cafeteria': {
        'floor': (210, 190, 160),
        'wall': (220, 210, 190),
        'desc': 'Kitchen'
    },
    'server-room': {
        'floor': (150, 160, 170),
        'wall': (100, 110, 130),
        'desc': 'Server Room'
    },
    'lobby-reception': {
        'floor': (200, 195, 180),
        'wall': (190, 200, 210),
        'desc': 'Lobby'
    },
    'gym-fitness-room': {
        'floor': (180, 190, 200),
        'wall': (200, 210, 220),
        'desc': 'Gym'
    },
    'rooftop-terrace': {
        'floor': (170, 180, 190),
        'wall': (150, 160, 180),
        'desc': 'Rooftop'
    },
    'parking-garage': {
        'floor': (130, 130, 140),
        'wall': (100, 100, 110),
        'desc': 'Parking'
    },
    'nap-wellness-room': {
        'floor': (200, 190, 200),
        'wall': (210, 200, 210),
        'desc': 'Nap Room'
    },
}

output_dir = '/home/hermes/gaia-vault/gaia-office/public/rooms'
W, H = 4800, 3584

for name, cfg in rooms.items():
    print(f"Generating {cfg['desc']}...")
    img = create_room(name, W, H, cfg['floor'], cfg['wall'])
    draw = ImageDraw.Draw(img)
    
    # Add furniture based on room type
    if 'office-day' in name:
        # Windows
        add_window(draw, 100, 80, 250, 350)
        add_window(draw, 450, 80, 250, 350)
        add_window(draw, 900, 80, 250, 350)
        # Desks
        add_desk(draw, 800, 1800)
        add_desk(draw, 1000, 1400)
        add_desk(draw, 600, 1400)
        add_desk(draw, 1200, 1800)
        add_desk(draw, 1400, 1400)
        add_desk(draw, 1600, 1800)
        # Plants
        add_plant(draw, 300, 2800)
        add_plant(draw, 4200, 2800)
        add_plant(draw, 2200, 1000)
        # Bookshelf
        add_bookshelf(draw, 4400, 500, 80, 120)
    elif 'ceo-office' in name:
        add_window(draw, 200, 80, 300, 400)
        add_desk(draw, 2400, 1600, 160, 80, (160, 100, 50))
        add_chair(draw, 2400, 1700, (120, 80, 40))
        add_plant(draw, 500, 2800, 40)
        add_bookshelf(draw, 4400, 400, 100, 150)
    elif 'meeting' in name:
        # Meeting table
        draw.polygon([(2200, 1400), (2800, 1600), (2200, 1800), (1600, 1600)], 
                     fill=(160, 120, 80), outline=(100, 70, 40))
        # Chairs around
        for dx, dy in [(-100, 0), (100, 0), (0, -100), (0, 100)]:
            add_chair(draw, 2200+dx, 1600+dy)
        add_window(draw, 100, 80, 400, 300)
    elif 'kitchen' in name:
        # Counter
        draw.rectangle([500, 2200, 1500, 2300], fill=(180, 160, 140), outline=(120, 100, 80))
        # Coffee machine spot
        draw.rectangle([700, 2100, 850, 2200], fill=(80, 80, 90), outline=(50, 50, 60))
        # Table
        draw.polygon([(2500, 2000), (2800, 2100), (2500, 2200), (2200, 2100)], 
                     fill=(180, 150, 100), outline=(100, 70, 40))
        # Chairs
        add_chair(draw, 2500, 2250)
        add_chair(draw, 2200, 2000)
    elif 'server' in name:
        # Server racks
        for i in range(4):
            sx = 2000 + i * 120
            draw.rectangle([sx, 1600, sx+80, 2000], fill=(60, 60, 70), outline=(40, 40, 50))
            # Blinking lights
            for j in range(5):
                ly = 1620 + j * 70
                draw.rectangle([sx+10, ly, sx+70, ly+30], fill=(20, 25, 35), outline=None)
                draw.ellipse([sx+15, ly+5, sx+25, ly+15], fill=(0, 200, 0), outline=None)
                draw.ellipse([sx+55, ly+5, sx+65, ly+15], fill=(0, 100, 200), outline=None)
        # Cooling floor
        draw.rectangle([1800, 2100, 2400, 2140], fill=(80, 90, 100), outline=None)
    elif 'lobby' in name:
        # Reception desk
        draw.polygon([(2000, 1600), (2200, 1620), (2200, 1700), (2000, 1680)], 
                     fill=(150, 120, 90), outline=(100, 70, 40))
        # Sofa
        draw.rectangle([1000, 2200, 1200, 2280], fill=(100, 100, 150), outline=(60, 60, 100))
        add_plant(draw, 500, 2800, 50)
        add_plant(draw, 4200, 2800, 50)
    elif 'gym' in name:
        # Treadmill
        draw.rectangle([2000, 1700, 2200, 1750], fill=(80, 80, 90), outline=(50, 50, 60))
        draw.rectangle([2050, 1650, 2150, 1700], fill=(60, 60, 70), outline=None)
        # Weights rack
        draw.rectangle([1000, 2000, 1100, 2200], fill=(120, 120, 120), outline=(80, 80, 80))
        draw.ellipse([1050, 2100, 1070, 2120], fill=(80, 80, 80), outline=None)
    elif 'rooftop' in name:
        # Sky gradient
        for y in range(0, H//4):
            t = y / (H//4)
            r = int(100 + t * 100)
            g = int(150 + t * 80)
            b = int(200 + t * 40)
            draw.line([(0, y), (W, y)], fill=(r, g, b))
        # Railing
        draw.line([(0, H//3), (W, H//3)], fill=(150, 150, 160), width=8)
        # Plants
        add_plant(draw, 500, 2800, 50)
        add_plant(draw, 4000, 2800, 50)
        # Table + umbrella
        draw.rectangle([2300, 1700, 2500, 1750], fill=(150, 130, 100), outline=None)
        # Umbrella
        draw.ellipse([2200, 1480, 2600, 1680], fill=(200, 80, 80), outline=(150, 50, 50))
    elif 'parking' in name:
        # Floor lines
        for i in range(6):
            lx = 600 + i * 700
            draw.line([(lx, H//2), (lx+300, H//2+150)], fill=(200, 200, 100), width=6)
        # Cars (simple rectangles)
        for i in range(3):
            cx = 800 + i * 1400
            draw.rectangle([cx, H-600, cx+400, H-500], fill=(100, 100, 180), outline=(60, 60, 120))
            draw.ellipse([cx+40, H-490, cx+100, H-470], fill=(50, 50, 50), outline=None)
            draw.ellipse([cx+300, H-490, cx+360, H-470], fill=(50, 50, 50), outline=None)
    elif 'nap' in name:
        # Sleep pods
        for i in range(3):
            px = 1200 + i * 800
            draw.rectangle([px, 1700, px+400, 1900], fill=(100, 120, 160), outline=(60, 80, 120))
            draw.rectangle([px+20, 1720, px+380, 1880], fill=(140, 160, 200), outline=None)
            # Pillow
            draw.ellipse([px+30, 1720, px+100, 1780], fill=(200, 200, 220), outline=None)
        add_plant(draw, 500, 2800, 40)
    
    path = f"{output_dir}/{name}.png"
    img.save(path)
    print(f"  Saved {path} ({img.size[0]}x{img.size[1]})")

print("\nDone! All rooms generated.")
