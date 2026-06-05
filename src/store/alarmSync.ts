import type { AlarmListItem } from '../mock/alarmData'
import { DEFAULT_TIMEOUT_MINUTES } from '../pages/alarm/constants'
import type { AlarmLevel } from '../pages/alarm/constants'
import type { AlarmDescType } from '../pages/alarm/constants'

export const FACILITY_ORDER_STATUS = ['待处理', '处理中', '已处理', '损坏'] as const
export type FacilityOrderStatus = (typeof FACILITY_ORDER_STATUS)[number]

export interface FacilityFlowRecord {
  time: string
  action: string
  operator: string
}

export interface FacilityOrderItem {
  id: string
  alarmDevices: string[]
  level: AlarmLevel | string
  desc: AlarmDescType | string
  alarmTime: string
  status: FacilityOrderStatus | string
  receiver: string
  alarmId?: string
  source: '告警同步' | '手动'
  /** 损坏工单备注，供维修人员填写 */
  damageNote?: string
  initiator?: string
  flowRecords?: FacilityFlowRecord[]
}

const initialFacility: FacilityOrderItem[] = [
  {
    id: 'SG20260601001',
    alarmDevices: ['消防水泵', '生活水泵'],
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-06-01 11:20:05',
    status: '待处理',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601003',
    initiator: '系统',
    flowRecords: [
      { time: '2026-06-01 11:20:05', action: '告警同步生成设施工单', operator: '系统' },
      { time: '2026-06-01 11:20:05', action: '工单状态：待处理', operator: '—' },
    ],
  },
  {
    id: 'SG20260601002',
    alarmDevices: ['配电柜'],
    level: '二级告警',
    desc: '故障报警',
    alarmTime: '2026-06-01 09:45:11',
    status: '处理中',
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
    level: '一级告警',
    desc: '火灾报警',
    alarmTime: '2026-05-28 16:02:18',
    status: '已处理',
    receiver: '李维修',
    source: '告警同步',
    initiator: '系统',
    flowRecords: [
      { time: '2026-05-28 16:02:18', action: '告警同步生成设施工单', operator: '系统' },
      { time: '2026-05-28 16:30:00', action: '维修人员接单', operator: '李维修' },
      { time: '2026-05-29 10:00:00', action: '工单状态：已处理', operator: '李维修' },
    ],
  },
  {
    id: 'SG20260520004',
    alarmDevices: ['喷淋泵'],
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-05-20 08:30:00',
    status: '损坏',
    receiver: '张工',
    source: '手动',
    damageNote: '喷淋泵电机烧毁，需更换配件后复测',
    initiator: '管理员000000',
    flowRecords: [
      { time: '2026-05-20 08:30:00', action: '手动创建设施工单', operator: '管理员000000' },
      { time: '2026-05-20 09:00:00', action: '维修人员接单', operator: '张工' },
      { time: '2026-05-21 14:00:00', action: '工单状态：损坏', operator: '张工' },
    ],
  },
]

let facilityOrders: FacilityOrderItem[] = [...initialFacility]
const facilityListeners = new Set<() => void>()

export function getFacilityOrders() {
  return facilityOrders
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
  facilityOrders = [
    {
      id: `SG-${alarm.id}`,
      alarmDevices: alarm.alarmDevices,
      level: alarm.level,
      desc: alarm.desc,
      alarmTime: alarm.time,
      status: '待处理',
      receiver: '-',
      alarmId: alarm.id,
      source: '告警同步',
      initiator: '系统',
      flowRecords: [
        { time: alarm.time, action: '告警同步生成设施工单', operator: '系统' },
        { time: alarm.time, action: '工单状态：待处理', operator: '—' },
      ],
    },
    ...facilityOrders,
  ]
  notifyFacility()
}

export function closeFacilityByAlarm(alarmId: string) {
  facilityOrders = facilityOrders.map((o) =>
    o.alarmId === alarmId && o.status !== '已处理'
      ? { ...o, status: '已处理', receiver: o.receiver === '-' ? '系统' : o.receiver }
      : o,
  )
  notifyFacility()
}

export function closeFacilityOrder(orderId: string) {
  facilityOrders = facilityOrders.map((o) => (o.id === orderId ? { ...o, status: '已处理' } : o))
  notifyFacility()
}

/** 小程序/维修端接单：待处理或损坏 → 处理中 */
export function acceptFacilityOrder(orderId: string, receiver: string) {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId) return o
    if (o.status !== '待处理' && o.status !== '损坏') return o
    const flow = [...(o.flowRecords ?? []), { time: now, action: '维修人员接单', operator: receiver }, { time: now, action: '工单状态：处理中', operator: receiver }]
    return { ...o, status: '处理中', receiver, flowRecords: flow }
  })
  notifyFacility()
}

/** @deprecated 使用 acceptFacilityOrder */
export function acceptDamagedFacilityOrder(orderId: string, receiver: string) {
  acceptFacilityOrder(orderId, receiver)
}

export function updateFacilityDamageNote(orderId: string, damageNote: string) {
  facilityOrders = facilityOrders.map((o) =>
    o.id === orderId && o.status === '损坏' ? { ...o, damageNote } : o,
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
