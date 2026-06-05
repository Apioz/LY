import type { AlarmLevel } from '../pages/alarm/constants'
import { DEFAULT_TIMEOUT_MINUTES } from '../pages/alarm/constants'
import { formatThresholdDisplay, type ThresholdMode } from '../store/alarmSync'

/** 设备目录：一级类别 → 二级子类 → 三级设备名称（三级仅用于统计子级数量） */
export const ALARM_SETTINGS2_DEVICE_CATALOG: Record<string, Record<string, readonly string[]>> = {
  消防设备: {
    消火栓: ['消火栓1', '消火栓2', '消火栓3', '消火栓4', '消火栓5', '消火栓6'],
    灭火器: ['灭火器1', '灭火器2', '灭火器3', '灭火器4', '灭火器5', '灭火器6', '灭火器7', '灭火器8'],
    火灾报警: ['火灾报警器1', '火灾报警器2', '火灾报警器3', '火灾报警器4', '火灾报警器5', '火灾报警器6'],
    烟感器: ['烟感器1', '烟感器2', '烟感器3', '烟感器4', '烟感器5'],
    温感器: ['温感器1', '温感器2', '温感器3', '温感器4'],
    消防主机: ['消防主机1', '消防主机2', '消防主机3'],
    防火门: ['防火门1', '防火门2', '防火门3', '防火门4'],
  },
  监控设备: {
    监控摄像头: ['摄像头1', '摄像头2', '摄像头3', '摄像头4', '摄像头5', '摄像头6', '摄像头7', '摄像头8'],
    门禁系统: ['门禁1', '门禁2', '门禁3', '门禁4', '门禁5', '门禁6'],
    红外探测器: ['红外探测器1', '红外探测器2', '红外探测器3', '红外探测器4'],
    周界报警: ['周界报警器1', '周界报警器2', '周界报警器3'],
  },
  供水设备: {
    生活水泵: ['生活水泵1', '生活水泵2', '生活水泵3', '生活水泵4'],
    消防水泵: ['消防水泵1', '消防水泵2', '消防水泵3', '消防水泵4', '消防水泵5'],
  },
}

export const ALARM_SETTINGS2_ROOT_CATEGORIES = Object.keys(ALARM_SETTINGS2_DEVICE_CATALOG)

export interface AlarmDeviceRule2 {
  key: string
  rootCategory: string
  subCategory: string
  level: AlarmLevel | string
  thresholdMode: ThresholdMode
  customMinutes?: number
  thresholdDisplay: string
  createTime: string
}

export type AlarmSettings2RowType = 'root' | 'category'

export interface AlarmSettings2TreeRow {
  key: string
  name: string
  rowType: AlarmSettings2RowType
  rootCategory?: string
  subCategory?: string
  childCount?: number
  thresholdDisplay?: string
  level?: string
  createTime?: string
  children?: AlarmSettings2TreeRow[]
}

const LEVELS: AlarmLevel[] = ['一级告警', '二级告警', '三级告警', '四级告警']

/** 二级子类下三级设备总数 */
export function getSubCategoryDeviceCount(rootCategory: string, subCategory: string) {
  return ALARM_SETTINGS2_DEVICE_CATALOG[rootCategory]?.[subCategory]?.length ?? 0
}

function buildInitialRules(): AlarmDeviceRule2[] {
  const rules: AlarmDeviceRule2[] = []
  let seq = 0
  const baseDate = new Date('2026-01-15T08:00:00')

  Object.entries(ALARM_SETTINGS2_DEVICE_CATALOG).forEach(([rootCategory, subs], rootIdx) => {
    Object.entries(subs).forEach(([subCategory], subIdx) => {
      const shouldConfigure = (rootIdx + subIdx) % 5 !== 0 && (rootIdx + subIdx) % 3 !== 2
      if (!shouldConfigure) return

      seq += 1
      const thresholdMode: ThresholdMode = seq % 7 === 0 ? 'none' : 'deviceTimeout'
      const customMinutes = thresholdMode === 'deviceTimeout' ? (seq % 4 === 0 ? 15 : 30) : undefined
      const dayOffset = seq % 28
      const createDate = new Date(baseDate)
      createDate.setDate(createDate.getDate() - dayOffset)
      const createTime = createDate.toISOString().slice(0, 19).replace('T', ' ')

      rules.push({
        key: `cat-init-${seq}`,
        rootCategory,
        subCategory,
        level: LEVELS[seq % LEVELS.length],
        thresholdMode,
        customMinutes,
        thresholdDisplay: formatThresholdDisplay(thresholdMode, customMinutes),
        createTime,
      })
    })
  })

  return rules
}

export const initialAlarmDeviceRules2: AlarmDeviceRule2[] = buildInitialRules()

export function countCatalogDevices() {
  return Object.values(ALARM_SETTINGS2_DEVICE_CATALOG).reduce(
    (sum, subs) => sum + Object.values(subs).reduce((s, list) => s + list.length, 0),
    0,
  )
}

/** 二级级联：一级类别 → 二级子类 */
export function buildDeviceCatalogCascaderOptions() {
  return Object.entries(ALARM_SETTINGS2_DEVICE_CATALOG).map(([root, subs]) => ({
    value: root,
    label: root,
    children: Object.keys(subs).map((sub) => ({ value: sub, label: sub })),
  }))
}

export function subCategoryPathKey(root: string, sub: string) {
  return `${root}/${sub}`
}

export function pathsToSubCategorySelections(paths: string[][]) {
  return paths
    .filter((p) => p.length === 2)
    .map((p) => ({
      rootCategory: p[0],
      subCategory: p[1],
    }))
}

export function ruleToSubCategoryPath(rule: AlarmDeviceRule2): string[] {
  return [rule.rootCategory, rule.subCategory]
}

export interface AlarmSettings2DisplayFilter {
  keyword?: string
  level?: string
  dateStart?: number
  dateEnd?: number
}

function subCategoryMatchesFilter(
  rootCategory: string,
  subCategory: string,
  rule: AlarmDeviceRule2 | undefined,
  filter?: AlarmSettings2DisplayFilter,
) {
  if (!filter?.keyword && !filter?.level && filter?.dateStart === undefined) return true
  const kw = filter.keyword?.trim().toLowerCase()
  if (kw) {
    const hit =
      subCategory.toLowerCase().includes(kw) || rootCategory.toLowerCase().includes(kw)
    if (!hit) return false
  }
  if (filter.level) {
    if (!rule || rule.level !== filter.level) return false
  }
  if (filter.dateStart !== undefined && filter.dateEnd !== undefined) {
    if (!rule) return false
    const t = new Date(rule.createTime.replace(/-/g, '/')).getTime()
    if (t < filter.dateStart || t > filter.dateEnd) return false
  }
  return true
}

export function buildAlarmSettings2Tree(
  rules: AlarmDeviceRule2[],
  displayFilter?: AlarmSettings2DisplayFilter,
): AlarmSettings2TreeRow[] {
  const ruleMap = new Map<string, AlarmDeviceRule2>()
  rules.forEach((r) => ruleMap.set(subCategoryPathKey(r.rootCategory, r.subCategory), r))

  const roots: AlarmSettings2TreeRow[] = []

  Object.entries(ALARM_SETTINGS2_DEVICE_CATALOG).forEach(([rootCategory, subs]) => {
    const subChildren: AlarmSettings2TreeRow[] = []

    Object.entries(subs).forEach(([subCategory]) => {
      const rule = ruleMap.get(subCategoryPathKey(rootCategory, subCategory))
      if (!rule) return
      if (!subCategoryMatchesFilter(rootCategory, subCategory, rule, displayFilter)) return

      subChildren.push({
        key: rule.key,
        name: subCategory,
        rowType: 'category',
        rootCategory,
        subCategory,
        childCount: getSubCategoryDeviceCount(rootCategory, subCategory),
        thresholdDisplay: rule.thresholdDisplay,
        level: rule.level,
        createTime: rule.createTime,
      })
    })

    if (subChildren.length) {
      roots.push({
        key: `root-${rootCategory}`,
        name: rootCategory,
        rowType: 'root',
        children: subChildren,
      })
    }
  })

  return roots
}

export function findDeviceRule(rules: AlarmDeviceRule2[], key: string) {
  return rules.find((r) => r.key === key)
}

export function createSubCategoryRule(
  partial: Pick<
    AlarmDeviceRule2,
    'rootCategory' | 'subCategory' | 'level' | 'thresholdMode' | 'customMinutes'
  >,
  keySuffix?: string,
): AlarmDeviceRule2 {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  return {
    key: `cat-${keySuffix ?? Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    rootCategory: partial.rootCategory,
    subCategory: partial.subCategory,
    level: partial.level,
    thresholdMode: partial.thresholdMode,
    customMinutes: partial.thresholdMode === 'deviceTimeout' ? partial.customMinutes : undefined,
    thresholdDisplay: formatThresholdDisplay(partial.thresholdMode, partial.customMinutes),
    createTime: now,
  }
}

/** @deprecated 使用 subCategoryPathKey */
export function devicePathKey(root: string, sub: string, _device?: string) {
  return subCategoryPathKey(root, sub)
}

/** @deprecated 使用 pathsToSubCategorySelections */
export function pathsToDeviceSelections(paths: string[][]) {
  return pathsToSubCategorySelections(paths).map((s) => ({ ...s, deviceName: '' }))
}

/** @deprecated 使用 ruleToSubCategoryPath */
export function ruleToDevicePath(rule: AlarmDeviceRule2): string[] {
  return ruleToSubCategoryPath(rule)
}

/** @deprecated 使用 createSubCategoryRule */
export function createDeviceRule(
  partial: Pick<
    AlarmDeviceRule2,
    'rootCategory' | 'subCategory' | 'level' | 'thresholdMode' | 'customMinutes'
  > & { deviceName?: string },
  keySuffix?: string,
): AlarmDeviceRule2 {
  return createSubCategoryRule(partial, keySuffix)
}

export { DEFAULT_TIMEOUT_MINUTES }
