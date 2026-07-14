import type { AlarmListItem } from '../mock/alarmData'
import {
  ALARM_DEVICE_TO_SETTINGS_SUB,
  DEFAULT_TIMEOUT_MINUTES,
  type AlarmDescType,
  type AlarmLevel,
} from '../pages/alarm/constants'
import {
  DEFAULT_WORK_ORDER_DELAY_MINUTES,
  type AlarmDeviceRule2,
} from '../mock/alarmSettings2Data'
import { getAlarmDeviceRules } from './alarmSettingsStore'
import { canEditFacilityWorkOrderSettings } from './platformUser'

function parseAlarmTimeMs(time: string) {
  return new Date(time.replace(/-/g, '/')).getTime()
}

/** 告警已产生时长（分钟） */
export function getAlarmElapsedMinutes(time: string, now = Date.now()) {
  const diff = now - parseAlarmTimeMs(time)
  return Math.max(0, Math.floor(diff / 60000))
}

function findRuleByDeviceAndLevel(
  device: string,
  level: AlarmListItem['level'],
  rules: AlarmDeviceRule2[],
) {
  const mapped = ALARM_DEVICE_TO_SETTINGS_SUB[device]
  if (!mapped) return undefined
  return rules.find(
    (r) =>
      r.rootCategory === mapped.rootCategory &&
      r.subCategory === mapped.subCategory &&
      r.level === level,
  )
}

/** 按告警设备与等级匹配告警设置规则（不论是否生成工单） */
export function findMatchingAlarmRule(
  alarm: Pick<AlarmListItem, 'level' | 'alarmDevice'>,
  rules: AlarmDeviceRule2[] = getAlarmDeviceRules(),
): AlarmDeviceRule2 | undefined {
  if (!alarm.alarmDevice) return undefined
  return findRuleByDeviceAndLevel(alarm.alarmDevice, alarm.level, rules)
}

/** 匹配已开启「是否生成工单」的规则 */
export function findWorkOrderGenerationRule(
  alarm: Pick<AlarmListItem, 'level' | 'alarmDevice'>,
  rules: AlarmDeviceRule2[] = getAlarmDeviceRules(),
): AlarmDeviceRule2 | undefined {
  const rule = findMatchingAlarmRule(alarm, rules)
  return rule?.generateWorkOrder ? rule : undefined
}

export function getFacilityWorkOrderDelayMinutes(
  alarm: Pick<AlarmListItem, 'level' | 'alarmDevice'>,
  rules: AlarmDeviceRule2[] = getAlarmDeviceRules(),
) {
  const rule = findWorkOrderGenerationRule(alarm, rules)
  if (!rule) return undefined
  return rule.workOrderDelayMinutes ?? DEFAULT_WORK_ORDER_DELAY_MINUTES
}

/** 距工单生成时机还剩多少分钟（未开启生成或无规则时返回 undefined） */
export function getAlarmWorkOrderSyncRemainMinutes(
  alarm: Pick<AlarmListItem, 'level' | 'alarmDevice' | 'time'>,
) {
  const delay = getFacilityWorkOrderDelayMinutes(alarm)
  if (delay === undefined) return undefined
  const elapsed = getAlarmElapsedMinutes(alarm.time)
  return Math.max(0, delay - elapsed)
}

/**
 * 是否满足自动生成设施工单：
 * 1. 告警状态为待处理
 * 2. 告警设备在告警设置中配置「是否生成工单」= 是
 * 3. 告警产生时长已达到该设备配置的工单生成时机
 */
export function shouldSyncAlarmToFacility(alarm: AlarmListItem) {
  if (alarm.status !== '待处理') return false
  const rule = findWorkOrderGenerationRule(alarm)
  if (!rule) return false
  const delay = rule.workOrderDelayMinutes ?? DEFAULT_WORK_ORDER_DELAY_MINUTES
  return getAlarmElapsedMinutes(alarm.time) >= delay
}

/** @deprecated 使用 shouldSyncAlarmToFacility */
export function isAlarmEligibleForFacilitySync(alarm: Pick<AlarmListItem, 'level' | 'alarmDevice'>) {
  return !!findWorkOrderGenerationRule(alarm)
}

/** @deprecated 使用 shouldSyncAlarmToFacility */
export function isAlarmReadyForFacilitySync(
  alarm: Pick<AlarmListItem, 'level' | 'alarmDevice' | 'time' | 'status'>,
) {
  if (alarm.status !== '待处理') return false
  const rule = findWorkOrderGenerationRule(alarm)
  if (!rule) return false
  const delay = rule.workOrderDelayMinutes ?? DEFAULT_WORK_ORDER_DELAY_MINUTES
  return getAlarmElapsedMinutes(alarm.time) >= delay
}

export function getFacilityOrderByAlarmId(alarmId: string) {
  return facilityOrders.find((o) => o.alarmId === alarmId)
}

/** 中台设施工单状态（业务流程，4 种） */
export const FACILITY_WORK_ORDER_STATUS = ['待处理', '处理中', '已处理', '损坏'] as const
export type FacilityWorkOrderStatus = (typeof FACILITY_WORK_ORDER_STATUS)[number]

/** 中台设施工单处理状态（时效/处置跟踪，6 种） */
export const FACILITY_PROCESS_STATUS = [
  '待处理',
  '超时待处理',
  '处理中',
  '逾期处理中',
  '损坏待处理',
  '已处理',
] as const
export type FacilityProcessStatus = (typeof FACILITY_PROCESS_STATUS)[number]

/** 告警自动解除时，关联设施工单强制关单的维修描述 */
export const AUTO_RESOLVE_REPAIR_NOTE = '系统自动解除报警'

/**
 * @deprecated 使用 FACILITY_WORK_ORDER_STATUS + FACILITY_PROCESS_STATUS
 * 工单状态与处理状态对应关系见 resolveFacilityStatusView
 */
export const FACILITY_ORDER_STATUS = [
  ...FACILITY_WORK_ORDER_STATUS,
  '超时待处理',
  '逾期处理中',
] as const
export type FacilityOrderStatus = FacilityWorkOrderStatus | '超时待处理' | '逾期处理中'

/** 中台存储的基础状态（由小程序状态映射，不含 SLA 衍生状态） */
export type FacilityOrderBaseStatus = '待处理' | '处理中' | '已处理' | '损坏'

/** 小程序设施工单展示状态 */
export const MINI_FACILITY_STATUS = ['待接单', '待完成', '已完成', '已取消', '损坏'] as const
export type MiniFacilityStatus = (typeof MINI_FACILITY_STATUS)[number]

export interface FacilityFlowField {
  label: string
  value: string
}

export interface FacilityFlowRecord {
  time: string
  action: string
  operator: string
  detail?: string
  fields?: FacilityFlowField[]
  images?: string[]
}

/** 告警事故判断 */
export type IncidentJudgment = '误报' | '维修' | '损坏'

export interface FacilityOnSiteInfo {
  arrivalTime: string
  faultReason?: string
}

export interface FacilityRepairDraft {
  arrivalTime: string
  faultReason?: string
  judgment: IncidentJudgment
  note: string
  photos: string[]
  photoNames: string[]
}

export interface FacilityOrderItem {
  id: string
  /** 告警设备（一条工单对应一个设备） */
  alarmDevice: string
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
  /** 小程序提交误报时填写的误报说明 */
  falseAlarmNote?: string
  /** 小程序提交维修时填写的维修描述 */
  repairNote?: string
  /** 小程序提交损坏时填写的损坏描述 */
  damageNote?: string
  initiator?: string
  flowRecords?: FacilityFlowRecord[]
  dispatchGroup?: string
  dispatchNote?: string
  /** 维修处理暂存草稿 */
  repairDraft?: FacilityRepairDraft
  /** 是否已开始维修（开始后不可取消接单） */
  repairStarted?: boolean
  /** 维修中页面填写的到场信息 */
  onSiteInfo?: FacilityOnSiteInfo
  /** 接单时间（用于完成逾期计算） */
  acceptedAt?: string
}

/** 工单流转记录（与小程序 flowRecords 同源，store 更新后两端同步） */
export function getFacilityFlowRecords(order: FacilityOrderItem): FacilityFlowRecord[] {
  return order.flowRecords ?? []
}

function nowStr() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function appendMergedFlow(
  records: FacilityFlowRecord[] | undefined,
  action: string,
  operator: string,
  fields: FacilityFlowField[],
  images?: string[],
  time?: string,
): FacilityFlowRecord[] {
  const t = time ?? nowStr()
  const detail = fields.map((f) => `${f.label}：${f.value}`).join('；')
  const normalizedImages = images?.filter(Boolean)
  return [
    ...(records ?? []),
    {
      time: t,
      action,
      operator,
      detail,
      fields,
      ...(normalizedImages?.length ? { images: normalizedImages } : {}),
    },
  ]
}

function stripDraftFlowRecords(records: FacilityFlowRecord[] | undefined) {
  return (records ?? []).filter((record) => record.action !== '完成工单暂存')
}

export type FacilitySubmitNoteLabel = '误报说明' | '维修描述' | '损坏描述'

/** 闭环提交类流转节点（误报 / 维修 / 损坏） */
export const FACILITY_SUBMIT_FLOW_ACTIONS = ['提交维修', '提交误报', '提交损坏'] as const

/** 从闭环提交流转记录中读取指定字段（与已完成工单展示逻辑一致） */
export function getFacilityFlowFieldValue(
  order: FacilityOrderItem,
  label: string,
  actions: readonly string[] = FACILITY_SUBMIT_FLOW_ACTIONS,
): string | undefined {
  const records = order.flowRecords
  if (!records?.length) return undefined
  for (let i = records.length - 1; i >= 0; i--) {
    const record = records[i]
    if (!actions.includes(record.action)) continue
    const field = record.fields?.find((f) => f.label === label)
    if (field?.value?.trim()) return field.value.trim()
  }
  return undefined
}

/** 到达现场时间：优先现场暂存，否则从闭环提交流转记录解析 */
export function getFacilityArrivalTime(order: FacilityOrderItem): string | undefined {
  if (order.onSiteInfo?.arrivalTime?.trim()) {
    return formatArrivalTime(order.onSiteInfo.arrivalTime)
  }
  return getFacilityFlowFieldValue(order, '到达现场时间')
}

/** 获取小程序提交的描述（优先读持久化字段，兼容从流转记录解析） */
export function getFacilitySubmitNote(
  order: FacilityOrderItem,
  label: FacilitySubmitNoteLabel,
): string | undefined {
  const direct =
    label === '误报说明'
      ? order.falseAlarmNote
      : label === '维修描述'
        ? order.repairNote
        : order.damageNote
  if (direct?.trim()) return direct.trim()
  return getFacilityFlowFieldValue(order, label)
}

export function platformStatusFromMini(mini: MiniFacilityStatus | string): FacilityOrderBaseStatus {
  if (mini === '待接单' || mini === '已取消') return '待处理'
  if (mini === '处理中' || mini === '待完成') return '处理中'
  if (mini === '已完成') return '已处理'
  if (mini === '损坏') return '损坏'
  return '待处理'
}

function legacyMiniStatus(status: string): MiniFacilityStatus {
  if (status === '待处理') return '待接单'
  if (status === '待派单') return '待接单'
  if (status === '已处理') return '已完成'
  if (status === '处理中') return '待完成'
  if (MINI_FACILITY_STATUS.includes(status as MiniFacilityStatus)) return status as MiniFacilityStatus
  return '待接单'
}

/** 小程序维修中阶段（接单后至提交前，统一为待完成） */
function isFacilityRepairingStatus(mini: string) {
  return mini === '待完成' || mini === '处理中'
}

function normalizeOrder(o: FacilityOrderItem): FacilityOrderItem {
  const miniStatus = o.miniStatus ? legacyMiniStatus(String(o.miniStatus)) : legacyMiniStatus(String(o.status))
  return { ...o, miniStatus, status: platformStatusFromMini(miniStatus) }
}

/** 原型演示用维修/损坏现场图片（小程序上传后写入 flowRecords.images，中台同步展示） */
const MOCK_FLOW_PHOTO_A =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect fill="#e6f4ff" width="240" height="180"/><text x="50%" y="45%" text-anchor="middle" fill="#1677ff" font-size="16" font-family="sans-serif">维修现场图1</text></svg>',
  )
const MOCK_FLOW_PHOTO_B =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect fill="#f6ffed" width="240" height="180"/><text x="50%" y="45%" text-anchor="middle" fill="#52c41a" font-size="16" font-family="sans-serif">维修现场图2</text></svg>',
  )
const MOCK_DAMAGE_PHOTO =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect fill="#fff2e8" width="240" height="180"/><text x="50%" y="45%" text-anchor="middle" fill="#fa541c" font-size="16" font-family="sans-serif">损坏现场图</text></svg>',
  )

const initialFacility: FacilityOrderItem[] = [
  {
    id: 'SG20260601001',
    alarmDevice: '消防水泵',
    installLocation: '双翼大厦地下一层消防泵房',
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-07-05 11:20:05',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601003',
    initiator: '系统',
    flowRecords: [
      {
        time: '2026-07-05 11:20:05',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603006',
    alarmDevice: '消防主机',
    installLocation: '双翼大厦消防控制室',
    level: '一级告警',
    desc: '火灾报警',
    alarmTime: '2026-07-06 08:12:33',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601001',
    initiator: '系统',
    flowRecords: [
      {
        time: '2026-07-06 08:12:33',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603007',
    alarmDevice: '烟感探测器',
    installLocation: '森林湾大厦3层消防通道',
    level: '四级告警',
    desc: '火灾报警',
    alarmTime: '2026-06-20 16:30:22',
    status: '处理中',
    miniStatus: '待完成',
    receiver: '张维修',
    acceptedAt: '2026-06-21 09:00:00',
    repairStarted: true,
    source: '告警同步',
    alarmId: 'AL20260601004',
    initiator: '系统',
    flowRecords: [
      {
        time: '2026-06-20 16:30:22',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
      {
        time: '2026-06-21 09:00:00',
        action: '维修人员接单',
        operator: '张维修',
        detail: '工单状态：待完成',
        fields: [{ label: '工单状态', value: '待完成' }],
      },
      {
        time: '2026-06-21 10:30:00',
        action: '开始维修',
        operator: '张维修',
        fields: [{ label: '维修状态', value: '维修进行中' }],
      },
    ],
  },
  {
    id: 'SG20260603008',
    alarmDevice: '电梯设备',
    installLocation: '双翼大厦B栋客梯机房',
    level: '二级告警',
    desc: '故障报警',
    alarmTime: '2026-06-18 22:15:40',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601005',
    initiator: '系统',
    flowRecords: [
      {
        time: '2026-06-18 22:15:40',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603009',
    alarmDevice: '防火门',
    installLocation: '中期大厦2层东侧安全出口',
    level: '二级告警',
    desc: '故障报警',
    alarmTime: '2026-07-05 09:20:00',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    flowRecords: [
      {
        time: '2026-07-05 09:00:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603010',
    alarmDevice: '温感探测器',
    installLocation: '森林湾大厦地下一层车库',
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-07-04 10:05:18',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    flowRecords: [
      {
        time: '2026-07-04 09:45:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603011',
    alarmDevice: '门禁系统',
    installLocation: '双翼大厦主入口门厅',
    level: '四级告警',
    desc: '故障报警',
    alarmTime: '2026-06-15 11:30:45',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    flowRecords: [
      {
        time: '2026-06-15 11:10:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603012',
    alarmDevice: '监控摄像头',
    installLocation: '中期大厦屋顶设备平台',
    level: '三级告警',
    desc: '故障报警',
    alarmTime: '2026-07-06 10:18:00',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    flowRecords: [
      {
        time: '2026-07-06 10:00:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603013',
    alarmDevice: '生活水泵',
    installLocation: '森林湾大厦地下二层生活泵房',
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-06-28 14:42:11',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    flowRecords: [
      {
        time: '2026-06-28 14:25:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603014',
    alarmDevice: '消防水泵',
    installLocation: '溧阳消防局训练基地泵房',
    level: '一级告警',
    desc: '设备超时',
    alarmTime: '2026-07-06 13:55:30',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    flowRecords: [
      {
        time: '2026-07-06 13:40:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260601002',
    alarmDevice: '配电柜',
    installLocation: '双翼大厦1层配电间',
    level: '二级告警',
    desc: '故障报警',
    alarmTime: '2026-07-05 09:45:11',
    status: '处理中',
    miniStatus: '待完成',
    receiver: '王运维',
    acceptedAt: '2026-07-05 10:00:00',
    repairStarted: true,
    source: '告警同步',
    alarmId: 'AL20260601002',
    initiator: '系统',
    flowRecords: [
      { time: '2026-07-05 09:45:11', action: '告警同步生成设施工单', operator: '系统', fields: [{ label: '工单状态', value: '待接单' }] },
      {
        time: '2026-07-05 10:00:00',
        action: '维修人员接单',
        operator: '王运维',
        detail: '工单状态：待完成',
        fields: [{ label: '工单状态', value: '待完成' }],
      },
      {
        time: '2026-07-05 10:30:00',
        action: '开始维修',
        operator: '王运维',
        fields: [{ label: '维修状态', value: '维修进行中' }],
      },
    ],
  },
  {
    id: 'SG20260528003',
    alarmDevice: '客梯-双翼大厦B栋',
    installLocation: '双翼大厦B栋客梯机房',
    level: '一级告警',
    desc: '火灾报警',
    alarmTime: '2026-05-28 16:02:18',
    status: '已处理',
    miniStatus: '已完成',
    receiver: '李维修',
    source: '告警同步',
    initiator: '系统',
    repairNote: '现场复测正常',
    flowRecords: [
      { time: '2026-05-28 16:02:18', action: '告警同步生成设施工单', operator: '系统', fields: [{ label: '工单状态', value: '待接单' }] },
      { time: '2026-05-28 16:30:00', action: '维修人员接单', operator: '李维修', fields: [{ label: '工单状态', value: '待完成' }] },
      {
        time: '2026-05-29 10:00:00',
        action: '提交维修',
        operator: '李维修',
        detail:
          '告警事故判断：维修；到达现场时间：2026-05-29 09:30:00；维修描述：现场复测正常；上传图片：共2张；工单状态：已完成',
        fields: [
          { label: '告警事故判断', value: '维修' },
          { label: '到达现场时间', value: '2026-05-29 09:30:00' },
          { label: '维修描述', value: '现场复测正常' },
          { label: '上传图片', value: '共2张' },
          { label: '工单状态', value: '已完成' },
        ],
        images: [MOCK_FLOW_PHOTO_A, MOCK_FLOW_PHOTO_B],
      },
    ],
  },
  {
    id: 'SG20260520004',
    alarmDevice: '喷淋泵',
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
      {
        time: '2026-05-20 08:30:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
      {
        time: '2026-05-20 09:00:00',
        action: '维修人员接单',
        operator: '张工',
        fields: [{ label: '工单状态', value: '待完成' }],
      },
      {
        time: '2026-05-21 14:00:00',
        action: '提交损坏',
        operator: '张工',
        detail:
          '告警事故判断：损坏；到达现场时间：2026-05-21 13:30:00；损坏描述：喷淋泵电机烧毁，需更换配件后复测；上传图片：共1张；工单状态：损坏',
        fields: [
          { label: '告警事故判断', value: '损坏' },
          { label: '到达现场时间', value: '2026-05-21 13:30:00' },
          { label: '损坏描述', value: '喷淋泵电机烧毁，需更换配件后复测' },
          { label: '上传图片', value: '共1张' },
          { label: '工单状态', value: '损坏' },
        ],
        images: [MOCK_DAMAGE_PHOTO],
      },
    ],
  },
  {
    id: 'SG20260605005',
    alarmDevice: '烟感探测器',
    installLocation: '森林湾大厦5层走廊',
    level: '二级告警',
    desc: '故障报警',
    alarmTime: '2026-07-06 09:00:00',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    flowRecords: [
      {
        time: '2026-07-06 09:00:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  /** 自动解除告警演示①：设备超时类，工单未接单时被强制关单 */
  {
    id: 'SG-AL20260601006',
    alarmDevice: '配电柜',
    installLocation: '中期大厦屋顶设备平台',
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-05-30 14:08:18',
    status: '已处理',
    miniStatus: '已完成',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601006',
    initiator: '系统',
    repairNote: AUTO_RESOLVE_REPAIR_NOTE,
    flowRecords: [
      {
        time: '2026-05-30 14:08:18',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
      {
        time: '2026-05-30 15:30:00',
        action: '告警恢复自动关单',
        operator: '系统',
        detail:
          '告警事故判断：维修；维修描述：系统自动解除报警；工单状态：已完成；解除告警时间：2026-05-30 15:30:00',
        fields: [
          { label: '告警事故判断', value: '维修' },
          { label: '维修描述', value: AUTO_RESOLVE_REPAIR_NOTE },
          { label: '工单状态', value: '已完成' },
          { label: '解除告警时间', value: '2026-05-30 15:30:00' },
        ],
      },
    ],
  },
  /** 自动解除告警演示②：设备超时类，工单已接单后仍被强制关单 */
  {
    id: 'SG-AL20260601008',
    alarmDevice: '生活水泵',
    installLocation: '森林湾大厦地下二层生活泵房',
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-06-10 09:00:00',
    status: '已处理',
    miniStatus: '已完成',
    receiver: '王运维',
    source: '告警同步',
    alarmId: 'AL20260601008',
    initiator: '系统',
    acceptedAt: '2026-06-10 09:30:00',
    repairNote: AUTO_RESOLVE_REPAIR_NOTE,
    flowRecords: [
      {
        time: '2026-06-10 09:00:00',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
      {
        time: '2026-06-10 09:30:00',
        action: '维修人员接单',
        operator: '王运维',
        fields: [{ label: '工单状态', value: '待完成' }],
      },
      {
        time: '2026-06-10 11:45:00',
        action: '告警恢复自动关单',
        operator: '系统',
        detail:
          '告警事故判断：维修；维修描述：系统自动解除报警；工单状态：已完成；解除告警时间：2026-06-10 11:45:00',
        fields: [
          { label: '告警事故判断', value: '维修' },
          { label: '维修描述', value: AUTO_RESOLVE_REPAIR_NOTE },
          { label: '工单状态', value: '已完成' },
          { label: '解除告警时间', value: '2026-06-10 11:45:00' },
        ],
      },
    ],
  },
  /** 自动解除告警演示③：非超时类（接口推送解除），工单未接单时被强制关单 */
  {
    id: 'SG-AL20260601009',
    alarmDevice: '红外探测器',
    installLocation: '双翼大厦3层走廊',
    level: '四级告警',
    desc: '故障报警',
    alarmTime: '2026-06-12 16:20:00',
    status: '已处理',
    miniStatus: '已完成',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601009',
    initiator: '系统',
    repairNote: AUTO_RESOLVE_REPAIR_NOTE,
    flowRecords: [
      {
        time: '2026-06-12 16:20:00',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
      {
        time: '2026-06-12 16:35:00',
        action: '告警恢复自动关单',
        operator: '系统',
        detail:
          '告警事故判断：维修；维修描述：系统自动解除报警；工单状态：已完成；解除告警时间：2026-06-12 16:35:00',
        fields: [
          { label: '告警事故判断', value: '维修' },
          { label: '维修描述', value: AUTO_RESOLVE_REPAIR_NOTE },
          { label: '工单状态', value: '已完成' },
          { label: '解除告警时间', value: '2026-06-12 16:35:00' },
        ],
      },
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

export function syncAlarmToFacility(alarm: AlarmListItem): boolean {
  if (!shouldSyncAlarmToFacility(alarm)) return false
  if (facilityOrders.some((o) => o.alarmId === alarm.id)) return false
  const flow: FacilityFlowRecord[] = [
    {
      time: alarm.time,
      action: '告警同步生成设施工单',
      operator: '系统',
      detail: '工单状态：待接单',
      fields: [{ label: '工单状态', value: '待接单' }],
    },
  ]
  facilityOrders = [
    normalizeOrder({
      id: `SG-${alarm.id}`,
      alarmDevice: alarm.alarmDevice,
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
  return true
}

/** 扫描告警列表：仅待处理 + 设备已开启生成工单 + 已到生成时机 → 生成设施工单 */
export function syncEligibleAlarmsToFacility(alarms: AlarmListItem[]) {
  let created = 0
  alarms.forEach((alarm) => {
    if (syncAlarmToFacility(alarm)) created += 1
  })
  return created
}

export function closeFacilityByAlarm(alarmId: string) {
  forceCloseFacilityByAlarmRecovery(alarmId)
}

/**
 * 告警恢复后强制关闭关联设施工单（无论是否有人接单）：
 * - 工单状态 → 已处理
 * - 维修描述 → 「系统自动解除报警」
 */
export function forceCloseFacilityByAlarmRecovery(
  alarmId: string,
  releaseTime?: string,
  operator = '系统',
) {
  const resolvedAt = releaseTime ?? nowStr()
  facilityOrders = facilityOrders.map((o) => {
    if (o.alarmId !== alarmId || o.miniStatus === '已完成') return o
    return normalizeOrder({
      ...o,
      miniStatus: '已完成',
      repairNote: AUTO_RESOLVE_REPAIR_NOTE,
      falseAlarmNote: undefined,
      damageNote: undefined,
      repairDraft: undefined,
      repairStarted: undefined,
      onSiteInfo: undefined,
      acceptedAt: undefined,
      flowRecords: appendMergedFlow(
        o.flowRecords,
        '告警恢复自动关单',
        operator,
        [
          { label: '告警事故判断', value: '维修' },
          { label: '维修描述', value: AUTO_RESOLVE_REPAIR_NOTE },
          { label: '工单状态', value: '已完成' },
          { label: '解除告警时间', value: resolvedAt },
        ],
        undefined,
        resolvedAt,
      ),
    })
  })
  notifyFacility()
}

/** 设备/接口侧传入的自动解除信号 */
export interface AlarmAutoResolveSignal {
  alarmId: string
  /** 超时类：设备已恢复数据传输、判定为在线 */
  deviceBackOnline?: boolean
  /** 非超时类：设备接口推送的解除告警信息 */
  externalClearReceived?: boolean
}

/**
 * 告警自动解除规则（与告警设置 thresholdMode 联动）：
 *
 * 【设备超时类】thresholdMode = deviceTimeout（或告警描述为「设备超时」）
 * - 触发：设备离线超过设定时长 → 产生超时告警
 * - 解除：设备再次恢复正常数据传输 → 判定恢复在线 → 自动解除告警
 *
 * 【非超时类】thresholdMode = none（第三方/接口推送）
 * - 触发：由设备接口或第三方推送产生告警
 * - 解除：设备接口传输「解除告警」信息 → 自动解除告警
 *
 * 【关联设施工单】
 * - 若告警已生成设施工单，无论是否有人接单，均强制关单为「已处理」
 * - 维修描述固定为「系统自动解除报警」
 */
export function isDeviceTimeoutTypeAlarm(
  alarm: Pick<AlarmListItem, 'desc' | 'level' | 'alarmDevice'>,
  rules: AlarmDeviceRule2[] = getAlarmDeviceRules(),
): boolean {
  const rule = findMatchingAlarmRule(alarm, rules)
  return rule?.thresholdMode === 'deviceTimeout' || alarm.desc === '设备超时'
}

/** 是否满足自动解除告警条件（告警须为「待处理」） */
export function shouldAutoResolveAlarm(
  alarm: AlarmListItem,
  signal: Pick<AlarmAutoResolveSignal, 'deviceBackOnline' | 'externalClearReceived'>,
  rules: AlarmDeviceRule2[] = getAlarmDeviceRules(),
): boolean {
  if (alarm.status !== '待处理') return false
  if (isDeviceTimeoutTypeAlarm(alarm, rules)) {
    return signal.deviceBackOnline === true
  }
  return signal.externalClearReceived === true
}

/** 将告警标记为自动解除（不写 store，由 alarmListStore 持久化） */
export function applyAlarmAutoResolved(alarm: AlarmListItem, releaseTime = nowStr()): AlarmListItem {
  return {
    ...alarm,
    status: '自动解除告警',
    autoResolved: true,
    releaseTime,
  }
}

/**
 * 执行自动解除告警全流程：更新告警态 + 强制关闭关联工单
 * @returns 更新后的告警；不满足条件时返回 null
 */
export function processAlarmAutoResolve(
  alarm: AlarmListItem,
  signal: AlarmAutoResolveSignal,
  releaseTime = nowStr(),
): AlarmListItem | null {
  if (!shouldAutoResolveAlarm(alarm, signal)) return null
  if (getFacilityOrderByAlarmId(alarm.id)) {
    forceCloseFacilityByAlarmRecovery(alarm.id, releaseTime)
  }
  return applyAlarmAutoResolved(alarm, releaseTime)
}

export function closeFacilityOrder(orderId: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId) return o
    return normalizeOrder({
      ...o,
      miniStatus: '已完成',
      flowRecords: appendMergedFlow(o.flowRecords, '工单关单', o.receiver, [
        { label: '工单状态', value: '已完成' },
      ]),
    })
  })
  notifyFacility()
}

/** @deprecated 已取消派单流程，工单创建后直接进入待接单 */
export function dispatchFacilityOrder(
  orderId: string,
  group: string,
  worker: string,
  note: string,
  operator: string,
) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || o.miniStatus !== '待派单') return o
    const fields: FacilityFlowField[] = [
      { label: '处理人员', value: `${group}-${worker}` },
      ...(note.trim() ? [{ label: '派单说明', value: note.trim() }] : []),
      { label: '工单状态', value: '待接单' },
    ]
    return normalizeOrder({
      ...o,
      miniStatus: '待接单',
      receiver: worker,
      dispatchGroup: group,
      dispatchNote: note.trim() || undefined,
      flowRecords: appendMergedFlow(o.flowRecords, '[派单]', operator, fields),
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
      flowRecords: appendMergedFlow(o.flowRecords, '[催单]', operator, [{ label: '催单说明', value: note.trim() }]),
    }
  })
  notifyFacility()
}

/** @deprecated 已取消待派单流程，不再支持撤销派单 */
export function revokeFacilityOrder(orderId: string, note: string, operator: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || o.miniStatus !== '待派单') return o
    return normalizeOrder({
      ...o,
      miniStatus: '已取消',
      receiver: '-',
      flowRecords: appendMergedFlow(o.flowRecords, '[撤销]', operator, [
        { label: '撤销说明', value: note.trim() },
        { label: '工单状态', value: '已取消' },
      ]),
    })
  })
  notifyFacility()
}

/** 接单：待接单或损坏 → 待完成 */
export function acceptFacilityOrder(orderId: string, receiver: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId) return o
    if (o.miniStatus !== '待接单' && o.miniStatus !== '损坏') return o
    const acceptedAt = nowStr()
    return normalizeOrder({
      ...o,
      miniStatus: '待完成',
      receiver,
      acceptedAt,
      flowRecords: appendMergedFlow(o.flowRecords, '维修人员接单', receiver, [
        { label: '工单状态', value: '待完成' },
      ], undefined, acceptedAt),
    })
  })
  notifyFacility()
}

/** 开始维修：标记维修进行中，此后不可取消接单 */
export function startFacilityRepair(orderId: string, receiver: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || !isFacilityRepairingStatus(o.miniStatus) || o.receiver !== receiver || o.repairStarted)
      return o
    return {
      ...o,
      repairStarted: true,
      flowRecords: appendMergedFlow(o.flowRecords, '开始维修', receiver, [
        { label: '维修状态', value: '维修进行中' },
      ]),
    }
  })
  notifyFacility()
}

/** 取消接单：待完成且未开始维修 → 待接单，退回工单池 */
export function cancelAcceptedFacilityOrder(orderId: string, receiver: string, reason: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || !isFacilityRepairingStatus(o.miniStatus) || o.receiver !== receiver || o.repairStarted)
      return o
    return normalizeOrder({
      ...o,
      miniStatus: '待接单',
      receiver: '-',
      acceptedAt: undefined,
      repairDraft: undefined,
      flowRecords: appendMergedFlow(o.flowRecords, '[取消接单]', receiver, [
        { label: '取消说明', value: reason.trim() },
        { label: '工单状态', value: '待接单' },
      ]),
    })
  })
  notifyFacility()
}

export interface FacilitySubmitPayload {
  arrivalTime: string
  judgment: IncidentJudgment
  note: string
  faultReason?: string
  photos: string[]
  photoNames: string[]
}

function formatArrivalTime(value: string) {
  return value.includes('T') ? value.replace('T', ' ') : value
}

function buildSubmitFields(payload: FacilitySubmitPayload, statusLabel: string): FacilityFlowField[] {
  const fields: FacilityFlowField[] = [
    { label: '告警事故判断', value: payload.judgment },
    { label: '到达现场时间', value: formatArrivalTime(payload.arrivalTime) },
  ]
  if (payload.judgment === '误报') {
    fields.push({ label: '误报说明', value: payload.note })
  } else if (payload.judgment === '维修') {
    if (payload.faultReason?.trim()) fields.push({ label: '故障原因', value: payload.faultReason.trim() })
    fields.push({ label: '维修描述', value: payload.note })
  } else if (payload.judgment === '损坏') {
    if (payload.faultReason?.trim()) fields.push({ label: '故障原因', value: payload.faultReason.trim() })
    fields.push({ label: '损坏描述', value: payload.note })
  }
  if (payload.photos.length) {
    fields.push({ label: '上传图片', value: `共${payload.photos.length}张` })
  }
  fields.push({ label: '工单状态', value: statusLabel })
  return fields
}

function toDraft(payload: FacilitySubmitPayload): FacilityRepairDraft {
  return {
    arrivalTime: payload.arrivalTime,
    faultReason: payload.faultReason,
    judgment: payload.judgment,
    note: payload.note,
    photos: payload.photos,
    photoNames: payload.photoNames,
  }
}

function canEditRepairOrder(o: FacilityOrderItem, receiver: string) {
  return isFacilityRepairingStatus(o.miniStatus) && o.receiver === receiver && !!o.repairStarted
}

/** 维修中页面暂存：保存到场信息，工单状态 → 待完成 */
export function holdOnSiteFacilityRepair(orderId: string, receiver: string, info: FacilityOnSiteInfo) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || !canEditRepairOrder(o, receiver)) return o
    const fields: FacilityFlowField[] = [
      ...(info.arrivalTime
        ? [{ label: '到达现场时间', value: formatArrivalTime(info.arrivalTime) }]
        : []),
      ...(info.faultReason?.trim() ? [{ label: '故障原因', value: info.faultReason.trim() }] : []),
      { label: '工单状态', value: '待完成' },
    ]
    return normalizeOrder({
      ...o,
      miniStatus: '待完成',
      onSiteInfo: info,
      flowRecords: appendMergedFlow(o.flowRecords, '现场信息暂存', receiver, fields),
    })
  })
  notifyFacility()
}

/** 维修中页面下一步：进入完成工单，预填到场信息与故障原因 */
export function proceedFacilityRepairNextStep(orderId: string, receiver: string, info: FacilityOnSiteInfo) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || !canEditRepairOrder(o, receiver)) return o
    if (!info.arrivalTime.trim()) return o
    const fields: FacilityFlowField[] = [
      { label: '到达现场时间', value: formatArrivalTime(info.arrivalTime) },
      ...(info.faultReason?.trim() ? [{ label: '故障原因', value: info.faultReason.trim() }] : []),
      { label: '下一步', value: '进入完成工单' },
    ]
    return normalizeOrder({
      ...o,
      miniStatus: '待完成',
      onSiteInfo: info,
      repairDraft: {
        arrivalTime: info.arrivalTime,
        faultReason: info.faultReason,
        judgment: '维修',
        note: '',
        photos: [],
        photoNames: [],
      },
      flowRecords: appendMergedFlow(o.flowRecords, '进入完成工单', receiver, fields),
    })
  })
  notifyFacility()
}

/** 完成工单暂存：保存草稿，状态不变；照片写入流转记录供中台同步查看 */
export function saveFacilityRepairDraft(orderId: string, receiver: string, payload: FacilitySubmitPayload) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || !canEditRepairOrder(o, receiver) || !isFacilityRepairingStatus(o.miniStatus)) return o
    const baseRecords = stripDraftFlowRecords(o.flowRecords)
    const draftNote = payload.note.trim() || '（暂存，待补充）'
    return normalizeOrder({
      ...o,
      repairDraft: toDraft(payload),
      flowRecords: appendMergedFlow(
        baseRecords,
        '完成工单暂存',
        receiver,
        buildSubmitFields({ ...payload, note: draftNote }, '待完成'),
        payload.photos.length > 0 ? payload.photos : undefined,
      ),
    })
  })
  notifyFacility()
}

/** 误报提交：待完成 → 已完成 */
export function submitFalseAlarmFacilityOrder(orderId: string, receiver: string, payload: FacilitySubmitPayload) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || !isFacilityRepairingStatus(o.miniStatus) || o.receiver !== receiver) return o
    return normalizeOrder({
      ...o,
      miniStatus: '已完成',
      falseAlarmNote: payload.note,
      repairNote: undefined,
      damageNote: undefined,
      repairDraft: undefined,
      repairStarted: undefined,
      onSiteInfo: undefined,
      flowRecords: appendMergedFlow(
        stripDraftFlowRecords(o.flowRecords),
        '提交误报',
        receiver,
        buildSubmitFields(payload, '已完成'),
        payload.photos,
      ),
    })
  })
  notifyFacility()
}

/** 维修提交：待完成 → 已完成 */
export function submitRepairFacilityOrder(orderId: string, receiver: string, payload: FacilitySubmitPayload) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || !isFacilityRepairingStatus(o.miniStatus) || o.receiver !== receiver) return o
    return normalizeOrder({
      ...o,
      miniStatus: '已完成',
      repairNote: payload.note,
      falseAlarmNote: undefined,
      damageNote: undefined,
      repairDraft: undefined,
      repairStarted: undefined,
      onSiteInfo: undefined,
      flowRecords: appendMergedFlow(
        stripDraftFlowRecords(o.flowRecords),
        '提交维修',
        receiver,
        buildSubmitFields(payload, '已完成'),
        payload.photos,
      ),
    })
  })
  notifyFacility()
}

/** 损坏提交：待完成 → 损坏 */
export function submitDamageFacilityOrder(orderId: string, receiver: string, payload: FacilitySubmitPayload) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || !isFacilityRepairingStatus(o.miniStatus) || o.receiver !== receiver) return o
    return normalizeOrder({
      ...o,
      miniStatus: '损坏',
      receiver: '-',
      damageNote: payload.note,
      falseAlarmNote: undefined,
      repairNote: undefined,
      repairDraft: undefined,
      repairStarted: undefined,
      onSiteInfo: undefined,
      flowRecords: appendMergedFlow(
        stripDraftFlowRecords(o.flowRecords),
        '提交损坏',
        receiver,
        buildSubmitFields(payload, '损坏'),
        payload.photos,
      ),
    })
  })
  notifyFacility()
}

/** @deprecated 使用 submitRepairFacilityOrder */
export function completeFacilityOrder(
  orderId: string,
  receiver: string,
  payload: { arrivalTime: string; note?: string; repairPhotos?: string[] },
) {
  submitRepairFacilityOrder(orderId, receiver, {
    arrivalTime: payload.arrivalTime,
    judgment: '维修',
    note: payload.note ?? '',
    photos: [],
    photoNames: payload.repairPhotos ?? [],
  })
}

/** @deprecated 使用 submitDamageFacilityOrder */
export function damageFacilityOrder(
  orderId: string,
  receiver: string,
  payload: { arrivalTime: string; note?: string; repairPhotos?: string[] },
) {
  submitDamageFacilityOrder(orderId, receiver, {
    arrivalTime: payload.arrivalTime,
    judgment: '损坏',
    note: payload.note ?? '',
    photos: [],
    photoNames: payload.repairPhotos ?? [],
  })
}

export type ThresholdMode = 'none' | 'deviceTimeout'

export function formatThresholdDisplay(thresholdMode: ThresholdMode, customMinutes?: number) {
  if (thresholdMode === 'deviceTimeout') {
    const minutes = customMinutes ?? DEFAULT_TIMEOUT_MINUTES
    return `设备离线超过${minutes}分钟（设备超时报警）`
  }
  return '无'
}

const MS_PER_DAY = 86400000

export interface FacilityWorkOrderSettings {
  /** 工单生成后多少天未处理（未接单）算超时 */
  unhandledTimeoutDays: number
  /** 接单后多少天未完成算逾期 */
  completionOverdueDays: number
}

const DEFAULT_FACILITY_WORK_ORDER_SETTINGS: FacilityWorkOrderSettings = {
  unhandledTimeoutDays: 3,
  completionOverdueDays: 7,
}

let facilityWorkOrderSettings: FacilityWorkOrderSettings = {
  ...DEFAULT_FACILITY_WORK_ORDER_SETTINGS,
}
const facilitySettingsListeners = new Set<() => void>()

export function getFacilityWorkOrderSettings() {
  return { ...facilityWorkOrderSettings }
}

export function updateFacilityWorkOrderSettings(patch: Partial<FacilityWorkOrderSettings>) {
  if (!canEditFacilityWorkOrderSettings()) {
    throw new Error('无工单设置编辑权限')
  }
  facilityWorkOrderSettings = { ...facilityWorkOrderSettings, ...patch }
  facilitySettingsListeners.forEach((fn) => fn())
}

export function subscribeFacilityWorkOrderSettings(listener: () => void) {
  facilitySettingsListeners.add(listener)
  return () => {
    facilitySettingsListeners.delete(listener)
  }
}

export type FacilitySlaColor = 'green' | 'red' | 'orange' | 'default'
export type FacilitySlaState = 'remaining' | 'timeout' | 'overdue' | 'none'

export interface FacilitySlaView {
  state: FacilitySlaState
  days: number
  label: string
  color: FacilitySlaColor
  /** @deprecated 使用 workOrderStatus + processStatus */
  displayStatus: FacilityOrderStatus
  /** 工单状态：待处理 / 处理中 / 已处理 / 损坏 */
  workOrderStatus: FacilityWorkOrderStatus
  /** 处理状态：6 种，与工单状态一一对应（见 resolveFacilityStatusView） */
  processStatus: FacilityProcessStatus
}

/**
 * 工单状态 ↔ 处理状态 一一对应规则：
 * | 工单状态 | 条件           | 处理状态     |
 * | 待处理   | 未超未接单时限 | 待处理       |
 * | 待处理   | 已超未接单时限 | 超时待处理   |
 * | 处理中   | 未超完成时限   | 处理中       |
 * | 处理中   | 已超完成时限   | 逾期处理中   |
 * | 已处理   | —              | 已处理       |
 * | 损坏     | 在工单池待接单 | 损坏待处理（不参与未处理超时） |
 * | 损坏     | 再次接单后处理中 | 逾期处理中（完成逾期规则一致） |
 */
export function resolveFacilityStatusView(
  order: FacilityOrderItem,
  settings: FacilityWorkOrderSettings = getFacilityWorkOrderSettings(),
  now = Date.now(),
): FacilitySlaView {
  const mini = String(order.miniStatus)
  const workOrderStatus = platformStatusFromMini(mini) as FacilityWorkOrderStatus

  if (mini === '已完成') {
    return slaResult('已处理', '已处理', 'none', 0, '—', 'default')
  }
  if (mini === '损坏') {
    // 损坏工单在工单池不参与「未处理超时」；再次接单后走下方 isFacilityRepairingStatus 分支
    return slaResult('损坏', '损坏待处理', 'none', 0, '—', 'default')
  }
  if (mini === '已取消') {
    return slaResult('待处理', '待处理', 'none', 0, '—', 'default')
  }

  if (isMiniUnaccepted(mini)) {
    const created = parseAlarmTimeMs(order.alarmTime)
    const deadline = created + settings.unhandledTimeoutDays * MS_PER_DAY
    if (now > deadline) {
      const days = Math.max(1, Math.ceil((now - deadline) / MS_PER_DAY))
      return slaResult('待处理', '超时待处理', 'timeout', days, `已超时${days}天`, 'red')
    }
    const days = Math.max(0, Math.ceil((deadline - now) / MS_PER_DAY))
    return slaResult('待处理', '待处理', 'remaining', days, `剩余${days}天`, 'green')
  }

  if (isFacilityRepairingStatus(mini)) {
    const acceptedAt = inferAcceptedAt(order) ?? order.alarmTime
    const accepted = parseAlarmTimeMs(acceptedAt)
    const deadline = accepted + settings.completionOverdueDays * MS_PER_DAY
    if (now > deadline) {
      const days = Math.max(1, Math.ceil((now - deadline) / MS_PER_DAY))
      return slaResult('处理中', '逾期处理中', 'overdue', days, `已逾期${days}天`, 'orange')
    }
    const days = Math.max(0, Math.ceil((deadline - now) / MS_PER_DAY))
    return slaResult('处理中', '处理中', 'remaining', days, `剩余${days}天`, 'green')
  }

  return slaResult(workOrderStatus, '待处理', 'none', 0, '—', 'default')
}

function slaResult(
  workOrderStatus: FacilityWorkOrderStatus,
  processStatus: FacilityProcessStatus,
  state: FacilitySlaState,
  days: number,
  label: string,
  color: FacilitySlaColor,
): FacilitySlaView {
  const displayStatus: FacilityOrderStatus =
    processStatus === '超时待处理'
      ? '超时待处理'
      : processStatus === '逾期处理中'
        ? '逾期处理中'
        : workOrderStatus
  return { state, days, label, color, displayStatus, workOrderStatus, processStatus }
}

/** @deprecated 使用 resolveFacilityStatusView */
export function resolveFacilitySla(
  order: FacilityOrderItem,
  settings: FacilityWorkOrderSettings = getFacilityWorkOrderSettings(),
  now = Date.now(),
): FacilitySlaView {
  return resolveFacilityStatusView(order, settings, now)
}

export function facilitySlaColorHex(color: FacilitySlaColor) {
  if (color === 'green') return '#52c41a'
  if (color === 'red') return '#ff4d4f'
  if (color === 'orange') return '#fa8c16'
  return '#999'
}

function isMiniUnaccepted(mini: string) {
  return mini === '待接单'
}

function inferAcceptedAt(order: FacilityOrderItem): string | undefined {
  if (order.acceptedAt) return order.acceptedAt
  const records = order.flowRecords
  if (!records?.length) return undefined
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].action === '维修人员接单') return records[i].time
  }
  return undefined
}

function matchesFacilityTab(
  workOrderStatus: FacilityWorkOrderStatus,
  tab: 'processing' | 'unprocessed' | 'processed' | 'damaged',
) {
  if (tab === 'unprocessed') return workOrderStatus === '待处理'
  if (tab === 'processing') return workOrderStatus === '处理中'
  if (tab === 'processed') return workOrderStatus === '已处理'
  if (tab === 'damaged') return workOrderStatus === '损坏'
  return false
}

export function facilityOrderMatchesTab(
  order: FacilityOrderItem,
  tab: 'all' | 'processing' | 'unprocessed' | 'processed' | 'damaged',
  now = Date.now(),
) {
  if (tab === 'all') return true
  const { workOrderStatus } = resolveFacilityStatusView(order, getFacilityWorkOrderSettings(), now)
  return matchesFacilityTab(workOrderStatus, tab)
}

export function facilityProcessStatusMatchesFilter(
  order: FacilityOrderItem,
  processStatus: FacilityProcessStatus,
  now = Date.now(),
) {
  const view = resolveFacilityStatusView(order, getFacilityWorkOrderSettings(), now)
  return view.processStatus === processStatus
}
