import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { COMMUNITIES, matchesAnyCommunityName } from '../constants/communities'

interface MiniCommunityFilterProps {
  appliedCommunities: string[]
  onApply: (communities: string[]) => void
}

function MiniFilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M2 4h14M5 9h8M7.5 14h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function getMiniPhoneRoot() {
  return document.querySelector('.mini-phone') as HTMLElement | null
}

/** 工单列表右上角小区筛选：点击图标在手机容器内弹出多选面板 */
export default function MiniCommunityFilter({ appliedCommunities, onApply }: MiniCommunityFilterProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>([])
  const [phoneRoot, setPhoneRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPhoneRoot(getMiniPhoneRoot())
  }, [])

  const openPanel = () => {
    if (!phoneRoot) setPhoneRoot(getMiniPhoneRoot())
    setDraft([...appliedCommunities])
    setOpen(true)
  }

  const toggle = (name: string) => {
    setDraft((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]))
  }

  const handleConfirm = () => {
    onApply([...draft])
    setOpen(false)
  }

  const active = appliedCommunities.length > 0

  const overlay =
    open && phoneRoot
      ? createPortal(
          <div className="mini-community-filter-overlay" role="dialog" aria-modal="true">
            <div className="mini-community-filter-mask" onClick={() => setOpen(false)} />
            <div className="mini-community-filter-panel">
              <div className="mini-community-filter-header">
                <button type="button" className="mini-community-filter-action" onClick={() => setOpen(false)}>
                  取消
                </button>
                <button type="button" className="mini-community-filter-action" onClick={() => setDraft([])}>
                  重置
                </button>
                <button type="button" className="mini-community-filter-action primary" onClick={handleConfirm}>
                  确定
                </button>
              </div>
              <div className="mini-community-filter-tags">
                {COMMUNITIES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`mini-community-filter-tag ${draft.includes(name) ? 'active' : ''}`}
                    onClick={() => toggle(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          phoneRoot,
        )
      : null

  return (
    <>
      <button
        type="button"
        className={`mini-list-filter-btn ${active ? 'active' : ''}`}
        aria-label="筛选小区名称"
        onClick={openPanel}
      >
        <MiniFilterIcon />
        {active && <span className="mini-list-filter-dot" />}
      </button>
      {overlay}
    </>
  )
}

export function matchesCommunityFilter(community: string, selected: string[]) {
  return matchesAnyCommunityName(community, selected)
}
