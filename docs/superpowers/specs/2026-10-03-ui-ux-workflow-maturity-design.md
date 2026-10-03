# Design Spec: GAIA Office UI/UX & Workflow Maturity

- **Date**: 2026-10-03
- **Author**: Antigravity & SatriaGucci
- **Status**: Approved
- **Repository**: [gaia-office](https://github.com/Satriagucci/gaia-office) (D:\VPS\gaia-office)

---

## 1. Context & Objectives

GAIA Office is a virtual isometric pixel art office for BukainJalan / GAIA Hive agents.
While the initial skeleton provides 11 rooms, character sprites, and a Slack chat panel, several core UI and workflow features require maturation:
1. **Dynamic Room Rendering**: Currently, only MAIN_ROOM.furniture is rendered on all rooms; changing rooms displays misplaced desks instead of the selected room's furniture.
2. **Room Navigation**: Room buttons are basic HTML elements without badges, status, or icons.
3. **Agent Assignment & Filtering per Room**: Agents are all shown in the Main Office regardless of the active room or their functional assignments.
4. **Agent Inspection Modal**: Clicking an agent only pops a speech bubble, missing task inspection, logs, and interaction controls.
5. **Chat Sidebar Polish**: Glitched emoji encodings, single channel limitation, and lack of visual channel separation.

---

## 2. Architecture & Components

### 2.1 Dynamic Room & Furniture System
- **Current Room State**: currentRoomId: RoomId (e.g., 'main-office', 'ceo-office', 'meeting-room', 'kitchen', 'server-room', 'lobby', 'nap-room', 'rooftop', 'gym', 'parking').
- **Dynamic Data Resolution**:
  - ctiveRoom = ROOMS[currentRoomId]
  - ctiveFurniture = activeRoom.furniture
  - ctiveSpots = activeRoom.agentSpots
  - ctiveWaypoints = activeRoom.waypoints || []
- **Furniture Rendering & Sprite Mapping**:
  - In src/components/FurnitureRenderer.tsx, support room-specific items:
    - ceo-office: Executive desk (desk-exec), leather chair, bookcase, visitor couch, potted ficus.
    - meeting-room: Large conference table, meeting chairs, digital presentation whiteboard.
    - kitchen: Coffee counter (coffee-counter), espresso machine, refrigerator, dining table & chairs.
    - server-room: Multi-rack server bays with blinking status LEDs, terminal console.
    - lobby: Curved reception counter, lounge sofas, company sign.
    - 
ap-room: Sleeping pods, relaxation beanbags.
    - ooftop: Patio table with umbrella, rooftop plants, telescope.
    - gym: Treadmills, dumbbell rack.
    - parking: Company vehicles, EV charging station.
  - Pixel art styling with proper isometric isometric isometric depth (zIndex based on y coordinate).

### 2.2 Navigation Header with Dynamic Badges
- **Navigation Component**:
  - Pixel-themed tab bar displaying all 11 rooms with dedicated emoji/icons:
    - 🏢 Main Office
    - 👔 CEO Office
    - 💼 Manager Office
    - 📊 Meeting Room
    - ☕ Kitchen
    - 🖥️ Server Room
    - 🛋️ Lobby
    - 🛌 Wellness Room
    - 🌆 Rooftop Terrace
    - 🏋️ Gym
    - 🚗 Parking Garage
  - **Live Room Count Badge**: Real-time counter pill showing how many agents are currently in that room (e.g. [🖥️ Server Room · 2]).
  - **Quick Hotkeys / Left-Right Controls** for scrolling between rooms.

### 2.3 Agent Distribution & Room Presence
- **Initial Placement**:
  - oss -> ceo-office (or visiting main-office / meeting-room)
  - concierge -> lobby
  - devops-engineer / devops -> server-room
  - gaia / developers -> main-office
- **Room Filtering**:
  - The canvas renders agents located in currentRoomId: gents.filter(a => a.room === currentRoomId).
  - Agents can walk to doors to transition to another room, or be summoned via the UI.

### 2.4 Agent Inspector Modal
- **Trigger**: Clicking an agent sprite in the canvas opens the AgentInspectorModal.
- **Card Contents**:
  - **Header**: Animated sprite preview, Agent Name, Role badge, Current Room badge.
  - **Status & Mood**: Clocked in / Working / Thinking / On Break / Idle.
  - **Current Task**: Detailed task prompt or activity description.
  - **Recent Log Snippet**: Last 3 actions or tool calls made by this agent.
  - **Action Buttons**:
    - 💬 Chat with Agent (Focuses Slack chat and tags @AgentName).
    - 📍 Summon to Current Room (Moves the agent to the currently viewed room).
    - ⚡ Assign Task (Opens quick prompt input).

### 2.5 Slack Chat Polish & Channel Switching
- **Channels**:
  - #office-general: Team chatter, watercooler talk, general updates.
  - #dev-ops: Build updates, server logs, code reviews, debugging.
  - #incidents: System alerts, error logs, and notifications.
- **Emoji & Encoding Fixes**:
  - Clean UTF-8 emojis (👑, 💻, 🚀, ☕, ⚡, ✅, 🔥).
  - Animated typing indicator when agents are composing replies.
  - Sound feedback on message receive and send (with volume/mute control).

---

## 3. Data Flow & State Management

1. **Room Switch**:
   User clicks a room button -> setCurrentRoomId(newRoomId) -> Canvas re-renders with ROOMS[newRoomId] background, furniture, and agents located in 
ewRoomId.
2. **Agent Event from Server (WebSocket / HTTP)**:
   Backend sends gent_spawned / gent_working / gent_completed / chat_message -> useAgentSocket receives event -> updates gents state and room status -> updates SlackChat messages.
3. **Agent Inspection**:
   User clicks Agent Sprite -> setSelectedAgent(agent) -> renders AgentInspectorModal with live data.

---

## 4. Implementation Steps (Writing Plans Outline)

1. **Config & Build Stability**:
   - Fix src/config.ts top-level await and create standard fallback for office.config.json.
   - Update ite.config.ts to cleanly proxy port 8788.
2. **Dynamic Room Furniture & Background**:
   - Update App.tsx and FurnitureRenderer.tsx to render furniture based on ROOMS[currentRoomId].
   - Implement room-specific furniture items and pixel styling.
3. **Enhanced Room Navigation**:
   - Build RoomNavBar component with room icons, active states, and agent count badges.
4. **Agent Room Filtering & Summoning**:
   - Filter rendered agents by currentRoomId.
   - Add default room assignment for roles (CEO, DevOps, Concierge, Devs).
5. **Agent Inspector Modal**:
   - Create AgentInspectorModal.tsx with agent stats, task info, and summon/chat actions.
6. **Slack Chat Channels & Encoding Cleanup**:
   - Add channel switcher (#office-general, #dev-ops, #incidents).
   - Fix all string mojibake to clean UTF-8 emojis.
7. **End-to-End Validation**:
   - Run Vite and Express server, verify in browser subagent, take screenshots of different rooms and modal interactions.
