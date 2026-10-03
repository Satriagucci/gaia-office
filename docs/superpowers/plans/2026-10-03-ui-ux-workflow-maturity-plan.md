# Implementation Plan: GAIA Office UI/UX, Workflow Maturity & Command Dashboard

- **Spec**: docs/superpowers/specs/2026-10-03-ui-ux-workflow-maturity-design.md
- **Date**: 2026-10-03

---

### Task 1: Type Definitions & Config Stability
- [ ] Update src/types.ts with DivisionTask, TaskStatus, Division, and agent interaction types.
- [ ] Fix src/config.ts to remove top-level wait import(...) and provide safe static defaults for office.config.json.
- [ ] Verify ite.config.ts build settings (uild: { target: 'esnext' }).

### Task 2: Dynamic Room & Furniture System
- [ ] Populate urniture arrays in src/rooms.ts for all rooms (ceo-office, meeting-room, kitchen, server-room, lobby, 
ap-room, ooftop, gym, parking, manager-office).
- [ ] Expand src/components/FurnitureRenderer.tsx with sprite mappings and isometric placement for newly defined furniture.
- [ ] Update src/App.tsx so FurnitureRenderer dynamically uses ROOMS[currentRoomId].furniture.
- [ ] Filter visible canvas agents by currentRoomId.

### Task 3: Gather.town Camera & Room Transitions
- [ ] Implement smooth camera follow system in App.tsx using CSS viewport transformations (	ranslate3d).
- [ ] Support Follow Target: Boss character or any clicked/selected agent.
- [ ] Implement doorway hotspot detection: when the active character reaches a door, automatically switch room and position them at the new room's entrance.

### Task 4: Player Controls (Boss Movement)
- [ ] Implement keyboard navigation (WASD & Arrow Keys) with continuous movement and 4-direction facing sprites.
- [ ] Implement click-to-move on canvas floor.
- [ ] Add proximity detection: floating action pill when near another agent ([E] Ngobrol dengan {agent.name}).

### Task 5: Division Workflow Kanban Dashboard
- [ ] Create src/components/DivisionDashboard.tsx with the 5 columns:
  - ⚠️ Butuh Saya
  - 🚀 Jalan
  - 📋 Antrean
  - 🅿️ Parkir
  - 🗑️ Usul Buang
- [ ] Support division filter tabs (Semua, Core & Product, Engineering, QA & Security, DevOps, Operations).
- [ ] Add [Spotlight Agent] button on task cards that closes the dashboard, switches to the agent's room, and centers the camera on them.
- [ ] Provide initial mock tasks for GAIA, DevOps, Fullstack, Tester, and Concierge so the board is immediately alive and actionable.

### Task 6: Modern Navigation Header & Slack Polish
- [ ] Redesign the top room navigation bar with icons, sleek cyber-pixel styling, and real-time agent count badges.
- [ ] Add header buttons for 📊 Dashboard Divisi (D) and 🎯 Spotlight Boss (Space).
- [ ] Polish SlackChat.tsx: support channels (#office-general, #dev-ops, #incidents) and fix mojibake string corruptions with clean UTF-8 emojis.

### Task 7: Verification & Build
- [ ] Run 
pm run build and ensure 0 TypeScript / build errors.
- [ ] Use rowser_subagent to test the live application at http://localhost:3334, verify keyboard controls, room switching, dashboard interaction, and capture verification screenshots.
