/** 小区名称可选值（与小区/安装位置前缀保持一致） */
export const COMMUNITIES = [
  '双翼大厦',
  '中期大厦',
  '天山路473号',
  '天山路473',
  '森林湾大厦',
  '北京华路',
  '礼田路',
  '溧阳消防局训练基地',
] as const

export type CommunityName = (typeof COMMUNITIES)[number]

/** 从安装位置/地址字符串前缀解析小区名称 */
export function resolveCommunityFromLocation(location: string): string {
  if (!location?.trim()) return ''
  const sorted = [...COMMUNITIES].sort((a, b) => b.length - a.length)
  for (const name of sorted) {
    if (location.startsWith(name)) return name
  }
  return ''
}

/** 补全小区名称：优先显式字段，否则从位置解析 */
export function normalizeCommunity(community: string | undefined, location: string): string {
  const trimmed = community?.trim()
  if (trimmed) return trimmed
  return resolveCommunityFromLocation(location) || '—'
}

/** 小区名称是否匹配筛选值（精确或前缀别名，如 天山路473 / 天山路473号） */
export function matchesCommunityName(value: string | undefined, filter?: string): boolean {
  if (!filter?.trim()) return true
  const v = value?.trim() ?? ''
  if (!v || v === '—') return false
  const f = filter.trim()
  if (v === f) return true
  return v.startsWith(f) || f.startsWith(v)
}

/** 多选小区名称匹配 */
export function matchesAnyCommunityName(value: string | undefined, filters: string[]): boolean {
  if (!filters.length) return true
  return filters.some((f) => matchesCommunityName(value, f))
}
