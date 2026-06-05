import { MINI_CURRENT_USER } from '../store/miniProgramUser'
import { FACILITY_ORDER_STATUS, type FacilityFlowRecord, type FacilityOrderItem } from '../store/alarmSync'

export type MiniWorkOrderType = 'repair' | 'facility' | 'maintenance' | 'inspection'

export interface MiniFlowRecord {
  time: string
  action: string
  operator: string
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
  /** 设施工单关联中台 ID */
  facilityId?: string
}

export const MINI_TYPE_LABELS: Record<MiniWorkOrderType, string> = {
  repair: '报修',
  facility: '设施工单',
  maintenance: '维保',
  inspection: '巡检',
}

export const MINI_TYPE_STATUS: Record<MiniWorkOrderType, string[]> = {
  repair: ['待派单', '待审核', '待接单', '报修待完成', '待签字', '待关单', '已关单', '已取消'],
  facility: [...FACILITY_ORDER_STATUS],
  maintenance: ['待派单', '待审核', '待接单', '处理中', '已完成', '已取消'],
  inspection: ['待执行', '执行中', '已完成', '已取消'],
}

export const MINI_LIST_TABS: MiniWorkOrderType[] = ['repair', 'facility', 'maintenance', 'inspection']

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

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function subscribeMiniOrders(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getLocalMiniOrders() {
  return localOrders
}

export function facilityToMiniOrder(item: FacilityOrderItem): MiniWorkOrder {
  return {
    id: item.id,
    facilityId: item.id,
    type: 'facility',
    title: `${item.alarmDevices.join('、')} - ${item.desc}`,
    status: item.status,
    createTime: item.alarmTime,
    initiator: item.initiator ?? '系统',
    receiver: item.receiver,
    description: `告警等级：${item.level}；来源：${item.source}`,
    extra: {
      问题类型: '设施工单',
      问题描述: `${item.alarmDevices.join('、')} - ${item.desc}`,
      告警设备: item.alarmDevices.join('、'),
      告警描述: String(item.desc),
      告警等级: String(item.level),
    },
    flowRecords: (item.flowRecords ?? []) as MiniFlowRecord[],
  }
}

export function getAllMiniOrders(facilityOrders: FacilityOrderItem[]): MiniWorkOrder[] {
  const facilityMini = facilityOrders.map(facilityToMiniOrder)
  const facilityIds = new Set(facilityMini.map((o) => o.id))
  const locals = localOrders.filter((o) => o.type !== 'facility' || !facilityIds.has(o.id))
  return [...facilityMini, ...locals]
}

export function getMiniOrderById(id: string, facilityOrders: FacilityOrderItem[]): MiniWorkOrder | undefined {
  return getAllMiniOrders(facilityOrders).find((o) => o.id === id)
}

export function countByType(orders: MiniWorkOrder[]) {
  return {
    repair: orders.filter(
      (o) => o.type === 'repair' && !['已完成', '已关单', '已取消'].includes(o.status),
    ).length,
    facility: orders.filter((o) => o.type === 'facility' && o.status === '待处理').length,
    maintenance: orders.filter((o) => o.type === 'maintenance' && o.status !== '已完成').length,
    inspection: orders.filter((o) => o.type === 'inspection' && o.status !== '已完成').length,
    my: orders.filter(
      (o) =>
        o.initiator === MINI_CURRENT_USER ||
        o.receiver === MINI_CURRENT_USER ||
        (o.type === 'facility' && o.receiver === MINI_CURRENT_USER),
    ).length,
  }
}
