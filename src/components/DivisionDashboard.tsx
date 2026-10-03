import React, { useState, useMemo } from 'react'
import { DivisionTask, TaskStatus, Division, Agent } from '../types'
import { RoomId } from '../rooms'

interface DivisionDashboardProps {
  isOpen: boolean
  onClose: () => void
  tasks: DivisionTask[]
  agents: Agent[]
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, note?: string) => void
  onSpotlightAgent: (agentId: string, roomId: RoomId) => void
  onAssignNewTask?: (title: string, division: Division, priority: 'low' | 'medium' | 'high' | 'urgent') => void
}

const DIVISION_TABS: { id: 'all' | Division; label: string; icon: string }[] = [
  { id: 'all', label: 'Semua Divisi', icon: '🏢' },
  { id: 'core_product', label: 'Product & GAIA', icon: '🤖' },
  { id: 'engineering', label: 'Engineering', icon: '💻' },
  { id: 'qa_security', label: 'QA & Security', icon: '🛡️' },
  { id: 'devops', label: 'DevOps & Infra', icon: '🚀' },
  { id: 'operations', label: 'Operations', icon: '📋' },
]

const COLUMNS: { status: TaskStatus; title: string; icon: string; desc: string; badgeColor: string; borderColor: string }[] = [
  {
    status: 'needs_boss',
    title: 'Butuh Saya',
    icon: '⚠️',
    desc: 'Menunggu keputusan, review PR, atau approval Boss',
    badgeColor: '#ef4444',
    borderColor: '#fca5a5',
  },
  {
    status: 'in_progress',
    title: 'Jalan',
    icon: '🚀',
    desc: 'Sedang aktif dieksekusi oleh agent',
    badgeColor: '#10b981',
    borderColor: '#6ee7b7',
  },
  {
    status: 'queued',
    title: 'Antrean',
    icon: '📋',
    desc: 'Backlog tugas siap dikerjakan',
    badgeColor: '#f59e0b',
    borderColor: '#fcd34d',
  },
  {
    status: 'parked',
    title: 'Parkir',
    icon: '🅿️',
    desc: 'Ditunda sementara atau menunggu dependensi',
    badgeColor: '#6366f1',
    borderColor: '#c7d2fe',
  },
  {
    status: 'discard_proposed',
    title: 'Usul Buang',
    icon: '🗑️',
    desc: 'Usulan didegradasi/hapus oleh tim',
    badgeColor: '#64748b',
    borderColor: '#cbd5e1',
  },
]

export const DivisionDashboard: React.FC<DivisionDashboardProps> = ({
  isOpen,
  onClose,
  tasks,
  agents,
  onUpdateTaskStatus,
  onSpotlightAgent,
  onAssignNewTask,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<'all' | Division>('all')
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDiv, setNewDiv] = useState<Division>('engineering')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  const filteredTasks = useMemo(() => {
    if (selectedDivision === 'all') return tasks
    return tasks.filter(t => t.division === selectedDivision)
  }, [tasks, selectedDivision])

  if (!isOpen) return null

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    onAssignNewTask?.(newTitle.trim(), newDiv, newPriority)
    setNewTitle('')
    setShowNewTaskModal(false)
  }

  return (
    <div className="division-dashboard-overlay">
      <div className="division-dashboard-container">
        {/* Header */}
        <div className="division-dashboard-header">
          <div className="header-left">
            <span className="dashboard-title-icon">📊</span>
            <div>
              <h2>Executive Division Command Board</h2>
              <p className="dashboard-subtitle">Monitoring workflow lintas divisi, approval blocker, & delegasi agent BukainJalan</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="dashboard-btn-create" onClick={() => setShowNewTaskModal(true)}>
              ➕ Buat Tugas Baru
            </button>
            <button className="dashboard-btn-close" onClick={onClose} title="Tutup (Esc)">
              ✕
            </button>
          </div>
        </div>

        {/* Division Filter Tabs */}
        <div className="division-filter-bar">
          {DIVISION_TABS.map(tab => (
            <button
              key={tab.id}
              className={`division-tab-btn ${selectedDivision === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedDivision(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="division-tab-count">
                {tab.id === 'all' ? tasks.length : tasks.filter(t => t.division === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Kanban Board Columns */}
        <div className="division-kanban-board">
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.status)
            return (
              <div key={col.status} className="kanban-col" style={{ borderTop: `4px solid ${col.badgeColor}` }}>
                <div className="kanban-col-header">
                  <div className="col-title-wrap">
                    <span className="col-icon">{col.icon}</span>
                    <span className="col-title">{col.title}</span>
                  </div>
                  <span className="col-badge" style={{ backgroundColor: col.badgeColor }}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="col-desc">{col.desc}</div>

                <div className="kanban-card-list">
                  {colTasks.length === 0 ? (
                    <div className="empty-col-placeholder">Tidak ada item di sini</div>
                  ) : (
                    colTasks.map(task => {
                      const assignedAgent = agents.find(a => a.id === task.assignedAgentId)
                      return (
                        <div key={task.id} className="kanban-card">
                          <div className="card-top">
                            <span className={`priority-tag priority-${task.priority || 'medium'}`}>
                              {task.priority?.toUpperCase() || 'MEDIUM'}
                            </span>
                            <span className="division-tag">{task.division.replace('_', ' ')}</span>
                          </div>

                          <h4 className="card-title">{task.title}</h4>
                          {task.description && <p className="card-desc">{task.description}</p>}

                          {task.toolCall && (
                            <div className="card-tool-call">
                              ⚡ Tool: <code>{task.toolCall}</code>
                            </div>
                          )}

                          {assignedAgent && (
                            <div className="card-agent-badge">
                              <span className="agent-avatar-mini">{assignedAgent.emoji}</span>
                              <span className="agent-name-mini">{assignedAgent.name}</span>
                              <span className="agent-room-mini">({assignedAgent.room})</span>
                            </div>
                          )}

                          {/* Quick Action Buttons per Status */}
                          <div className="card-actions">
                            {task.status === 'needs_boss' && (
                              <>
                                <button
                                  className="btn-card-action btn-approve"
                                  onClick={() => onUpdateTaskStatus(task.id, 'in_progress', 'Disetujui oleh Boss')}
                                >
                                  ✅ Setujui
                                </button>
                                <button
                                  className="btn-card-action btn-park"
                                  onClick={() => onUpdateTaskStatus(task.id, 'parked', 'Diparkir untuk evaluasi')}
                                >
                                  🅿️ Parkir
                                </button>
                                <button
                                  className="btn-card-action btn-propose-discard"
                                  onClick={() => onUpdateTaskStatus(task.id, 'discard_proposed', 'Diusulkan batal')}
                                >
                                  🗑️ Tolak
                                </button>
                              </>
                            )}

                            {task.status === 'in_progress' && (
                              <>
                                {assignedAgent && (
                                  <button
                                    className="btn-card-action btn-spotlight"
                                    onClick={() => onSpotlightAgent(assignedAgent.id, assignedAgent.room)}
                                  >
                                    🎯 Spotlight
                                  </button>
                                )}
                                <button
                                  className="btn-card-action btn-park"
                                  onClick={() => onUpdateTaskStatus(task.id, 'parked')}
                                >
                                  🅿️ Parkir
                                </button>
                              </>
                            )}

                            {task.status === 'queued' && (
                              <>
                                <button
                                  className="btn-card-action btn-approve"
                                  onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                                >
                                  🚀 Jalankan
                                </button>
                                <button
                                  className="btn-card-action btn-park"
                                  onClick={() => onUpdateTaskStatus(task.id, 'parked')}
                                >
                                  🅿️ Parkir
                                </button>
                              </>
                            )}

                            {task.status === 'parked' && (
                              <>
                                <button
                                  className="btn-card-action btn-resume"
                                  onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                                >
                                  ▶️ Lanjutkan
                                </button>
                                <button
                                  className="btn-card-action btn-propose-discard"
                                  onClick={() => onUpdateTaskStatus(task.id, 'discard_proposed')}
                                >
                                  🗑️ Usul Buang
                                </button>
                              </>
                            )}

                            {task.status === 'discard_proposed' && (
                              <>
                                <button
                                  className="btn-card-action btn-resume"
                                  onClick={() => onUpdateTaskStatus(task.id, 'queued', 'Dipulihkan ke antrean')}
                                >
                                  🔄 Hidupkan
                                </button>
                                <button
                                  className="btn-card-action btn-delete-final"
                                  onClick={() => onUpdateTaskStatus(task.id, 'discard_proposed', 'Dibuang permanen')}
                                >
                                  🗑️ Hapus
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="new-task-dialog-backdrop">
          <form className="new-task-dialog" onSubmit={handleCreateTask}>
            <h3>➕ Buat Tugas Divisi Baru</h3>
            <div className="form-group">
              <label>Judul Tugas</label>
              <input
                type="text"
                autoFocus
                placeholder="Contoh: Optimasi query order list di Postgres..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Divisi Tujuan</label>
                <select value={newDiv} onChange={e => setNewDiv(e.target.value as Division)}>
                  <option value="core_product">Product & GAIA</option>
                  <option value="engineering">Engineering</option>
                  <option value="qa_security">QA & Security</option>
                  <option value="devops">DevOps & Infra</option>
                  <option value="operations">Operations</option>
                </select>
              </div>
              <div className="form-group">
                <label>Prioritas</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent 🔥</option>
                </select>
              </div>
            </div>
            <div className="dialog-buttons">
              <button type="button" className="btn-cancel" onClick={() => setShowNewTaskModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn-submit">
                Tugaskan ke Antrean
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default DivisionDashboard
