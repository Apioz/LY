import type { AlarmListItem } from '../mock/alarmData'
import { DEFAULT_TIMEOUT_MINUTES } from '../pages/alarm/constants'
import type { AlarmLevel } from '../pages/alarm/constants'
import type { AlarmDescType } from '../pages/alarm/constants'

/** 中台设施工单状态 */
export const FACILITY_ORDER_STATUS = ['待处理', '处理中', '已处理', '损坏'] as const
export type FacilityOrderStatus = (typeof FACILITY_ORDER_STATUS)[number]

/** 小程序设施工单展示状态 */
export const MINI_FACILITY_STATUS = ['待派单', '待接单', '处理中', '已完成', '已取消', '损坏'] as const
export type MiniFacilityStatus = (typeof MINI_FACILITY_STATUS)[number]

export interface FacilityFlowRecord {
  time: string
  action: string
  operator: string
  detail?: string
}

export interface FacilityOrderItem {
  id: string
  alarmDevices: string[]
  /** 设备安装位置 */
  installLocation: string
  level: AlarmLevel | string
  desc: AlarmDescType | string
  alarmTime: string
  /** 中台同步状态 */
  status: FacilityOrderStatus | string
  /** 小程序展示状态 */
  miniStatus: MiniFacilityStatus | string
  receiver: string
  alarmId?: string
  source: '告警同步' | '手动'
  damageNote?: string
  initiator?: string
  flowRecords?: FacilityFlowRecord[]
  dispatchGroup?: string
  dispatchNote?: string
}

function nowStr() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function appendFlow(
  records: FacilityFlowRecord[] | undefined,
  action: string,
  operator: string,
  detail?: string,
): FacilityFlowRecord[] {
  return [...(records ?? []), { time: nowStr(), action, operator, detail }]
}

export function platformStatusFromMini(mini: MiniFacilityStatus | string): FacilityOrderStatus {
  if (mini === '待派单' || mini === '待接单' || mini === '已取消') return '待处理'
  if (mini === '处理中') return '处理中'
  if (mini === '已完成') return '已处理'
  if (mini === '损坏') return '损坏'
  return '待处理'
}

function legacyMiniStatus(status: string): MiniFacilityStatus {
  if (status === '待处理') return '待接单'
  if (status === '已处理') return '已完成'
  if (MINI_FACILITY_STATUS.includes(status as MiniFacilityStatus)) return status as MiniFacilityStatus
  return '待接单'
}

function normalizeOrder(o: FacilityOrderItem): FacilityOrderItem {
  const miniStatus = o.miniStatus ? legacyMiniStatus(String(o.miniStatus)) : legacyMiniStatus(String(o.status))
  return { ...o, miniStatus, status: platformStatusFromMini(miniStatus) }
}

const initialFacility: FacilityOrderItem[] = [
  {
    id: 'SG20260601001',
    alarmDevices: ['消防水泵', '生活水泵'],
    installLocation: '双翼大厦地下一层消防泵房',
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-06-01 11:20:05',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601003',
    initiator: '系统',
    flowRecords: [
      { time: '2026-06-01 11:20:05', action: '告警同步生成设施工单', operator: '系统' },
      { time: '2026-06-01 11:20:05', action: '工单状态：待接单', operator: '—' },
    ],
  },
  {
    id: 'SG20260601002',
    alarmDevices: ['配电柜'],
    installLocation: '双翼大厦1层配电间',
    level: '二级告警',
    desc: '故障报警',
    alarmTime: '2026-06-01 09:45:11',
    status: '处理中',
    miniStatus: '处理中',
    receiver: '王运维',
    source: '告警同步',
    alarmId: 'AL20260601002',
    initiator: '系统',
    flowRecords: [
      { time: '2026-06-01 09:45:11', action: '告警同步生成设施工单', operator: '系统' },
      { time: '2026-06-01 09:50:00', action: '维修人员接单', operator: '王运维' },
      { time: '2026-06-01 09:50:00', action: '工单状态：处理中', operator: '王运维' },
    ],
  },
  {
    id: 'SG20260528003',
    alarmDevices: ['客梯-双翼大厦B栋'],
    installLocation: '双翼大厦B栋客梯机房',
    level: '一级告警',
    desc: '火灾报警',
    alarmTime: '2026-05-28 16:02:18',
    status: '已处理',
    miniStatus: '已完成',
    receiver: '李维修',
    source: '告警同步',
    initiator: '系统',
    flowRecords: [
      { time: '2026-05-28 16:02:18', action: '告警同步生成设施工单', operator: '系统' },
      { time: '2026-05-28 16:30:00', action: '维修人员接单', operator: '李维修' },
      { time: '2026-05-29 10:00:00', action: '提交完成', operator: '李维修', detail: '现场复测正常' },
      { time: '2026-05-29 10:00:00', action: '工单状态：已完成', operator: '李维修' },
    ],
  },
  {
    id: 'SG20260520004',
    alarmDevices: ['喷淋泵'],
    installLocation: '中期大厦地下二层喷淋泵房',
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-05-20 08:30:00',
    status: '损坏',
    miniStatus: '损坏',
    receiver: '-',
    source: '手动',
    damageNote: '喷淋泵电机烧毁，需更换配件后复测',
    initiator: '管理员000000',
    flowRecords: [
      { time: '2026-05-20 08:30:00', action: '手动创建设施工单', operator: '管理员000000' },
      { time: '2026-05-20 09:00:00', action: '维修人员接单', operator: '张工' },
      { time: '2026-05-21 14:00:00', action: '提交损坏', operator: '张工', detail: '喷淋泵电机烧毁，需更换配件后复测' },
      { time: '2026-05-21 14:00:00', action: '工单状态：损坏', operator: '张工' },
    ],
  },
  {
    id: 'SG20260605005',
    alarmDevices: ['烟感探测器'],
    installLocation: '森林湾大厦5层走廊',
    level: '二级告警',
    desc: '故障报警',
    alarmTime: '2026-06-05 10:00:00',
    status: '待处理',
    miniStatus: '待派单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    flowRecords: [
      { time: '2026-06-05 10:00:00', action: '手动创建设施工单', operator: '管理员000000' },
      { time: '2026-06-05 10:00:00', action: '工单状态：待派单', operator: '—' },
    ],
  },
] as FacilityOrderItem[]

const initialFacilityNormalized = initialFacility.map(normalizeOrder)

let facilityOrders: FacilityOrderItem[] = [...initialFacilityNormalized]
const facilityListeners = new Set<() => void>()

export function getFacilityOrders() {
  return facilityOrders
}

export function getFacilityOrderById(id: string) {
  return facilityOrders.find((o) => o.id === id)
}

export function subscribeFacility(listener: () => void) {
  facilityListeners.add(listener)
  return () => {
    facilityListeners.delete(listener)
  }
}

function notifyFacility() {
  facilityListeners.forEach((fn) => fn())
}

export function syncAlarmToFacility(alarm: AlarmListItem) {
  if (facilityOrders.some((o) => o.alarmId === alarm.id)) return
  const flow: FacilityFlowRecord[] = [
    { time: alarm.time, action: '告警同步生成设施工单', operator: '系统' },
    { time: alarm.time, action: '工单状态：待接单', operator: '—' },
  ]
  facilityOrders = [
    normalizeOrder({
      id: `SG-${alarm.id}`,
      alarmDevices: alarm.alarmDevices,
      installLocation: alarm.installLocation,
      level: alarm.level,
      desc: alarm.desc,
      alarmTime: alarm.time,
      status: '待处理',
      miniStatus: '待接单',
      receiver: '-',
      alarmId: alarm.id,
      source: '告警同步',
      initiator: '系统',
      flowRecords: flow,
    }),
    ...facilityOrders,
  ]
  notifyFacility()
}

export function closeFacilityByAlarm(alarmId: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.alarmId !== alarmId || o.miniStatus === '已完成') return o
    const receiver = o.receiver === '-' ? '系统' : o.receiver
    return normalizeOrder({
      ...o,
      miniStatus: '已完成',
      receiver,
      flowRecords: appendFlow(o.flowRecords, '告警恢复自动关单', '系统'),
    })
  })
  notifyFacility()
}

export function closeFacilityOrder(orderId: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId) return o
    return normalizeOrder({
      ...o,
      miniStatus: '已完成',
      flowRecords: appendFlow(o.flowRecords, '工单状态：已完成', o.receiver),
    })
  })
  notifyFacility()
}

/** 派单：待派单 → 待接单 */
export function dispatchFacilityOrder(
  orderId: string,
  group: string,
  worker: string,
  note: string,
  operator: string,
) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || o.miniStatus !== '待派单') return o
    let flow = appendFlow(o.flowRecords, `[派单]`, operator, `处理人员：${group}-${worker}`)
    if (note.trim()) flow = appendFlow(flow, '派单说明', operator, note.trim())
    flow = appendFlow(flow, '工单状态：待接单', operator)
    return normalizeOrder({
      ...o,
      miniStatus: '待接单',
      receiver: worker,
      dispatchGroup: group,
      dispatchNote: note.trim() || undefined,
      flowRecords: flow,
    })
  })
  notifyFacility()
}

/** 催单：记录流程，状态不变 */
export function urgeFacilityOrder(orderId: string, note: string, operator: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId) return o
    return {
      ...o,
      flowRecords: appendFlow(o.flowRecords, '[催单]', operator, note.trim()),
    }
  })
  notifyFacility()
}

/** 撤销：待派单 → 已取消 */
export function revokeFacilityOrder(orderId: string, note: string, operator: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || o.miniStatus !== '待派单') return o
    let flow = appendFlow(o.flowRecords, '[撤销]', operator, note.trim())
    flow = appendFlow(flow, '工单状态：已取消', operator)
    return normalizeOrder({
      ...o,
      miniStatus: '已取消',
      receiver: '-',
      flowRecords: flow,
    })
  })
  notifyFacility()
}

/** 接单：待接单或损坏 → 处理中 */
export function acceptFacilityOrder(orderId: string, receiver: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId) return o
    if (o.miniStatus !== '待接单' && o.miniStatus !== '损坏') return o
    let flow = appendFlow(o.flowRecords, '维修人员接单', receiver)
    flow = appendFlow(flow, '工单状态：处理中', receiver)
    return normalizeOrder({
      ...o,
      miniStatus: '处理中',
      receiver,
      flowRecords: flow,
    })
  })
  notifyFacility()
}

/** 取消接单：处理中 → 待接单，退回工单池 */
export function cancelAcceptedFacilityOrder(orderId: string, receiver: string, reason: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || o.miniStatus !== '处理中' || o.receiver !== receiver) return o
    let flow = appendFlow(o.flowRecords, '[取消接单]', receiver, reason.trim())
    flow = appendFlow(flow, '工单状态：待接单', receiver)
    return normalizeOrder({
      ...o,
      miniStatus: '待接单',
      receiver: '-',
      flowRecords: flow,
    })
  })
  notifyFacility()
}

/** 提交完成：处理中 → 已完成 */
export function completeFacilityOrder(
  orderId: string,
  receiver: string,
  payload: { arrivalTime: string; note?: string },
) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || o.miniStatus !== '处理中' || o.receiver !== receiver) return o
    let flow = appendFlow(o.flowRecords, '提交完成', receiver, `到达现场：${payload.arrivalTime}`)
    if (payload.note?.trim()) flow = appendFlow(flow, '维修描述', receiver, payload.note.trim())
    flow = appendFlow(flow, '工单状态：已完成', receiver)
    return normalizeOrder({
      ...o,
      miniStatus: '已完成',
      flowRecords: flow,
    })
  })
  notifyFacility()
}

/** 提交损坏：处理中 → 损坏，退回工单池 */
export function damageFacilityOrder(orderId: string, receiver: string, damageNote: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || o.miniStatus !== '处理中' || o.receiver !== receiver) return o
    let flow = appendFlow(o.flowRecords, '提交损坏', receiver, damageNote.trim())
    flow = appendFlow(flow, '工单状态：损坏', receiver)
    return normalizeOrder({
      ...o,
      miniStatus: '损坏',
      receiver: '-',
      damageNote: damageNote.trim(),
      flowRecords: flow,
    })
  })
  notifyFacility()
}

export function updateFacilityDamageNote(orderId: string, damageNote: string) {
  facilityOrders = facilityOrders.map((o) =>
    o.id === orderId && o.miniStatus === '损坏' ? { ...o, damageNote } : o,
  )
  notifyFacility()
}

export type ThresholdMode = 'none' | 'deviceTimeout'

export function formatThresholdDisplay(thresholdMode: ThresholdMode, customMinutes?: number) {
  if (thresholdMode === 'deviceTimeout') {
    const minutes = customMinutes ?? DEFAULT_TIMEOUT_MINUTES
    return `设备离线超过${minutes}分钟（设备超时报警）`
  }
  return '无'
}
