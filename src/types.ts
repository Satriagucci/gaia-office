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
  isPlayer?: boolean        // true if controlled by the user
}

export type Division =
  | 'core_product'
  | 'engineering'
  | 'qa_security'
  | 'devops'
  | 'operations'

export type TaskStatus =
  | 'needs_boss'
  | 'in_progress'
  | 'queued'
  | 'parked'
  | 'discard_proposed'

export interface DivisionTask {
  id: string
  title: string
  description?: string
  division: Division
  status: TaskStatus
  assignedAgentId?: string
  assignedAgentName?: string
  assignedAgentRole?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: number
  updatedAt: number
  decisionNote?: string
  toolCall?: string
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

export const AGENT_CONFIGS: Record<string, { color: string; emoji: string; title: string; defaultRoom: RoomId; division: Division }> = {
  // GAIA — CEO / Boss, configured via office.config.json
  'boss':                  { color: BOSS_COLOR, emoji: BOSS_EMOJI, title: BOSS_NAME, defaultRoom: 'main-office', division: 'core_product' },
  // GAIA Office Team
  'concierge':             { color: '#f43f5e', emoji: '💁', title: 'Alya', defaultRoom: 'main-office', division: 'operations' },
  'devops':                { color: '#8b5cf6', emoji: '⚙️', title: 'Rani', defaultRoom: 'main-office', division: 'devops' },
  'data-analyst':          { color: '#10b981', emoji: '📊', title: 'Dina', defaultRoom: 'main-office', division: 'operations' },
  'scribe':                { color: '#f59e0b', emoji: '📝', title: 'Laras', defaultRoom: 'main-office', division: 'operations' },
  // Subagents
  'debugger':              { color: '#e74c3c', emoji: '🐛', title: 'Debugger', defaultRoom: 'main-office', division: 'engineering' },
  'code-reviewer':         { color: '#3498db', emoji: '🔍', title: 'Reviewer', defaultRoom: 'main-office', division: 'engineering' },
  'frontend-developer':    { color: '#2ecc71', emoji: '🎨', title: 'Frontend', defaultRoom: 'main-office', division: 'engineering' },
  'fullstack-developer':   { color: '#9b59b6', emoji: '💻', title: 'Fullstack', defaultRoom: 'main-office', division: 'engineering' },
  'test-engineer':         { color: '#f39c12', emoji: '🧪', title: 'Tester', defaultRoom: 'main-office', division: 'qa_security' },
  'security-auditor':      { color: '#e67e22', emoji: '🛡️', title: 'Security', defaultRoom: 'main-office', division: 'qa_security' },
  'devops-engineer':       { color: '#607d8b', emoji: '🚀', title: 'DevOps', defaultRoom: 'main-office', division: 'devops' },
  'assistant':             { color: '#0ea5e9', emoji: '🤖', title: 'GAIA', defaultRoom: 'main-office', division: 'core_product' },
  'default':               { color: '#95a5a6', emoji: '💼', title: 'Worker', defaultRoom: 'main-office', division: 'engineering' },
}
