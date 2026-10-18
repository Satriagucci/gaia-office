import React from 'react'
import { DeliverableItem } from '../types'

interface DeliverableToastProps {
  items: DeliverableItem[]
  onDismiss: (id: string) => void
  onOpenTestBank?: () => void
}

export const DeliverableToast: React.FC<DeliverableToastProps> = ({
  items,
  onDismiss,
  onOpenTestBank,
}) => {
  if (items.length === 0) return null

  const TYPE_ICONS: Record<string, string> = {
    test: '🧪',
    build: '📦',
    deploy: '🚀',
    review: '📋',
    api: '⚡',
  }

  return (
    <div className="deliverable-toast-container">
      {items.map((item) => {
        const icon = TYPE_ICONS[item.type] || '📌'
        return (
          <div key={item.id} className="deliverable-toast-card animate-slide-in">
            <div className="toast-header">
              <span className="toast-icon">{icon}</span>
              <div className="toast-title-box">
                <span className="toast-badge">{item.type.toUpperCase()}</span>
                <span className="toast-title">{item.title}</span>
              </div>
              <button
                className="toast-close-btn"
                onClick={() => onDismiss(item.id)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="toast-summary">{item.summary}</div>

            <div className="toast-footer">
              <span className="toast-agent">Oleh {item.agentName}</span>
              <div className="toast-action-row">
                {item.type === 'test' && onOpenTestBank && (
                  <button
                    className="toast-btn-action"
                    onClick={() => {
                      onOpenTestBank()
                      onDismiss(item.id)
                    }}
                  >
                    🔍 Buka Test Bank
                  </button>
                )}
                {item.screenshotUrl && (
                  <a
                    href={item.screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="toast-btn-action"
                  >
                    🖼️ Bukti Visual
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DeliverableToast
