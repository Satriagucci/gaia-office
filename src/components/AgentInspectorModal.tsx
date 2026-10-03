import React from 'react'
import { Agent, AGENT_CONFIGS } from '../types'
import { RoomId, ROOMS } from '../rooms'
import { ROLE_TO_CHAR } from '../config'
import { getSpritePath } from '../theme'

interface AgentInspectorModalProps {
  agent: Agent | null
  onClose: () => void
  currentRoomId: RoomId
  onSummonToRoom: (agentId: string, targetRoom: RoomId) => void
  onDirectChat: (agentName: string) => void
}

export const AgentInspectorModal: React.FC<AgentInspectorModalProps> = ({
  agent,
  onClose,
  currentRoomId,
  onSummonToRoom,
  onDirectChat,
}) => {
  if (!agent) return null

  const cfg = AGENT_CONFIGS[agent.role] || AGENT_CONFIGS['default']
  const charBase = ROLE_TO_CHAR[agent.role] || 'employee-1'
  const spriteSrc = getSpritePath(agent.id, agent.role, charBase, agent.spriteFacing || 'front-right')
  const currentRoomName = ROOMS[agent.room]?.name || agent.room
  const isHere = agent.room === currentRoomId

  return (
    <div className="agent-inspector-backdrop" onClick={onClose}>
      <div className="agent-inspector-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="inspector-header" style={{ borderBottomColor: cfg.color }}>
          <div className="inspector-avatar-box">
            <img src={spriteSrc} alt={agent.name} className="inspector-sprite" />
          </div>
          <div className="inspector-title-info">
            <div className="inspector-name-row">
              <h3>{agent.name}</h3>
              <span className="inspector-emoji">{cfg.emoji}</span>
            </div>
            <div className="inspector-role-badge" style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}>
              {agent.role.toUpperCase()}
            </div>
          </div>
          <button className="inspector-btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Body Details */}
        <div className="inspector-body">
          <div className="inspector-stat-grid">
            <div className="stat-item">
              <span className="stat-label">Lokasi Ruangan</span>
              <span className="stat-value">🏢 {currentRoomName}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Status Kerja</span>
              <span className="stat-value state-pill" data-state={agent.state}>
                ● {agent.state.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Koordinat</span>
              <span className="stat-value">X: {agent.position.x.toFixed(1)}% | Y: {agent.position.y.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tipe Agent</span>
              <span className="stat-value">🤖 {agent.type}</span>
            </div>
          </div>

          {/* Current Task Box */}
          <div className="inspector-task-section">
            <div className="task-section-title">
              <span>📌 Current Task & Directive:</span>
            </div>
            <div className="task-content-box">
              {agent.task || agent.statusText || 'Standby menunggu delegasi dari GAIA / Boss.'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="inspector-actions">
          <button
            className="btn-inspector-action btn-chat"
            onClick={() => {
              onDirectChat(agent.name)
              onClose()
            }}
          >
            💬 Mention di Slack
          </button>

          <div className="already-here-tag">
            🏢 Aktif bertugas di BukainJalan HQ
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentInspectorModal
