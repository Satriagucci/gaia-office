import type { RoomId } from './rooms'

export type AgentState =
  | 'idle'
  | 'walking-to-manager'
  | 'talking-to-manager'
  | 'walking-to-desk'
  | 'working'
  | 'coffee-break'
  | 'completed'
  | 'new-hire'
  | 'changing-room'

export interface Position {
  x: number
  y: number
}

export interface Agent {
  id: string
  name: string
  type: 'subagent' | 'mcp'
  role: string
  state: AgentState
  position: Position
  targetPosition: Position
  deskPosition: Position
  room: RoomId              // which room the agent is currently in
  assignedRoom: RoomId      // where their desk is
  assignedSpotId?: string   // which spot they're assigned to
  task?: string
  statusText?: string
  spriteFacing?: 'front-left' | 'front-right' | 'rear-left' | 'rear-right'
  color: string
  emoji: string
  hiredAt: number
  pathQueue?: { x: number; y: number }[]  // waypoints to walk through
}

export interface OfficeEvent {
  type: 'agent_spawned' | 'agent_working' | 'agent_completed' | 'mcp_call' | 'mcp_done' | 'new_hire' | 'chat_message' | 'chat_typing' | 'chat_reaction' | 'chat_seen'
  agent?: Partial<Agent>
  agentId?: string
  status?: string
  result?: string
  sender?: string
  text?: string
}

import { BOSS_NAME, BOSS_COLOR, BOSS_EMOJI } from './config'

export const AGENT_CONFIGS: Record<string, { color: string; emoji: string; title: string }> = {
  // GAIA — CEO, configured via office.config.json
  'boss':                  { color: BOSS_COLOR, emoji: BOSS_EMOJI, title: BOSS_NAME },
  // GAIA Office Team — wanita semua
  'concierge':             { color: '#f43f5e', emoji: '🌟', title: 'Alya' },
  'devops':                { color: '#8b5cf6', emoji: '⚙️', title: 'Rani' },
  'data-analyst':          { color: '#10b981', emoji: '📊', title: 'Dina' },
  'scribe':                { color: '#f59e0b', emoji: '📝', title: 'Laras' },
  // Subagents (existing — tetap ada untuk kompatibilitas)
  'debugger':              { color: '#e74c3c', emoji: '🔍', title: 'Debugger' },
  'code-reviewer':         { color: '#3498db', emoji: '📋', title: 'Reviewer' },
  'frontend-developer':    { color: '#2ecc71', emoji: '🎨', title: 'Frontend' },
  'fullstack-developer':   { color: '#9b59b6', emoji: '⚡', title: 'Fullstack' },
  'test-engineer':         { color: '#f39c12', emoji: '🧪', title: 'Tester' },
  'security-auditor':      { color: '#e67e22', emoji: '🛡️', title: 'Security' },
  'devops-engineer':       { color: '#607d8b', emoji: '🔧', title: 'DevOps' },
  'assistant':             { color: '#0ea5e9', emoji: '💙', title: 'GAIA' },
  'default':               { color: '#95a5a6', emoji: '👤', title: 'Worker' },
}
