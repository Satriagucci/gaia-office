# GAIA Office

Virtual office pixel art untuk GAIA Hive — visualisasi tim kerja BukainJalan dalam bentuk kantor isometric pixel art yang imut dan interaktif.

Lihat agent bekerja secara real-time: mereka duduk di meja, jalan ke meeting room, ngopi di kitchen, ngobrol di Slack panel — semua dalam satu kantor pixel yang bisa kamu jelajahi.

## Fitur

- **11 ruangan** — Main Office, CEO Office, Meeting Room, Kitchen, Server Room, Lobby, Gym, Rooftop, Parking, Nap Room, Manager Office
- **Navigasi antar ruangan** — klik tombol di atas untuk pindah ruangan
- **Slack-style chat panel** — chat dengan agent secara real-time
- **Day/Night mode** — suasana kantor berubah otomatis
- **Karakter wanita** — GAIA, Alya, Rani, Dina, Laras
- **Light mode UI** — warna biru GAIA (#2196f3)

## Cara Jalanin

```bash
npm install
npm run server &          # Backend WebSocket (port 8788)
npx vite --host 0.0.0.0  # Frontend (port 5173)
```

Buka `http://localhost:5173`

## Struktur

```
gaia-office/
├── server/index.js        # Express + WebSocket backend
├── src/                   # React frontend
│   ├── App.tsx            # Main app
│   ├── config.ts          # Character/role mapping
│   ├── rooms.ts           # Room definitions
│   ├── theme.ts           # Theme & room images
│   ├── components/        # React components
│   │   ├── SlackChat.tsx  # Chat panel
│   │   ├── Character.tsx  # Character sprite renderer
│   │   └── FurnitureRenderer.tsx
│   └── styles/office.css  # Light mode styles
├── public/rooms/          # Room background images
├── public/sprites/        # Character & furniture sprites
└── generate_rooms.py      # Script generate room backgrounds
```

## Tech Stack

- React + TypeScript + Vite
- Express + WebSocket
- Pixel art isometric (Pillow-generated backgrounds)
- MIT License
