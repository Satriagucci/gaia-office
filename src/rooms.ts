// ===== ROOM DEFINITIONS =====
// Each room is an empty shell with positions for furniture placement
// Furniture items are placed on a grid within each room

export type RoomId = 'main-office'

export interface Waypoint {
  id: string
  x: number  // percentage
  y: number
  connections: string[]  // ids of connected waypoints
}

export interface FurnitureItem {
  id: string
  type: string        // e.g. 'desk-dual', 'chair-aeron', 'plant-monstera'
  sprite: string      // sprite sheet + frame reference
  x: number           // percentage position within room (0-100)
  y: number
  zIndex?: number
  state?: string      // e.g. 'empty', 'occupied', 'brewing'
  interactive?: boolean
  label?: string
}

export type SpriteFacing = 'front-left' | 'front-right' | 'rear-left' | 'rear-right'

export interface RoomConnection {
  toRoom: RoomId
  position: { x: number; y: number }  // door/exit position in current room (%)
  label?: string
  exitFacing?: SpriteFacing   // agent direction when leaving through this door
  entryFacing?: SpriteFacing  // agent direction when arriving through this door
}

export interface AgentSpot {
  id: string
  type: 'desk' | 'meeting-seat' | 'lounge' | 'standing' | 'water' | 'coffee' | 'filing' | 'printer' | 'door'
  x: number
  y: number
  facing?: 'up' | 'down' | 'left' | 'right'
  spriteFacing?: SpriteFacing  // which direction the agent faces when at this spot
  zIndex?: number  // explicit z-index override (for agents behind desks)
}

export interface Room {
  id: RoomId
  name: string
  description: string
  background: {
    day: string       // path to empty room background
    night: string
  }
  width: number       // room dimensions in px (rendered)
  height: number
  furniture: FurnitureItem[]
  connections: RoomConnection[]
  agentSpots: AgentSpot[]       // where agents can sit/stand/work
  entryPoint: { x: number; y: number }  // where agents appear when entering
  walkableArea?: { x: number; y: number }[]  // polygon defining where agents can walk
  ambience?: string   // ambient sound loop
  waypoints?: Waypoint[]  // named walkable nodes for pathfinding
}

// ===== ROOM DEFINITIONS =====

export const ROOMS: Record<RoomId, Room> = {
    'main-office': {
    id: 'main-office',
    name: 'BukainJalan HQ',
    description: 'Master open-concept campus of BukainJalan Headquarters with multi-tier zones',
    background: {
      day: '/master-map.png',
      night: '/master-map-night.png',
    },
    width: 1024,
    height: 572,
    furniture: [
        { id: 'boss-mug', type: 'mug', sprite: 'prop-boss-mug', x: 18.5, y: 22.0, zIndex: 35, interactive: true, label: "World's Best Boss Mug" },
        { id: 'boss-dundie', type: 'dundie', sprite: 'prop-dundie', x: 21.0, y: 21.5, zIndex: 35, interactive: true, label: "Dundie Award" },
        { id: 'coffee', type: 'coffee-machine', sprite: 'coffee-on', x: 74.8, y: 53.5, zIndex: 65, interactive: true, label: 'Barista Espresso Machine' },
        { id: 'bell', type: 'bell', sprite: 'bell', x: 86.8, y: 83.5, zIndex: 90, interactive: true, label: 'Reception Bell' },
        { id: 'dev-deploy-screen', type: 'deploying-screen', sprite: 'deploying-screen', x: 10.5, y: 43.0, zIndex: 45, interactive: true, label: 'Live Deployment Monitor' },
        { id: 'pool-plant', type: 'plant-monstera', sprite: 'plant-monstera', x: 93.0, y: 47.0, zIndex: 50, interactive: true, label: 'Poolside Monstera' },
        { id: 'musholla-plant', type: 'plant-snake', sprite: 'plant-snake', x: 27.5, y: 85.0, zIndex: 88, interactive: true, label: 'Musholla Greenery' },
        { id: 'pool-spot', type: 'hotspot', sprite: 'hotspot', x: 86.4, y: 48.0, interactive: true, label: 'Sky Pool Terrace' },
        { id: 'musholla-spot', type: 'hotspot', sprite: 'hotspot', x: 18.5, y: 84.0, interactive: true, label: 'Musholla Al-Ikhlas' },
        { id: 'billiard-spot', type: 'hotspot', sprite: 'hotspot', x: 46.5, y: 85.5, interactive: true, label: 'Billiard & Arcade' },
        { id: 'boardroom-spot', type: 'hotspot', sprite: 'hotspot', x: 50.0, y: 14.0, interactive: true, label: 'Executive Boardroom' },
      ],
    connections: [], // Master Campus is unified and open-plan: no doorway teleports
    agentSpots: [
      // Boss at CEO Suite (Top-Left)
      { id: 'spot-1', type: 'desk', x: 16.0, y: 20.0, facing: 'down', spriteFacing: 'front-right', zIndex: 30 },
      // Claude at Lead Dev Workstation (Mid-Left)
      { id: 'spot-2', type: 'desk', x: 18.0, y: 53.0, facing: 'right', spriteFacing: 'front-right', zIndex: 50 },
      // Rani at Product Workstation (Mid-Left)
      { id: 'spot-3', type: 'desk', x: 25.0, y: 48.0, facing: 'right', spriteFacing: 'front-right', zIndex: 50 },
      // Alya at Operations Workstation (Mid-Left)
      { id: 'spot-4', type: 'desk', x: 26.2, y: 45.1, facing: 'right', spriteFacing: 'front-right', zIndex: 50 },
      // Maya at Creator Studio (Mid-Right)
      { id: 'spot-5', type: 'desk', x: 64.0, y: 41.5, facing: 'down', spriteFacing: 'front-left', zIndex: 40 },
      // Extra dev spots
      { id: 'spot-6', type: 'desk', x: 18.0, y: 55.0, facing: 'right', spriteFacing: 'front-right', zIndex: 55 },
      { id: 'spot-7', type: 'desk', x: 24.0, y: 53.0, facing: 'right', spriteFacing: 'front-right', zIndex: 55 },
      { id: 'spot-8', type: 'desk', x: 30.0, y: 51.0, facing: 'right', spriteFacing: 'front-right', zIndex: 55 },
      // Cafe Barista
      { id: 'spot-coffee-1', type: 'coffee', x: 74.8, y: 55.2, facing: 'down', spriteFacing: 'front-left' },
      { id: 'spot-coffee-2', type: 'coffee', x: 82.0, y: 62.0, facing: 'up', spriteFacing: 'rear-left' },
      // Sunken Lounge
      { id: 'spot-water-1', type: 'water', x: 54.0, y: 54.0, facing: 'down', spriteFacing: 'front-right' },
      // Sky Pool Lounger
      { id: 'spot-water-2', type: 'water', x: 86.4, y: 48.0, facing: 'left', spriteFacing: 'front-left' },
      { id: 'spot-water-3', type: 'water', x: 26.0, y: 84.0, facing: 'up', spriteFacing: 'rear-right' }, // Musholla
      { id: 'spot-water-4', type: 'water', x: 50.0, y: 85.0, facing: 'down', spriteFacing: 'front-left' }, // Billiard
      // Boardroom Table
      { id: 'spot-filing', type: 'filing', x: 50.0, y: 14.0, facing: 'down', spriteFacing: 'front-left', zIndex: 20 },
      // Musholla Al-Ikhlas
      { id: 'spot-printer', type: 'printer', x: 18.5, y: 84.0, facing: 'right', spriteFacing: 'front-right', zIndex: 85 },
      // Billiard Table
      { id: 'spot-door-2', type: 'door', x: 46.5, y: 85.5, facing: 'right', spriteFacing: 'front-right', zIndex: 85 },
      // Reception Lobby
      { id: 'spot-lobby', type: 'desk', x: 88.0, y: 84.0, facing: 'left', spriteFacing: 'front-left', zIndex: 85 },
    ],
    entryPoint: { x: 52, y: 58 },
    waypoints: [
      { id: 'W-lobby',            x: 80, y: 88, connections: ['W-stairs-lower'] },
      { id: 'W-stairs-lower',     x: 65, y: 78, connections: ['W-lobby', 'W-billiard', 'W-main-cross'] },
      { id: 'W-billiard',         x: 50, y: 85, connections: ['W-stairs-lower', 'W-musholla'] },
      { id: 'W-musholla',         x: 26, y: 84, connections: ['W-billiard'] },
      { id: 'W-main-cross',       x: 52, y: 58, connections: ['W-stairs-lower', 'W-lounge', 'W-cafe', 'W-studio', 'W-dev-hall', 'W-stairs-mezz-base', 'W-door'] },
      { id: 'W-lounge',           x: 54, y: 53, connections: ['W-main-cross'] },
      { id: 'W-cafe',             x: 72, y: 56, connections: ['W-main-cross', 'W-pool'] },
      { id: 'W-pool',             x: 84, y: 48, connections: ['W-cafe'] },
      { id: 'W-studio',           x: 64, y: 44, connections: ['W-main-cross'] },
      { id: 'W-dev-hall',         x: 32, y: 52, connections: ['W-main-cross', 'W-dev-1', 'W-dev-2'] },
      { id: 'W-dev-1',            x: 18, y: 49, connections: ['W-dev-hall'] },
      { id: 'W-dev-2',            x: 22, y: 54, connections: ['W-dev-hall'] },
      { id: 'W-stairs-mezz-base', x: 38, y: 42, connections: ['W-main-cross', 'W-stairs-mezz-top'] },
      { id: 'W-stairs-mezz-top',  x: 36, y: 26, connections: ['W-stairs-mezz-base', 'W-ceo', 'W-boardroom'] },
      { id: 'W-ceo',              x: 22, y: 23, connections: ['W-stairs-mezz-top'] },
      { id: 'W-boardroom',        x: 48, y: 18, connections: ['W-stairs-mezz-top', 'W-terrace-top'] },
      { id: 'W-terrace-top',      x: 66, y: 22, connections: ['W-boardroom'] },
      { id: 'W-door',             x: 52, y: 58, connections: ['W-main-cross'] },
    ],
  },
}
