import type { ReactNode } from 'react'
import type { MiniWorkOrderType } from '../mock/miniProgramData'

interface IconProps {
  size?: number
  color?: string
  className?: string
}

function SvgWrap({
  size = 24,
  className,
  children,
  viewBox = '0 0 24 24',
}: {
  size?: number
  className?: string
  children: ReactNode
  viewBox?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** 底部 Tab：首页 */
export function TabHomeIcon({ size = 22, color, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className}>
      <path fill={color ?? 'currentColor'} d="M12 3 4 9.5V20h5.5v-6.5H14V20H20V9.5L12 3z" />
    </SvgWrap>
  )
}

/** 底部 Tab：协作 */
export function TabTeamIcon({ size = 22, color, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className}>
      <path
        fill={color ?? 'currentColor'}
        d="M9 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6 0a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2zM3.5 18.2c0-2.4 2.5-3.6 5.5-3.6s5.5 1.2 5.5 3.6v.8H3.5v-.8zm9.5-.2c.2-1.6 1.8-2.4 3.8-2.4 2.2 0 3.7.9 3.7 2.6v.8h-7.5v-1z"
      />
    </SvgWrap>
  )
}

/** 底部 Tab：数据 */
export function TabDataIcon({ size = 22, color, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className}>
      <path fill={color ?? 'currentColor'} d="M5 5h6v6H5V5zm8 0h6v6h-6V5zM5 13h6v6H5v-6zm8 0h6v6h-6v-6z" />
    </SvgWrap>
  )
}

/** 底部 Tab：我的 */
export function TabUserIcon({ size = 22, color, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className}>
      <path
        fill={color ?? 'currentColor'}
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.2 0-7 2-7 4.5V20h14v-1.5C19 16 16.2 14 12 14z"
      />
    </SvgWrap>
  )
}

/** 个人中心头像 */
export function ProfileAvatarIcon({ size = 32, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 48 48">
      <rect width="48" height="48" rx="8" fill="#E6F4FF" />
      <path
        fill="#1890FF"
        d="M24 14a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 12c-5.5 0-9 2.6-9 5.5V34h18v-2.5C33 28.6 29.5 26 24 26z"
      />
    </SvgWrap>
  )
}

/** 空状态：文档 */
export function EmptyDocIcon({ size = 40, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 48 48">
      <path
        fill="none"
        stroke="#D9D9D9"
        strokeWidth="2"
        d="M14 8h16l8 8v24a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"
      />
      <path fill="none" stroke="#D9D9D9" strokeWidth="2" d="M30 8v8h8M18 24h16M18 30h12" />
    </SvgWrap>
  )
}

const WO_ICON_COLORS: Record<MiniWorkOrderType | 'my', string> = {
  repair: '#3B8CFF',
  facility: '#13C2C2',
  maintenance: '#52C41A',
  inspection: '#FAAD14',
  my: '#9254DE',
}

function WoRepairGlyph() {
  return (
    <>
      <rect x="6" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.95" />
      <path
        fill="#fff"
        d="M11 11h10v2H11v-2zm0 4h10v1.5H11V15zm-1 6.5 2.2-2.2 3.8 3.8 6.5-6.5 2.1 2.1-8.6 8.6-6-6-2.1 2.1-1.9-1.9 2.1-2.1z"
      />
    </>
  )
}

function WoFacilityGlyph() {
  return (
    <>
      <rect x="6" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.95" />
      <path
        fill="#fff"
        d="M11 22V13l5-3 5 3v9h-2v-7l-3-1.8-3 1.8v7h-2zm1 3h8v2h-8v-2z"
      />
    </>
  )
}

function WoMaintenanceGlyph() {
  return (
    <>
      <rect x="7" y="6" width="18" height="24" rx="2" fill="currentColor" opacity="0.95" />
      <path fill="#fff" d="M11 11h10v1.5H11V11zm0 3.5h10V16H11v-1.5zm0 3.5h7V18h-7v-1.5z" />
      <circle cx="24" cy="26" r="5" fill="currentColor" />
      <path
        fill="#fff"
        d="M22.5 24.5h3v1.2h-1.2v1.2h-1.2v-1.2h-1.2v-1.2zm.6 2.8 1-1 1.4 1.4 2.2-2.2 1 1-3.2 3.2-2.4-2.4z"
      />
    </>
  )
}

function WoInspectionGlyph() {
  return (
    <>
      <rect x="7" y="6" width="18" height="24" rx="2" fill="currentColor" opacity="0.95" />
      <path fill="#fff" d="M11 11h10v1.5H11V11zm0 3.5h10V16H11v-1.5zm0 3.5h7V18h-7v-1.5z" />
      <path fill="#fff" d="M22 24.5 26.5 20l1.4 1.4-4.5 4.5-2.1-2.1 1.4-1.3 1.8 1.8z" />
    </>
  )
}

function WoMyGlyph() {
  return (
    <>
      <rect x="6" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.95" />
      <path
        fill="#fff"
        d="M16 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-3.8 0-6 1.6-6 3.2V28h12v-1.8C22 24.6 19.8 23 16 23z"
      />
    </>
  )
}

const WO_GLYPHS: Record<MiniWorkOrderType | 'my', () => ReactNode> = {
  repair: WoRepairGlyph,
  facility: WoFacilityGlyph,
  maintenance: WoMaintenanceGlyph,
  inspection: WoInspectionGlyph,
  my: WoMyGlyph,
}

export function WorkOrderIcon({ type, size = 32 }: { type: MiniWorkOrderType | 'my'; size?: number }) {
  const Glyph = WO_GLYPHS[type]
  const color = WO_ICON_COLORS[type]
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="mini-wo-svg">
      <g color={color}>
        <Glyph />
      </g>
    </svg>
  )
}

export function getWorkOrderIconColor(type: MiniWorkOrderType | 'my') {
  return WO_ICON_COLORS[type]
}

/** 协作页：我的工单（线框列表图标） */
export function ServiceWorkOrderIcon({ size = 40, color = '#1890ff', className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 48 48">
      <rect
        x="10"
        y="8"
        width="28"
        height="32"
        rx="3"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
      <path
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        d="M16 18h16M16 24h16M16 30h10"
      />
    </SvgWrap>
  )
}
