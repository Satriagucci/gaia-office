# Design Spec: GAIA Office UI/UX, Workflow Maturity & Command Dashboard

- **Date**: 2026-10-03
- **Author**: Antigravity & SatriaGucci
- **Status**: Approved
- **Repository**: [gaia-office](https://github.com/Satriagucci/gaia-office) (D:\VPS\gaia-office)

---

## 1. Context & Objectives

GAIA Office is a virtual isometric pixel art office for BukainJalan / GAIA Hive agents.
This specification expands the platform into a comprehensive **interactive virtual office (Gather.town style)** combined with an **Executive Division Kanban & Workflow Command Center**.

Key additions requested:
1. **Spotlight & Smooth Follow Camera** (Gather.town style): Viewport tracking agents or Boss, moving background/camera smoothly, and transitioning rooms seamlessly through doors.
2. **Player Controls (Boss / User)**: WASD and Arrow Key movement, click-to-move, walking animations, proximity interactions with agents, and doorway room hopping.
3. **Division Workflow Kanban Dashboard**:
   - Executive board categorized into:
     - ⚠️ **Butuh Saya** (Needs Boss approval / decision / unblock)
     - 🚀 **Jalan** (In Progress / actively being executed by agents)
     - 📋 **Antrean** (Backlog / Queued tasks)
     - 🅿️ **Parkir** (Parked / paused / on-hold tasks)
     - 🗑️ **Usul Buang** (Proposed for discard / deprecate, awaiting Boss approval)
   - Division filtering (Core Product, Engineering, QA/Security, DevOps, Ops/Support).
   - Spotlight Agent button to jump camera straight to the agent working on that task.

---

## 2. Architecture & Detailed Features

### 2.1 Gather.town Camera & Spotlight System
- **Camera Viewport**:
  - The office viewport operates with dynamic CSS transforms (	ranslate3d(x, y, 0) with smooth interpolation/lerp).
  - Mode toggle:
    - **Follow Boss (Default)**: Camera follows the user's Boss character.
    - **Spotlight Agent**: Clicking an agent or clicking a task in the dashboard centers the camera on that agent.
    - **Free Pan**: Click-and-drag or overview mode.
- **Doorway Transitions**:
  - When the followed character walks into a doorway hotspot (connections in ROOMS), trigger room change:
    - Target room loads dynamically (ROOMS[toRoom]).
    - Character appears at the entry doorway of the new room.
    - Camera smoothly follows into the new room.

### 2.2 Player Controls (Boss Character)
- **Controls**:
  - **WASD / Arrow Keys**: Real-time velocity movement with walking sprite frames (Me-1-front-left.png, Me-1-front-right.png, etc.).
  - **Click-to-Move**: Right-click or left-click on the floor sends the Boss walking to target coordinate.
- **Proximity Interactions**:
  - Distance check (Math.hypot(boss.x - agent.x, boss.y - agent.y) < 6%):
  - Shows floating action pill: [E] Ngobrol dengan {agent.name} or click to open conversation.
  - Near coffee machine: [E] Ambil Kopi ☕.
  - Near whiteboard in meeting room: [E] Buka Meeting Board 📊.

### 2.3 Division Workflow Kanban Dashboard
- **Access**: Top Bar button 📊 Dashboard Divisi or Hotkey Tab / D.
- **5 Workflow Columns**:
  1. ⚠️ **Butuh Saya (Needs Boss Action)**:
     - Items where agents require human decision (PR approval, budget/decision sign-off, ambiguity check).
     - Action buttons: [✅ Setujui], [💬 Beri Catatan], [❌ Tolak/Revisi].
  2. 🚀 **Jalan (In Progress)**:
     - Tasks currently actively running with assigned agent avatar, division tag, and progress status.
     - Action button: [🎯 Spotlight Agent] (jumps camera to that agent in the office).
  3. 📋 **Antrean (Queue)**:
     - Backlog tasks waiting for an agent to be free or scheduled.
     - Action button: [⚡ Tugaskan Sekarang].
  4. 🅿️ **Parkir (Parked / On Hold)**:
     - Tasks temporarily frozen or blocked by external dependencies.
     - Action button: [▶️ Lanjutkan].
  5. 🗑️ **Usul Buang (Discard Proposals)**:
     - Dead ends, obsolete tasks, or duplicate ideas proposed to be closed.
     - Action buttons: [🗑️ Buang], [🔄 Hidupkan Lagi].
- **Division Filter Tabs**:
  - Semua Divisi, Core & Product, Engineering, QA & Security, DevOps & Infra, Operations.

### 2.4 Dynamic Room & Furniture System
- Ensure each room renders its unique isometric furniture items:
  - main-office: Standing desk pods, dual monitors, coffee corner, printer, filing cabinets.
  - ceo-office: Executive desk, leather armchair, library bookcase, visitor couch, golden trophy.
  - meeting-room: Large conference table, whiteboard projector, conference chairs.
  - kitchen: Barista espresso station, refrigerator, dining tables, water cooler.
  - server-room: Server rack towers with flashing status LEDs, network console.
  - lobby: Reception counter, lounge seating, company directory board.
  - 
ap-room: Wellness pods, beanbags, dim ambient lights.
  - ooftop: Terrace umbrella table, observation telescope, planters.
  - gym: Treadmills, bench presses.
  - parking: Company vehicles and chargers.

### 2.5 Slack Chat Polish & Channels
- Channels: #office-general, #dev-ops, #incidents.
- Clean UTF-8 emojis (👑, 💻, 🚀, ☕, ⚡, ✅, 🔥, 🅿️, 🗑️).
- Typing indicator and audio feedback.

---

## 3. Implementation Plan

1. **Phase 1: Config, State & Model Foundations**
   - Clean src/config.ts and office.config.json.
   - Update 	ypes.ts to include Task Kanban types (DivisionTask, TaskStatus: 'needs_boss' | 'in_progress' | 'queued' | 'parked' | 'discard_proposed').
   - Store mock & real tasks in state with persistence / WebSocket sync.
2. **Phase 2: Boss Player Controls & Proximity System**
   - Implement usePlayerControls hook (WASD, Arrow keys, click-to-move).
   - Add proximity detection and floating interaction prompts.
3. **Phase 3: Spotlight & Follow Camera Viewport**
   - Build panning viewport container that smoothly tracks active target.
   - Implement seamless doorway transitions between connected rooms.
4. **Phase 4: Dynamic Room Furniture & Pixel Backgrounds**
   - Wire ROOMS[currentRoomId].furniture in FurnitureRenderer.tsx.
   - Add furniture sprite definitions and visual enhancements.
5. **Phase 5: Division Workflow Kanban Dashboard**
   - Create DivisionDashboard.tsx with the 5 columns, division filters, action buttons, and Spotlight-to-Agent jump.
6. **Phase 6: Navigation Header & Slack Chat Polish**
   - Update RoomNavBar with badges and icons.
   - Polish Slack channels and clean up emoji encoding bugs.
7. **Phase 7: End-to-End Testing & Verification**
   - Test in browser, verify camera follow, player movement, room transitions, dashboard actions, and chat.
