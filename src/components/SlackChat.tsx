import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ROLE_TO_CHAR } from '../config'
import { getSpritePath, useTheme, toggleTheme, getTheme, themedDisplayName } from '../theme'

function getAvatarSrc(role: string, agentId?: string): string {
  const charBase = ROLE_TO_CHAR[role] ?? 'employee-3'
  return getSpritePath(agentId ?? `role-${role}`, role, charBase, 'front-right')
}

const PROACTIVE_PATTERN = /\b(starting|started|done|finished|completed|ready|working on|picking up|taking over)\b/i

export interface ChatMessage {
  id: number
  sender: string
  senderSprite: string
  senderColor: string
  text: string
  channel: string
  timestamp: string
  isSystem?: boolean
  reactions?: string[]
}

const EMOJI_PICKER = ['👍', '🚀', '☕', '❤️', '🔥', '👀', '🎉']

export type ChatChannel = 'office-general' | 'dev-ops' | 'incidents'

const CHANNELS: { id: ChatChannel; label: string; icon: string }[] = [
  { id: 'office-general', label: 'general', icon: '#' },
  { id: 'dev-ops', label: 'dev-ops', icon: '💻' },
  { id: 'incidents', label: 'incidents', icon: '🚨' },
]

interface SlackChatProps {
  messages: ChatMessage[]
  muted: boolean
  volume: number
  onToggleMute: () => void
  onVolumeChange: (v: number) => void
  onSendMessage?: (text: string, channel?: string) => void
  onReaction?: (messageId: number, reactions: string[]) => void
  autoTypeText?: string
  dayPhase: string
  typingUser?: string | null
  lastSeenId?: number | null
}

const SlackChat: React.FC<SlackChatProps> = ({
  messages,
  muted,
  volume,
  onToggleMute,
  onVolumeChange,
  onSendMessage,
  onReaction,
  autoTypeText,
  dayPhase,
  typingUser,
  lastSeenId,
}) => {
  const theme = useTheme()
  void theme
  const bodyRef = useRef<HTMLDivElement>(null)
  const [inputText, setInputText] = useState('')
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('office-general')
  const [showSlashHint, setShowSlashHint] = useState(false)
  const [emojiPickerMsgId, setEmojiPickerMsgId] = useState<number | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const onSendRef = useRef(onSendMessage)
  onSendRef.current = onSendMessage

  useEffect(() => {
    if (emojiPickerMsgId === null) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setEmojiPickerMsgId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [emojiPickerMsgId])

  const handleReaction = useCallback((msg: ChatMessage, emoji: string) => {
    const existing = msg.reactions || []
    const updated = existing.includes(emoji)
      ? existing.filter(r => r !== emoji)
      : [...existing, emoji]
    onReaction?.(msg.id, updated)
    setEmojiPickerMsgId(null)
  }, [onReaction])

  const [cronPaused, setCronPaused] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8788/chat/cron-state')
      .then(r => r.json())
      .then(d => setCronPaused(!!d.paused))
      .catch(() => {})
  }, [])

  const toggleCron = useCallback(() => {
    const newState = !cronPaused
    setCronPaused(newState)
    fetch('http://127.0.0.1:8788/chat/cron-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paused: newState }),
    }).catch(() => {})
  }, [cronPaused])

  useEffect(() => {
    if (!autoTypeText) {
      setInputText('')
      return
    }
    setInputText('')
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i <= autoTypeText.length) {
        setInputText(autoTypeText.slice(0, i))
      } else {
        clearInterval(interval)
        setTimeout(() => {
          onSendRef.current?.(autoTypeText, activeChannel)
          setInputText('')
        }, 400)
      }
    }, 50 + Math.random() * 30)
    return () => clearInterval(interval)
  }, [autoTypeText, activeChannel])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, typingUser, activeChannel])

  // Filter messages based on active channel
  const filteredMessages = messages.filter(m => {
    if (m.isSystem) return true
    if (!m.channel || m.channel === 'office-general') {
      return activeChannel === 'office-general'
    }
    return m.channel === activeChannel
  })

  const displayed = filteredMessages.slice(-20)
  const onlineCount = new Set(messages.slice(-20).filter(m => !m.isSystem).map(m => m.sender)).size

  return (
    <div className="slack-panel">
      {/* Header with Channel Tabs */}
      <div className="slack-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {CHANNELS.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                style={{
                  background: activeChannel === ch.id ? 'white' : 'transparent',
                  border: activeChannel === ch.id ? '1px solid #90caf9' : '1px solid transparent',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: activeChannel === ch.id ? 700 : 500,
                  color: activeChannel === ch.id ? '#0d47a1' : '#5a5a7a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span>{ch.icon}</span>
                <span>{ch.label}</span>
              </button>
            ))}
          </div>

          <div className="slack-header-right">
            <div className="slack-online-dot" />
            <span className="slack-online-count">{onlineCount}</span>
            <div
              className={`slack-cron-toggle ${cronPaused ? 'paused' : 'active'}`}
              onClick={toggleCron}
              title={cronPaused ? 'Chat monitor paused — click to resume' : 'Chat monitor active — click to pause'}
            >
              <div className="slack-cron-track">
                <div className="slack-cron-thumb" />
              </div>
              <span className="slack-cron-label">{cronPaused ? 'AI Off' : 'AI On'}</span>
            </div>
            <button className="slack-mute-btn" onClick={onToggleMute} title={muted ? 'Unmute' : 'Mute'}>
              {muted ? '🔇' : volume < 0.4 ? '🔉' : '🔊'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div className="slack-body" ref={bodyRef}>
        {displayed.map((msg) => {
          const isProactive = !msg.isSystem && PROACTIVE_PATTERN.test(msg.text)
          return (
            <React.Fragment key={msg.id}>
              <div
                className={`slack-msg${msg.isSystem ? ' slack-msg-system' : ''}${isProactive ? ' slack-msg-proactive' : ''}`}
                onDoubleClick={() => !msg.isSystem && setEmojiPickerMsgId(prev => prev === msg.id ? null : msg.id)}
              >
                {!msg.isSystem && (
                  <div className="slack-avatar" style={{ border: `2px solid ${msg.senderColor}`, boxShadow: `0 0 6px ${msg.senderColor}40` }}>
                    <img
                      src={getAvatarSrc(msg.senderSprite)}
                      alt={msg.sender}
                      className="slack-avatar-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <div
                      className="slack-avatar-fallback"
                      style={{ background: msg.senderColor }}
                    />
                  </div>
                )}
                <div className="slack-msg-content">
                  {!msg.isSystem && (
                    <div className="slack-msg-header">
                      <span className="slack-sender" style={{ color: msg.senderColor }}>
                        {themedDisplayName(msg.senderSprite, msg.sender)}
                      </span>
                      <span className="slack-time">{msg.timestamp}</span>
                    </div>
                  )}
                  <div className={`slack-msg-text${msg.isSystem ? ' slack-system-text' : ''}`}>
                    {msg.text}
                  </div>
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="slack-reactions">
                      {msg.reactions.map((r, i) => (
                        <span
                          key={i}
                          className="slack-reaction"
                          onClick={() => handleReaction(msg, r)}
                          title="Klik untuk menghapus reaksi"
                        >{r}</span>
                      ))}
                    </div>
                  )}
                  {emojiPickerMsgId === msg.id && (
                    <div className="slack-emoji-picker" ref={pickerRef}>
                      {EMOJI_PICKER.map(emoji => (
                        <button
                          key={emoji}
                          className={`slack-emoji-btn${msg.reactions?.includes(emoji) ? ' active' : ''}`}
                          onClick={() => handleReaction(msg, emoji)}
                        >{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {lastSeenId != null && msg.id === lastSeenId && (
                <div className="slack-seen-row">
                  <span className="slack-seen-label">Seen</span>
                  <img src={getAvatarSrc('assistant')} className="slack-seen-avatar" alt="seen" />
                </div>
              )}
            </React.Fragment>
          )
        })}
        {typingUser && (
          <div className="slack-msg slack-typing-row">
            <div className="slack-avatar" style={{ border: '2px solid #cc785c', boxShadow: '0 0 6px #cc785c40' }}>
              <img src={getAvatarSrc('assistant')} alt="typing" className="slack-avatar-img" />
            </div>
            <div className="slack-msg-content">
              <div className="slack-typing-label">{typingUser} is typing</div>
              <div className="slack-typing-dots"><span/><span/><span/></div>
            </div>
          </div>
        )}
      </div>

      <div className="slack-input-wrap">
        {showSlashHint && (
          <div className="slack-slash-hint">
            <span className="slack-slash-cmd">/status</span>
            <span className="slack-slash-cmd">/agents</span>
            <span className="slack-slash-cmd">/help</span>
            <span className="slack-slash-cmd">/the-office</span>
          </div>
        )}
        <div className="slack-input-bar">
          <input
            type="text"
            className="slack-input-field"
            placeholder={`Ketik pesan di #${activeChannel}...`}
            value={inputText}
            onChange={e => {
              const val = e.target.value
              setInputText(val)
              setShowSlashHint(val === '/')
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setShowSlashHint(false)
                return
              }
              if (e.key === 'Enter' && inputText.trim()) {
                const trimmed = inputText.trim()
                if (trimmed === '/the-office' || trimmed === '/theoffice') {
                  toggleTheme()
                  const nowOn = getTheme() === 'office'
                  onSendMessage?.(nowOn ? '👔 Dunder Mifflin mode: ON.' : '🏢 Office theme: OFF', activeChannel)
                } else {
                  onSendMessage?.(trimmed, activeChannel)
                }
                setInputText('')
                setShowSlashHint(false)
              }
            }}
            onBlur={() => setTimeout(() => setShowSlashHint(false), 150)}
          />
        </div>
      </div>
    </div>
  )
}

export default SlackChat
