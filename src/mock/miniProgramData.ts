import { MINI_CURRENT_USER } from '../store/miniProgramUser'
import {
  MINI_FACILITY_STATUS,
  type FacilityFlowRecord,
  facilitySlaColorHex,
  getFacilityArrivalTime,
  resolveFacilityStatusView,
  type FacilityOrderItem,
  type MiniFacilityStatus,
} from '../store/alarmSync'

export type MiniWorkOrderType = 'repair' | 'facility' | 'maintenance' | 'inspection'

export interface MiniFlowRecord {
  time: string
  action: string
  operator: string
  detail?: string
  fields?: { label: string; value: string }[]
  images?: string[]
}

export interface MiniWorkOrder {
  id: string
  type: MiniWorkOrderType
  title: string
  status: string
  createTime: string
  initiator: string
  receiver: string
  location?: string
  description?: string
  extra?: Record<string, string>
  flowRecords: MiniFlowRecord[]
  facilityId?: string
  /** 是否已开始维修（开始后不可取消接单） */
  repairStarted?: boolean
  /** 是否仅在我的已办中展示的归档记录 */
  archiveOnly?: boolean
}

/** 取消接单等已办归档记录 */
export interface MiniHandledRecord {
  id: string
  orderId: string
  type: MiniWorkOrderType
  action: '取消接单' | '提交完成' | '提交损坏'
  title: string
  time: string
  status: string
  detail?: string
  operator: string
}

export const MINI_TYPE_LABELS: Record<MiniWorkOrderType, string> = {
  repair: '报修',
  facility: '设施',
  maintenance: '维保',
  inspection: '巡检',
}

/** 设施工单全部展示状态（含已取消，用于详情等） */
export const MINI_FACILITY_LIST_STATUS = ['待派单', '待接单', '待完成', '已完成', '已取消', '损坏'] as const

export const MINI_TYPE_STATUS: Record<MiniWorkOrderType, string[]> = {
  repair: ['待派单', '待审核', '待接单', '报修待完成', '待签字', '待关单', '已关单', '已取消'],
  facility: [...MINI_FACILITY_LIST_STATUS],
  maintenance: ['待派单', '待审核', '待接单', '处理中', '已完成', '已取消'],
  inspection: ['待执行', '执行中', '已完成', '已取消'],
}

/** 工单列表筛选状态（不含已取消；已取消仅在「我的已办」可见） */
export const MINI_LIST_FILTER_STATUS: Record<MiniWorkOrderType, string[]> = {
  repair: MINI_TYPE_STATUS.repair.filter((s) => s !== '已取消'),
  facility: MINI_FACILITY_LIST_STATUS.filter((s) => s !== '已取消'),
  maintenance: MINI_TYPE_STATUS.maintenance.filter((s) => s !== '已取消'),
  inspection: MINI_TYPE_STATUS.inspection.filter((s) => s !== '已取消'),
}

export const MINI_DONE_STATUSES = ['已完成', '已处理', '已关单'] as const
export const MINI_CANCELLED_STATUS = '已取消'

export const MINI_LIST_TABS: MiniWorkOrderType[] = ['repair', 'facility', 'maintenance', 'inspection']

/** 工单池可见状态：未接单前全员可见 + 损坏可再次接单 */
export const FACILITY_POOL_STATUSES: MiniFacilityStatus[] = ['待派单', '待接单', '损坏']

export const FACILITY_WORK_GROUPS = ['设施维修一组', '设施维修二组', '消防维保组'] as const
export const FACILITY_WORKERS: Record<string, string[]> = {
  设施维修一组: ['张维修', '李维修', '王运维'],
  设施维修二组: ['赵工', '刘工'],
  消防维保组: ['陈维保', '周维保'],
}

export const miniNotices = [
  { id: '1', title: '溧阳消防局关于开展夏季消防安全检查的通知', time: '2026-06-01' },
  { id: '2', title: '消防设施设备维保计划调整公告', time: '2026-05-28' },
  { id: '3', title: '应急演练工作安排（第二季度）', time: '2026-05-20' },
]

export const miniUpdates = [
  { id: '1', title: '双翼大厦消防水泵告警已同步设施工单', time: '2026-06-01 11:20' },
  { id: '2', title: '巡检任务「办公楼消防通道」已完成', time: '2026-05-31 16:40' },
  { id: '3', title: '报修工单 BX20260530001 处理完成', time: '2026-05-30 09:15' },
]

let localOrders: MiniWorkOrder[] = [
  {
    id: 'BX20260604001',
    type: 'repair',
    title: '双翼大厦实验室天花板漏水',
    status: '待关单',
    createTime: '2026-06-04 16:48:06',
    initiator: '李四',
    receiver: MINI_CURRENT_USER,
    location: '双翼大厦5101实验室',
    description: '5101实验室天花板漏水',
    extra: { 问题类型: '日常报修', 问题描述: '5101实验室天花板漏水' },
    flowRecords: [
      { time: '2026-06-04 16:48:06', action: '提交报修工单', operator: '李四' },
      { time: '2026-06-04 17:00:00', action: '维修完成，待关单', operator: MINI_CURRENT_USER },
    ],
  },
  {
    id: 'BX20260604002',
    type: 'repair',
    title: '森林湾大厦消防通道指示灯故障',
    status: '待接单',
    createTime: '2026-06-04 15:30:00',
    initiator: '王主管',
    receiver: '-',
    location: '森林湾大厦3层',
    description: '消防通道应急指示灯不亮',
    extra: { 问题类型: '日常报修', 问题描述: '消防通道应急指示灯不亮' },
    flowRecords: [{ time: '2026-06-04 15:30:00', action: '提交报修工单', operator: '王主管' }],
  },
  {
    id: 'BX20260601001',
    type: 'repair',
    title: '天山路473号消火栓漏水',
    status: '待派单',
    createTime: '2026-06-01 08:30:00',
    initiator: MINI_CURRENT_USER,
    receiver: '-',
    location: '天山路473号',
    description: '地下一层消火栓接口渗水',
    extra: { 问题类型: '日常报修', 问题描述: '地下一层消火栓接口渗水' },
    flowRecords: [
      { time: '2026-06-01 08:30:00', action: '提交报修工单', operator: MINI_CURRENT_USER },
      { time: '2026-06-01 08:30:00', action: '工单状态：待派单', operator: '—' },
    ],
  },
  {
    id: 'BX20260528002',
    type: 'repair',
    title: '森林湾大厦电梯厅照明故障',
    status: '报修待完成',
    createTime: '2026-05-28 14:20:00',
    initiator: '李四',
    receiver: MINI_CURRENT_USER,
    location: '森林湾大厦B栋',
    description: '电梯厅照明灯具损坏需更换',
    extra: { 问题类型: '日常报修', 问题描述: '电梯厅照明灯具损坏需更换' },
    flowRecords: [
      { time: '2026-05-28 14:20:00', action: '提交报修工单', operator: '李四' },
      { time: '2026-05-28 15:00:00', action: '派单', operator: '调度员' },
      { time: '2026-05-28 15:05:00', action: '维修人员接单', operator: MINI_CURRENT_USER },
    ],
  },
  {
    id: 'BX20260520003',
    type: 'repair',
    title: '中期大厦烟感误报',
    status: '已取消',
    createTime: '2026-05-20 11:00:00',
    initiator: MINI_CURRENT_USER,
    receiver: '-',
    location: '中期大厦5层',
    description: '烟感探测器误报，现场无异常',
    extra: { 问题类型: '日常报修', 问题描述: '烟感探测器误报，现场无异常' },
    flowRecords: [
      { time: '2026-05-20 11:00:00', action: '提交报修工单', operator: MINI_CURRENT_USER },
      { time: '2026-05-20 14:00:00', action: '工单已取消', operator: '调度员' },
    ],
  },
  {
    id: 'WB20260525001',
    type: 'maintenance',
    title: '消防主机季度维保',
    status: '待派单',
    createTime: '2026-05-25 09:00:00',
    initiator: '王主管',
    receiver: '-',
    location: '双翼大厦消防控制室',
    extra: { 维保类型: '季度维保' },
    flowRecords: [{ time: '2026-05-25 09:00:00', action: '创建维保工单', operator: '王主管' }],
  },
  {
    id: 'WB20260520002',
    type: 'maintenance',
    title: '喷淋系统月度检测',
    status: '已完成',
    createTime: '2026-05-20 10:00:00',
    initiator: MINI_CURRENT_USER,
    receiver: MINI_CURRENT_USER,
    location: '中期大厦',
    flowRecords: [
      { time: '2026-05-20 10:00:00', action: '创建维保工单', operator: MINI_CURRENT_USER },
      { time: '2026-05-21 16:00:00', action: '工单状态：已完成', operator: MINI_CURRENT_USER },
    ],
  },
  {
    id: 'XJ20260521001',
    type: 'inspection',
    title: '办公楼消防通道巡检',
    status: '待执行',
    createTime: '2026-05-21 10:07:00',
    initiator: '调度员',
    receiver: MINI_CURRENT_USER,
    extra: { 巡检类型: '办公楼', 巡检计划: 'NFC、二维码、手动巡检路线' },
    flowRecords: [{ time: '2026-05-21 10:07:00', action: '下发巡检任务', operator: '调度员' }],
  },
  {
    id: 'XJ20260518002',
    type: 'inspection',
    title: '地下停车场消防设施巡检',
    status: '执行中',
    createTime: '2026-05-18 08:00:00',
    initiator: MINI_CURRENT_USER,
    receiver: MINI_CURRENT_USER,
    extra: { 巡检类型: '停车场', 巡检计划: '每日例行巡检' },
    flowRecords: [
      { time: '2026-05-18 08:00:00', action: '下发巡检任务', operator: MINI_CURRENT_USER },
      { time: '2026-05-18 08:30:00', action: '开始执行', operator: MINI_CURRENT_USER },
    ],
  },
]

let handledRecords: MiniHandledRecord[] = []
const listeners = new Set<() => void>()
const handledListeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

function notifyHandled() {
  handledListeners.forEach((fn) => fn())
}

export function subscribeMiniOrders(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function subscribeHandledRecords(listener: () => void) {
  handledListeners.add(listener)
  return () => {
    handledListeners.delete(listener)
  }
}

export function getLocalMiniOrders() {
  return localOrders
}

export function getHandledRecords() {
  return handledRecords
}

export function addHandledRecord(record: Omit<MiniHandledRecord, 'id'>) {
  handledRecords = [
    {
      ...record,
      id: `HR-${Date.now()}`,
    },
    ...handledRecords,
  ]
  notifyHandled()
}

export function facilityToMiniOrder(item: FacilityOrderItem): MiniWorkOrder {
  const device = item.alarmDevice
  const view = resolveFacilityStatusView(item)
  const arrivalTime = getFacilityArrivalTime(item)
  return {
    id: item.id,
    facilityId: item.id,
    type: 'facility',
    title: `${device} - ${item.desc}`,
    status: String(item.miniStatus) === '处理中' ? '待完成' : String(item.miniStatus),
    createTime: item.alarmTime,
    initiator: item.initiator ?? '系统',
    receiver: item.receiver,
    repairStarted: !!item.repairStarted,
    description:
      item.damageNote
        ? `损坏描述：${item.damageNote}`
        : item.repairNote
          ? `维修描述：${item.repairNote}`
          : item.falseAlarmNote
            ? `误报说明：${item.falseAlarmNote}`
            : undefined,
    extra: {
      工单编号: item.id,
      告警设备: device,
      安装位置: item.installLocation,
      告警等级: String(item.level),
      告警描述: String(item.desc),
      告警时间: item.alarmTime,
      来源: item.source,
      ...(item.falseAlarmNote ? { 误报说明: item.falseAlarmNote } : {}),
      ...(item.repairNote ? { 维修描述: item.repairNote } : {}),
      ...(item.damageNote ? { 损坏描述: item.damageNote } : {}),
      ...(item.dispatchGroup ? { 派单工作组: item.dispatchGroup } : {}),
      ...(item.dispatchNote ? { 派单说明: item.dispatchNote } : {}),
      ...(item.onSiteInfo?.faultReason ? { 故障原因: item.onSiteInfo.faultReason } : {}),
      ...(arrivalTime ? { 到达现场时间: arrivalTime } : {}),
      ...(view.label !== '—'
        ? {
            时效状态: view.label,
            时效颜色: facilitySlaColorHex(view.color),
            中台工单状态: view.workOrderStatus,
            中台处理状态: view.processStatus,
          }
        : {}),
    },
    flowRecords: (item.flowRecords ?? []) as MiniFlowRecord[],
  }
}

export function handledToMiniOrder(record: MiniHandledRecord): MiniWorkOrder {
  return {
    id: record.id,
    facilityId: record.orderId,
    type: record.type,
    title: record.title,
    status: record.status,
    createTime: record.time,
    initiator: record.operator,
    receiver: record.operator,
    description: record.detail,
    extra: { 操作类型: record.action },
    flowRecords: [{ time: record.time, action: record.action, operator: record.operator, detail: record.detail }],
    archiveOnly: true,
  }
}

export function isFacilityInPublicPool(order: MiniWorkOrder) {
  return order.type === 'facility' && FACILITY_POOL_STATUSES.includes(order.status as MiniFacilityStatus)
}

export function getAllMiniOrders(facilityOrders: FacilityOrderItem[]): MiniWorkOrder[] {
  const facilityMini = facilityOrders.map(facilityToMiniOrder)
  const facilityIds = new Set(facilityMini.map((o) => o.id))
  const locals = localOrders.filter((o) => o.type !== 'facility' || !facilityIds.has(o.id))
  return [...facilityMini, ...locals]
}

export function isVisibleInWorkOrderList(order: MiniWorkOrder) {
  if (order.status === MINI_CANCELLED_STATUS) return false
  if (order.type !== 'facility') return true
  if (isFacilityInPublicPool(order)) return true
  if (order.status === '待完成' && order.receiver === MINI_CURRENT_USER) return true
  if (order.status === '已完成') return true
  return false
}

export function getFacilityListOrders(facilityOrders: FacilityOrderItem[]): MiniWorkOrder[] {
  return facilityOrders.map(facilityToMiniOrder).filter(isVisibleInWorkOrderList)
}

export function getWorkOrderListByType(orders: MiniWorkOrder[], type: MiniWorkOrderType): MiniWorkOrder[] {
  return orders.filter((o) => o.type === type && isVisibleInWorkOrderList(o))
}

export function getMiniOrderById(id: string, facilityOrders: FacilityOrderItem[]): MiniWorkOrder | undefined {
  const handled = handledRecords.find((r) => r.id === id)
  if (handled) return handledToMiniOrder(handled)
  return getAllMiniOrders(facilityOrders).find((o) => o.id === id)
}

export function countByType(orders: MiniWorkOrder[], facilityOrders: FacilityOrderItem[]) {
  const pool = getFacilityListOrders(facilityOrders)
  return {
    repair: orders.filter(
      (o) => o.type === 'repair' && !['已完成', '已关单', '已取消'].includes(o.status),
    ).length,
    facility: pool.length,
    maintenance: orders.filter((o) => o.type === 'maintenance' && o.status !== '已完成').length,
    inspection: orders.filter((o) => o.type === 'inspection' && o.status !== '已完成').length,
    my: orders.filter(
      (o) =>
        o.initiator === MINI_CURRENT_USER ||
        o.receiver === MINI_CURRENT_USER ||
        (o.type === 'facility' &&
          o.receiver === MINI_CURRENT_USER &&
          o.status === '待完成'),
    ).length,
  }
}
