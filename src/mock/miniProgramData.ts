import { MINI_CURRENT_USER } from '../store/miniProgramUser'
import { normalizeCommunity } from '../constants/communities'
import {
  MINI_FACILITY_STATUS,
  type FacilityFlowRecord,
  facilitySlaColorHex,
  getFacilityArrivalTime,
  resolveFacilityStatusView,
  type FacilityOrderItem,
  type MiniFacilityStatus,
} from '../store/alarmSync'

export type MiniWorkOrderType =
  | 'safety'
  | 'construction'
  | 'rectification'
  | 'newInspection'
  | 'repair'
  | 'facility'
  | 'maintenance'
  | 'inspection'

export type MiniInspectionCategory = '消防' | '电气' | '施工作业'

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
  /** 小区名称 */
  community?: string
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
  safety: '安全检查',
  construction: '施工检查',
  rectification: '整改工单',
  newInspection: '新增检查',
  repair: '报修',
  facility: '设施',
  maintenance: '维保',
  inspection: '巡检',
}

/** 小程序检查类工单列表 Tab */
export const MINI_LIST_TABS: MiniWorkOrderType[] = ['safety', 'construction', 'rectification', 'newInspection']

/** 小程序经典工单列表 Tab（报修/设施/维保/巡检） */
export const MINI_CLASSIC_TABS: MiniWorkOrderType[] = ['repair', 'facility', 'maintenance', 'inspection']

/** 设施工单全部展示状态（含已取消，用于详情等） */
export const MINI_FACILITY_LIST_STATUS = ['待接单', '待完成', '已完成', '已取消', '损坏'] as const

export const MINI_INSPECTION_STATUSES = ['待处理', '处理中', '待复查', '已完成', '已取消'] as const

export const MINI_TYPE_STATUS: Record<MiniWorkOrderType, string[]> = {
  safety: [...MINI_INSPECTION_STATUSES],
  construction: [...MINI_INSPECTION_STATUSES],
  rectification: [...MINI_INSPECTION_STATUSES],
  newInspection: [...MINI_INSPECTION_STATUSES],
  repair: ['待派单', '待审核', '待接单', '报修待完成', '待签字', '待关单', '已关单', '已取消'],
  facility: [...MINI_FACILITY_LIST_STATUS],
  maintenance: ['待派单', '待审核', '待接单', '处理中', '已完成', '已取消'],
  inspection: ['待执行', '执行中', '已完成', '已取消'],
}

/** 工单列表筛选状态（不含已取消；已取消仅在「我的已办」可见） */
export const MINI_LIST_FILTER_STATUS: Record<MiniWorkOrderType, string[]> = {
  safety: MINI_TYPE_STATUS.safety.filter((s) => s !== '已取消'),
  construction: MINI_TYPE_STATUS.construction.filter((s) => s !== '已取消'),
  rectification: MINI_TYPE_STATUS.rectification.filter((s) => s !== '已取消'),
  newInspection: MINI_TYPE_STATUS.newInspection.filter((s) => s !== '已取消'),
  repair: MINI_TYPE_STATUS.repair.filter((s) => s !== '已取消'),
  facility: MINI_FACILITY_LIST_STATUS.filter((s) => s !== '已取消'),
  maintenance: MINI_TYPE_STATUS.maintenance.filter((s) => s !== '已取消'),
  inspection: MINI_TYPE_STATUS.inspection.filter((s) => s !== '已取消'),
}

export const MINI_DONE_STATUSES = ['已完成', '已处理', '已关单'] as const
export const MINI_CANCELLED_STATUS = '已取消'

/** 工单池可见状态：未接单前全员可见 + 损坏可再次接单 */
export const FACILITY_POOL_STATUSES: MiniFacilityStatus[] = ['待接单', '损坏']

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
  { id: '1', title: '安全检查工单「电梯闭灯隐患」已派单', time: '2026-06-01 11:20' },
  { id: '2', title: '施工检查工单「脚手架防护」待复查', time: '2026-05-31 16:40' },
  { id: '3', title: '整改工单 ZG20260530001 处理完成', time: '2026-05-30 09:15' },
]

function buildInspectionOrder(
  id: string,
  type: Exclude<MiniWorkOrderType, 'facility'>,
  category: MiniInspectionCategory,
  hazard: string,
  desc: string,
  status: string,
  createTime: string,
  community: string,
  initiator: string,
  receiver: string,
  point?: { pointId: string; location: string },
): MiniWorkOrder {
  return {
    id,
    type,
    title: hazard,
    status,
    createTime,
    initiator,
    receiver,
    community,
    location: point?.location,
    extra: {
      隐患类别: category,
      隐患问题: hazard,
      问题描述: desc,
      ...(point ? { 点位编号: point.pointId, 空间位置: point.location } : {}),
    },
    flowRecords: [{ time: createTime, action: `创建${MINI_TYPE_LABELS[type]}`, operator: initiator }],
  }
}

let localOrders: MiniWorkOrder[] = [
  buildInspectionOrder(
    'AQ20250907001',
    'safety',
    '消防',
    '电梯内闭灯无光源，易造成恐慌',
    '灯不亮',
    '待处理',
    '2025-09-07 15:13:11',
    '双翼大厦',
    '王主管',
    MINI_CURRENT_USER,
    { pointId: 'PT202604270077', location: '1号楼/2F/办公区' },
  ),
  buildInspectionOrder(
    'AQ20250907002',
    'safety',
    '消防',
    '灭火器、墙挂式消火栓',
    '部件有腐蚀',
    '处理中',
    '2025-09-07 14:20:00',
    '双翼大厦',
    '李四',
    MINI_CURRENT_USER,
    { pointId: 'PT202605130003', location: '1号楼/B2F/消防泵房' },
  ),
  buildInspectionOrder(
    'AQ20250906003',
    'safety',
    '电气',
    '配电间电缆桥架接地缺失',
    '需补做接地',
    '待处理',
    '2025-09-06 10:05:22',
    '天山路473号',
    '调度员',
    '-',
    { pointId: 'PT202605140002', location: '1号楼/2F/配电间' },
  ),
  buildInspectionOrder(
    'AQ20250905004',
    'safety',
    '施工作业',
    '临时用电线路未架空',
    '线路拖地存在隐患',
    '待复查',
    '2025-09-05 16:40:18',
    '中期大厦',
    MINI_CURRENT_USER,
    MINI_CURRENT_USER,
    { pointId: 'PT202604280001', location: '1号楼/29F/电梯机房' },
  ),
  buildInspectionOrder(
    'AQ20250830005',
    'safety',
    '消防',
    '安全出口指示标志损坏',
    '标志灯不亮',
    '已完成',
    '2025-08-30 09:12:00',
    '双翼大厦',
    MINI_CURRENT_USER,
    MINI_CURRENT_USER,
    { pointId: 'PT202605140001', location: '1号楼/1F/生活水泵房' },
  ),
  buildInspectionOrder(
    'AQ20250907003',
    'safety',
    '消防',
    '消防泵房阀门渗漏',
    '阀门接口渗水需紧固',
    '待处理',
    '2025-09-07 10:20:00',
    '双翼大厦',
    '王主管',
    '-',
    { pointId: 'PT202605130003', location: '1号楼/B2F/消防泵房' },
  ),
  buildInspectionOrder(
    'SG20250907001',
    'construction',
    '施工作业',
    '高处作业未系安全带',
    '3层外墙施工区域',
    '待处理',
    '2025-09-07 11:30:00',
    '双翼大厦',
    '安全员',
    MINI_CURRENT_USER,
  ),
  buildInspectionOrder(
    'SG20250906002',
    'construction',
    '施工作业',
    '脚手架防护网破损',
    '东侧脚手架第2层',
    '处理中',
    '2025-09-06 08:45:00',
    '森林湾大厦',
    '王主管',
    MINI_CURRENT_USER,
  ),
  buildInspectionOrder(
    'SG20250901003',
    'construction',
    '电气',
    '施工现场临时配电箱无锁',
    '箱门未上锁',
    '待处理',
    '2025-09-01 14:00:00',
    '天山路473号',
    '李四',
    '-',
  ),
  buildInspectionOrder(
    'ZG20250907001',
    'rectification',
    '消防',
    '消防通道堆放杂物',
    'B栋2层通道',
    '待处理',
    '2025-09-07 09:20:00',
    '双翼大厦',
    '检查员',
    MINI_CURRENT_USER,
  ),
  buildInspectionOrder(
    'ZG20250905002',
    'rectification',
    '电气',
    '弱电机房私拉乱接',
    '机房内临时接线',
    '处理中',
    '2025-09-05 13:15:00',
    '中期大厦',
    MINI_CURRENT_USER,
    MINI_CURRENT_USER,
  ),
  buildInspectionOrder(
    'ZG20250828003',
    'rectification',
    '施工作业',
    '动火作业未办理审批',
    '地下车库焊接作业',
    '待复查',
    '2025-08-28 17:00:00',
    '森林湾大厦',
    '安全员',
    MINI_CURRENT_USER,
  ),
  buildInspectionOrder(
    'XZ20250907001',
    'newInspection',
    '消防',
    '电梯内闭灯无光源，易造成恐慌',
    '灯不亮',
    '待处理',
    '2025-09-07 15:13:11',
    '双翼大厦',
    MINI_CURRENT_USER,
    '-',
  ),
  buildInspectionOrder(
    'XZ20250907002',
    'newInspection',
    '消防',
    '灭火器、墙挂式消火栓',
    '部件有腐蚀',
    '待处理',
    '2025-09-07 14:55:00',
    '森林湾大厦',
    MINI_CURRENT_USER,
    '-',
  ),
  buildInspectionOrder(
    'XZ20250906003',
    'newInspection',
    '施工作业',
    '临边防护栏杆缺失',
    '屋面边缘区域',
    '待处理',
    '2025-09-06 11:20:00',
    '天山路473号',
    '王主管',
    '-',
  ),
  buildInspectionOrder(
    'XZ20250904004',
    'newInspection',
    '电气',
    '配电柜警示标识缺失',
    '1号配电柜',
    '处理中',
    '2025-09-04 10:30:00',
    '中期大厦',
    MINI_CURRENT_USER,
    MINI_CURRENT_USER,
  ),
  {
    id: 'BX20260604001',
    type: 'repair',
    title: '双翼大厦实验室天花板漏水',
    status: '待关单',
    createTime: '2026-06-04 16:48:06',
    initiator: '李四',
    receiver: MINI_CURRENT_USER,
    community: '双翼大厦',
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
    community: '森林湾大厦',
    location: '森林湾大厦3层',
    description: '消防通道应急指示灯不亮',
    extra: { 问题类型: '日常报修', 问题描述: '消防通道应急指示灯不亮' },
    flowRecords: [{ time: '2026-06-04 15:30:00', action: '提交报修工单', operator: '王主管' }],
  },
  {
    id: 'WB20260525001',
    type: 'maintenance',
    title: '消防主机季度维保',
    status: '待派单',
    createTime: '2026-05-25 09:00:00',
    initiator: '王主管',
    receiver: '-',
    community: '双翼大厦',
    location: '双翼大厦消防控制室',
    extra: { 维保类型: '季度维保' },
    flowRecords: [{ time: '2026-05-25 09:00:00', action: '创建维保工单', operator: '王主管' }],
  },
  {
    id: 'XJ20260521001',
    type: 'inspection',
    title: '办公楼消防通道巡检',
    status: '待执行',
    createTime: '2026-05-21 10:07:00',
    initiator: '调度员',
    receiver: MINI_CURRENT_USER,
    community: '双翼大厦',
    extra: { 巡检类型: '办公楼', 巡检计划: 'NFC、二维码、手动巡检路线' },
    flowRecords: [{ time: '2026-05-21 10:07:00', action: '下发巡检任务', operator: '调度员' }],
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
  const community = normalizeCommunity(item.community, item.installLocation)
  return {
    id: item.id,
    facilityId: item.id,
    type: 'facility',
    title: `${device} - ${item.desc}`,
    status: String(item.miniStatus) === '处理中' ? '待完成' : String(item.miniStatus),
    createTime: item.alarmTime,
    initiator: item.initiator ?? '系统',
    receiver: item.receiver,
    community,
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
      小区名称: community,
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

/** 读取工单小区名称（设施工单优先 extra，其他类型读 community 或 location 解析） */
export function getOrderCommunity(order: MiniWorkOrder): string {
  if (order.community?.trim()) return order.community.trim()
  if (order.extra?.['小区名称']?.trim()) return order.extra['小区名称'].trim()
  if (order.location?.trim()) {
    const fromLocation = normalizeCommunity(undefined, order.location)
    if (fromLocation !== '—') return fromLocation
  }
  return '—'
}

export function getMiniOrderById(id: string, facilityOrders: FacilityOrderItem[]): MiniWorkOrder | undefined {
  const handled = handledRecords.find((r) => r.id === id)
  if (handled) return handledToMiniOrder(handled)
  return getAllMiniOrders(facilityOrders).find((o) => o.id === id)
}

export function isInspectionWorkOrderType(type: MiniWorkOrderType): boolean {
  return (MINI_LIST_TABS as MiniWorkOrderType[]).includes(type)
}

export function isClassicWorkOrderType(type: MiniWorkOrderType): boolean {
  return (MINI_CLASSIC_TABS as MiniWorkOrderType[]).includes(type)
}

export function getListTabsForType(type: MiniWorkOrderType): MiniWorkOrderType[] {
  return isClassicWorkOrderType(type) ? MINI_CLASSIC_TABS : MINI_LIST_TABS
}

export function getMiniOrderPointId(order: MiniWorkOrder): string | undefined {
  return order.extra?.['点位编号']
}

export function getSafetyOrdersByPointId(pointId: string): MiniWorkOrder[] {
  return localOrders.filter(
    (o) => o.type === 'safety' && o.extra?.['点位编号'] === pointId && o.status !== MINI_CANCELLED_STATUS,
  )
}

export function updateMiniOrder(id: string, patch: Partial<MiniWorkOrder> & { flowRecord?: MiniFlowRecord }) {
  localOrders = localOrders.map((o) => {
    if (o.id !== id) return o
    const next: MiniWorkOrder = { ...o, ...patch, extra: patch.extra ? { ...o.extra, ...patch.extra } : o.extra }
    if (patch.flowRecord) {
      next.flowRecords = [...o.flowRecords, patch.flowRecord]
    }
    return next
  })
  notify()
}

function nowText() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 扫码后开始处理安全检查工单 */
export function startSafetyOrderProcessing(id: string) {
  const order = localOrders.find((o) => o.id === id)
  if (!order || order.type !== 'safety') return
  const time = nowText()
  updateMiniOrder(id, {
    status: '处理中',
    receiver: MINI_CURRENT_USER,
    flowRecord: { time, action: '扫码开始处理', operator: MINI_CURRENT_USER },
  })
}

export function submitSafetyOrderProcessing(id: string, note: string, complete: boolean) {
  const time = nowText()
  updateMiniOrder(id, {
    status: complete ? '待复查' : '处理中',
    extra: { 处理说明: note },
    flowRecord: {
      time,
      action: complete ? '提交处理结果' : '暂存处理进度',
      operator: MINI_CURRENT_USER,
      detail: note,
    },
  })
}

export function countByType(orders: MiniWorkOrder[], facilityOrders: FacilityOrderItem[]) {
  const countInspectionActive = (type: MiniWorkOrderType) =>
    orders.filter(
      (o) =>
        o.type === type &&
        !o.archiveOnly &&
        o.status !== '已完成' &&
        o.status !== MINI_CANCELLED_STATUS,
    ).length

  const pool = getFacilityListOrders(facilityOrders)

  return {
    safety: countInspectionActive('safety'),
    construction: countInspectionActive('construction'),
    rectification: countInspectionActive('rectification'),
    newInspection: countInspectionActive('newInspection'),
    repair: orders.filter(
      (o) => o.type === 'repair' && !['已完成', '已关单', '已取消'].includes(o.status),
    ).length,
    facility: pool.length,
    maintenance: orders.filter((o) => o.type === 'maintenance' && o.status !== '已完成' && o.status !== MINI_CANCELLED_STATUS).length,
    inspection: orders.filter((o) => o.type === 'inspection' && o.status !== '已完成' && o.status !== MINI_CANCELLED_STATUS).length,
    my: orders.filter(
      (o) =>
        !o.archiveOnly &&
        (o.initiator === MINI_CURRENT_USER ||
          o.receiver === MINI_CURRENT_USER ||
          (o.type === 'facility' &&
            o.receiver === MINI_CURRENT_USER &&
            o.status === '待完成')),
    ).length,
  }
}
