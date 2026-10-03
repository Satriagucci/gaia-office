// ===== ASSET MANIFEST =====
export interface SpriteAsset {
  path: string
  width: number     // display width in px
  height: number    // display height in px
  category: 'character' | 'furniture' | 'appliance' | 'decoration' | 'effect' | 'culture' | 'room'
}

export const ASSETS: Record<string, SpriteAsset> = {
  // === CHARACTERS ===
  'char-debugger':       { path: '/sprites/debugger.png', width: 24, height: 65, category: 'character' },
  'char-reviewer':       { path: '/sprites/reviewer.png', width: 24, height: 65, category: 'character' },
  'char-frontend':       { path: '/sprites/frontend.png', width: 24, height: 65, category: 'character' },
  'char-fullstack':      { path: '/sprites/fullstack.png', width: 24, height: 65, category: 'character' },
  'char-tester':         { path: '/sprites/tester.png', width: 24, height: 65, category: 'character' },
  'char-security':       { path: '/sprites/security.png', width: 24, height: 65, category: 'character' },
  'char-devops':         { path: '/sprites/devops.png', width: 24, height: 65, category: 'character' },
  'char-manager':        { path: '/sprites/manager.png', width: 24, height: 65, category: 'character' },

  // === FURNITURE ===
  'desk-standing-left-front':  { path: '/sprites/furniture/standing-desk-left-front.png', width: 84, height: 106, category: 'furniture' },
  'desk-standing-left-rear':   { path: '/sprites/furniture/standing-desk-left-rear.png', width: 84, height: 102, category: 'furniture' },
  'desk-standing-right-front': { path: '/sprites/furniture/standing-desk-right-front.png', width: 84, height: 106, category: 'furniture' },
  'desk-standing-right-rear':  { path: '/sprites/furniture/standing-desk-right-rear.png', width: 84, height: 102, category: 'furniture' },
  'filing-closed':             { path: '/sprites/furniture/filling-closed.png', width: 42, height: 56, category: 'furniture' },
  'filing-open':               { path: '/sprites/furniture/filling-open.png', width: 46, height: 60, category: 'furniture' },

  // === APPLIANCES ===
  'coffee-off':    { path: '/sprites/appliances/coffee-off.png', width: 30, height: 32, category: 'appliance' },
  'coffee-on':     { path: '/sprites/appliances/coffee-on.png', width: 30, height: 32, category: 'appliance' },

  // === DECORATION ===
  'plant-monstera':  { path: '/sprites/decoration/monstera-plant.png', width: 32, height: 40, category: 'decoration' },
  'plant-snake':     { path: '/sprites/decoration/snake-plant.png', width: 26, height: 34, category: 'decoration' },
  'plant-money':     { path: '/sprites/decoration/money-tree.png', width: 42, height: 63, category: 'decoration' },
  'whiteboard':      { path: '/sprites/decoration/white-board.png', width: 65, height: 86, category: 'decoration' },
  'ac-unit':         { path: '/sprites/decoration/ac-wall-unit.png', width: 50, height: 39, category: 'decoration' },
  'printer':         { path: '/sprites/decoration/printer.png', width: 55, height: 69, category: 'decoration' },
  'printer-working': { path: '/sprites/decoration/printer-working.png', width: 55, height: 69, category: 'decoration' },
  'printer-broken':  { path: '/sprites/decoration/printer-broken.png', width: 55, height: 69, category: 'decoration' },

  // === CULTURE & PROPS ===
  'bell':              { path: '/sprites/culture/bell.png', width: 14, height: 18, category: 'culture' },
  'days-last-incident':{ path: '/sprites/culture/days-last-incident.png', width: 80, height: 66, category: 'culture' },
  'deploying-screen':  { path: '/sprites/culture/deploying-screen.png', width: 34, height: 38, category: 'culture' },
  'todo-board':        { path: '/sprites/culture/todo-board.png', width: 55, height: 62, category: 'culture' },
  'prop-boss-mug':     { path: '/sprites/office/props/worlds-best-boss-mug.png', width: 14, height: 14, category: 'culture' },
  'prop-dundie':       { path: '/sprites/office/props/dundie-award.png', width: 16, height: 22, category: 'culture' },
  'prop-fire-alarm':   { path: '/sprites/office/props/fire-alarm.png', width: 20, height: 26, category: 'culture' },

  // === EFFECTS ===
  'fx-build-failed':   { path: '/sprites/effects/build-failed.png', width: 24, height: 24, category: 'effect' },
  'fx-fire':           { path: '/sprites/effects/fire.png', width: 24, height: 24, category: 'effect' },
  'fx-pr-merge':       { path: '/sprites/effects/github-pr-merge.png', width: 24, height: 24, category: 'effect' },
  'fx-need-coffee':    { path: '/sprites/effects/need-coffee.png', width: 24, height: 24, category: 'effect' },
  'fx-rocket':         { path: '/sprites/effects/rocket.png', width: 24, height: 24, category: 'effect' },
  'fx-sleeping':       { path: '/sprites/effects/sleeping.png', width: 24, height: 24, category: 'effect' },
  'fx-star':           { path: '/sprites/effects/star.png', width: 24, height: 24, category: 'effect' },
  'fx-thumb-up':       { path: '/sprites/effects/thumb-up.png', width: 24, height: 24, category: 'effect' },
  'fx-typing':         { path: '/sprites/effects/typing.png', width: 24, height: 24, category: 'effect' },

  // === ROOMS ===
  'room-office-day':   { path: '/rooms/office-day.png', width: 800, height: 600, category: 'room' },
  'room-office-night': { path: '/rooms/office-night.png', width: 800, height: 600, category: 'room' },
}

export function getAssetPath(key: string): string | null {
  return ASSETS[key]?.path ?? null
}

export function getAssetsByCategory(category: SpriteAsset['category']): Record<string, SpriteAsset> {
  return Object.fromEntries(
    Object.entries(ASSETS).filter(([, a]) => a.category === category)
  )
}

export function hasAsset(key: string): boolean {
  return key in ASSETS
}
