import type { AlarmListItem } from '../mock/alarmData'
import {
  ALARM_FACILITY_SYNC_DEVICES,
  ALARM_LEVELS,
  DEFAULT_TIMEOUT_MINUTES,
  type AlarmDescType,
  type AlarmLevel,
} from '../pages/alarm/constants'

/** 告警同步设施工单：可生成的等级与设备范围 */
export interface AlarmFacilitySyncSettings {
  levels: AlarmLevel[]
  devices: string[]
}

const defaultAlarmFacilitySyncSettings: AlarmFacilitySyncSettings = {
  levels: [...ALARM_LEVELS],
  devices: [...ALARM_FACILITY_SYNC_DEVICES],
}

const allowedFacilitySyncDevices = new Set<string>(ALARM_FACILITY_SYNC_DEVICES)

let alarmFacilitySyncSettings: AlarmFacilitySyncSettings = {
  levels: [...defaultAlarmFacilitySyncSettings.levels],
  devices: [...defaultAlarmFacilitySyncSettings.devices],
}

const alarmFacilitySyncListeners = new Set<() => void>()

function notifyAlarmFacilitySyncSettings() {
  alarmFacilitySyncListeners.forEach((fn) => fn())
}

export function getAlarmFacilitySyncSettings(): AlarmFacilitySyncSettings {
  return {
    levels: [...alarmFacilitySyncSettings.levels],
    devices: alarmFacilitySyncSettings.devices.filter((d) => allowedFacilitySyncDevices.has(d)),
  }
}

export function updateAlarmFacilitySyncSettings(settings: AlarmFacilitySyncSettings) {
  alarmFacilitySyncSettings = {
    levels: [...settings.levels],
    devices: settings.devices.filter((d) => allowedFacilitySyncDevices.has(d)),
  }
  notifyAlarmFacilitySyncSettings()
}

export function subscribeAlarmFacilitySyncSettings(listener: () => void) {
  alarmFacilitySyncListeners.add(listener)
  return () => {
    alarmFacilitySyncListeners.delete(listener)
  }
}

/** 告警是否满足「生成设施工单」配置（等级 + 至少一个设备命中） */
export function isAlarmEligibleForFacilitySync(
  alarm: Pick<AlarmListItem, 'level' | 'alarmDevices'>,
  settings: AlarmFacilitySyncSettings = getAlarmFacilitySyncSettings(),
) {
  if (!settings.levels.includes(alarm.level)) return false
  const devices = alarm.alarmDevices ?? []
  return devices.some((d) => settings.devices.includes(d))
}

export function getFacilityOrderByAlarmId(alarmId: string) {
  return facilityOrders.find((o) => o.alarmId === alarmId)
}

/** 中台设施工单状态 */
export const FACILITY_ORDER_STATUS = ['待处理', '处理中', '已处理', '损坏'] as const
export type FacilityOrderStatus = (typeof FACILITY_ORDER_STATUS)[number]

/** 小程序设施工单展示状态 */
export const MINI_FACILITY_STATUS = ['待派单', '待接单', '待完成', '已完成', '已取消', '损坏'] as const
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
  /** 维修处理暂存草稿 */
  repairDraft?: FacilityRepairDraft
  /** 是否已开始维修（开始后不可取消接单） */
  repairStarted?: boolean
  /** 维修中页面填写的到场信息 */
  onSiteInfo?: FacilityOnSiteInfo
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
  return [...(records ?? []), { time: t, action, operator, detail, fields, images }]
}

export function platformStatusFromMini(mini: MiniFacilityStatus | string): FacilityOrderStatus {
  if (mini === '待派单' || mini === '待接单' || mini === '已取消') return '待处理'
  if (mini === '处理中' || mini === '待完成') return '处理中'
  if (mini === '已完成') return '已处理'
  if (mini === '损坏') return '损坏'
  return '待处理'
}

function legacyMiniStatus(status: string): MiniFacilityStatus {
  if (status === '待处理') return '待接单'
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
      {
        time: '2026-06-01 11:20:05',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603006',
    alarmDevices: ['消防主机', '烟感探测器'],
    installLocation: '双翼大厦消防控制室',
    level: '一级告警',
    desc: '火灾报警',
    alarmTime: '2026-06-03 08:12:33',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601001',
    initiator: '系统',
    flowRecords: [
      {
        time: '2026-06-03 08:12:33',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603007',
    alarmDevices: ['烟感探测器'],
    installLocation: '森林湾大厦3层消防通道',
    level: '四级告警',
    desc: '火灾报警',
    alarmTime: '2026-06-02 16:30:22',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601004',
    initiator: '系统',
    flowRecords: [
      {
        time: '2026-06-02 16:30:22',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603008',
    alarmDevices: ['电梯设备'],
    installLocation: '双翼大厦B栋客梯机房',
    level: '二级告警',
    desc: '故障报警',
    alarmTime: '2026-06-02 22:15:40',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '告警同步',
    alarmId: 'AL20260601005',
    initiator: '系统',
    flowRecords: [
      {
        time: '2026-06-02 22:15:40',
        action: '告警同步生成设施工单',
        operator: '系统',
        detail: '工单状态：待接单',
        fields: [{ label: '工单状态', value: '待接单' }],
      },
    ],
  },
  {
    id: 'SG20260603009',
    alarmDevices: ['防火门'],
    installLocation: '中期大厦2层东侧安全出口',
    level: '二级告警',
    desc: '故障报警',
    alarmTime: '2026-06-03 09:20:00',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    dispatchGroup: '设施维修一组',
    dispatchNote: '防火门闭门器失效，请尽快到场检修',
    flowRecords: [
      {
        time: '2026-06-03 09:00:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        fields: [{ label: '工单状态', value: '待派单' }],
      },
      {
        time: '2026-06-03 09:20:00',
        action: '派单',
        operator: '管理员000000',
        detail: '派单工作组：设施维修一组；派单说明：防火门闭门器失效，请尽快到场检修；工单状态：待接单',
        fields: [
          { label: '派单工作组', value: '设施维修一组' },
          { label: '派单说明', value: '防火门闭门器失效，请尽快到场检修' },
          { label: '工单状态', value: '待接单' },
        ],
      },
    ],
  },
  {
    id: 'SG20260603010',
    alarmDevices: ['温感探测器'],
    installLocation: '森林湾大厦地下一层车库',
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-06-03 10:05:18',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    dispatchGroup: '消防维保组',
    dispatchNote: '温感探测器通讯超时，需现场排查',
    flowRecords: [
      {
        time: '2026-06-03 09:45:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        fields: [{ label: '工单状态', value: '待派单' }],
      },
      {
        time: '2026-06-03 10:05:18',
        action: '派单',
        operator: '管理员000000',
        detail: '派单工作组：消防维保组；派单说明：温感探测器通讯超时，需现场排查；工单状态：待接单',
        fields: [
          { label: '派单工作组', value: '消防维保组' },
          { label: '派单说明', value: '温感探测器通讯超时，需现场排查' },
          { label: '工单状态', value: '待接单' },
        ],
      },
    ],
  },
  {
    id: 'SG20260603011',
    alarmDevices: ['门禁系统'],
    installLocation: '双翼大厦主入口门厅',
    level: '四级告警',
    desc: '故障报警',
    alarmTime: '2026-06-03 11:30:45',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    dispatchGroup: '设施维修二组',
    dispatchNote: '门禁读卡无响应，影响人员进出',
    flowRecords: [
      {
        time: '2026-06-03 11:10:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        fields: [{ label: '工单状态', value: '待派单' }],
      },
      {
        time: '2026-06-03 11:30:45',
        action: '派单',
        operator: '管理员000000',
        detail: '派单工作组：设施维修二组；派单说明：门禁读卡无响应，影响人员进出；工单状态：待接单',
        fields: [
          { label: '派单工作组', value: '设施维修二组' },
          { label: '派单说明', value: '门禁读卡无响应，影响人员进出' },
          { label: '工单状态', value: '待接单' },
        ],
      },
    ],
  },
  {
    id: 'SG20260603012',
    alarmDevices: ['监控摄像头'],
    installLocation: '中期大厦屋顶设备平台',
    level: '三级告警',
    desc: '故障报警',
    alarmTime: '2026-06-03 13:18:00',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    dispatchGroup: '设施维修二组',
    dispatchNote: '屋顶监控画面丢失，请检查线路与供电',
    flowRecords: [
      {
        time: '2026-06-03 13:00:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        fields: [{ label: '工单状态', value: '待派单' }],
      },
      {
        time: '2026-06-03 13:18:00',
        action: '派单',
        operator: '管理员000000',
        detail: '派单工作组：设施维修二组；派单说明：屋顶监控画面丢失，请检查线路与供电；工单状态：待接单',
        fields: [
          { label: '派单工作组', value: '设施维修二组' },
          { label: '派单说明', value: '屋顶监控画面丢失，请检查线路与供电' },
          { label: '工单状态', value: '待接单' },
        ],
      },
    ],
  },
  {
    id: 'SG20260603013',
    alarmDevices: ['生活水泵'],
    installLocation: '森林湾大厦地下二层生活泵房',
    level: '三级告警',
    desc: '设备超时',
    alarmTime: '2026-06-03 14:42:11',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    dispatchGroup: '设施维修一组',
    dispatchNote: '生活水泵运行信号异常，请核查控制柜',
    flowRecords: [
      {
        time: '2026-06-03 14:25:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        fields: [{ label: '工单状态', value: '待派单' }],
      },
      {
        time: '2026-06-03 14:42:11',
        action: '派单',
        operator: '管理员000000',
        detail: '派单工作组：设施维修一组；派单说明：生活水泵运行信号异常，请核查控制柜；工单状态：待接单',
        fields: [
          { label: '派单工作组', value: '设施维修一组' },
          { label: '派单说明', value: '生活水泵运行信号异常，请核查控制柜' },
          { label: '工单状态', value: '待接单' },
        ],
      },
    ],
  },
  {
    id: 'SG20260603014',
    alarmDevices: ['消防水泵'],
    installLocation: '溧阳消防局训练基地泵房',
    level: '一级告警',
    desc: '设备超时',
    alarmTime: '2026-06-03 15:55:30',
    status: '待处理',
    miniStatus: '待接单',
    receiver: '-',
    source: '手动',
    initiator: '管理员000000',
    dispatchGroup: '消防维保组',
    dispatchNote: '消防水泵压力低于阈值，需紧急巡检',
    flowRecords: [
      {
        time: '2026-06-03 15:40:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        fields: [{ label: '工单状态', value: '待派单' }],
      },
      {
        time: '2026-06-03 15:55:30',
        action: '派单',
        operator: '管理员000000',
        detail: '派单工作组：消防维保组；派单说明：消防水泵压力低于阈值，需紧急巡检；工单状态：待接单',
        fields: [
          { label: '派单工作组', value: '消防维保组' },
          { label: '派单说明', value: '消防水泵压力低于阈值，需紧急巡检' },
          { label: '工单状态', value: '待接单' },
        ],
      },
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
    miniStatus: '待完成',
    receiver: '王运维',
    source: '告警同步',
    alarmId: 'AL20260601002',
    initiator: '系统',
    flowRecords: [
      { time: '2026-06-01 09:45:11', action: '告警同步生成设施工单', operator: '系统', fields: [{ label: '工单状态', value: '待接单' }] },
      {
        time: '2026-06-01 09:50:00',
        action: '维修人员接单',
        operator: '王运维',
        detail: '工单状态：待完成',
        fields: [{ label: '工单状态', value: '待完成' }],
      },
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
      { time: '2026-05-28 16:02:18', action: '告警同步生成设施工单', operator: '系统', fields: [{ label: '工单状态', value: '待接单' }] },
      { time: '2026-05-28 16:30:00', action: '维修人员接单', operator: '李维修', fields: [{ label: '工单状态', value: '待完成' }] },
      {
        time: '2026-05-29 10:00:00',
        action: '提交维修',
        operator: '李维修',
        detail: '告警事故判断：维修；到达现场时间：2026-05-29 09:30:00；维修描述：现场复测正常；工单状态：已完成',
        fields: [
          { label: '告警事故判断', value: '维修' },
          { label: '到达现场时间', value: '2026-05-29 09:30:00' },
          { label: '维修描述', value: '现场复测正常' },
          { label: '工单状态', value: '已完成' },
        ],
      },
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
      { time: '2026-05-20 08:30:00', action: '手动创建设施工单', operator: '管理员000000', fields: [{ label: '工单状态', value: '待接单' }] },
      { time: '2026-05-20 09:00:00', action: '维修人员接单', operator: '张工', fields: [{ label: '工单状态', value: '待完成' }] },
      {
        time: '2026-05-21 14:00:00',
        action: '提交损坏',
        operator: '张工',
        detail: '告警事故判断：损坏；损坏描述：喷淋泵电机烧毁，需更换配件后复测；工单状态：损坏',
        fields: [
          { label: '告警事故判断', value: '损坏' },
          { label: '损坏描述', value: '喷淋泵电机烧毁，需更换配件后复测' },
          { label: '工单状态', value: '损坏' },
        ],
      },
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
      {
        time: '2026-06-05 10:00:00',
        action: '手动创建设施工单',
        operator: '管理员000000',
        detail: '工单状态：待派单',
        fields: [{ label: '工单状态', value: '待派单' }],
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
  if (!isAlarmEligibleForFacilitySync(alarm)) return false
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
  return true
}

/** 对告警列表中「待处理」且符合设置的记录尝试生成设施工单 */
export function syncEligibleAlarmsToFacility(alarms: AlarmListItem[]) {
  let created = 0
  alarms.forEach((alarm) => {
    if (alarm.status !== '待处理') return
    if (syncAlarmToFacility(alarm)) created += 1
  })
  return created
}

export function closeFacilityByAlarm(alarmId: string) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.alarmId !== alarmId || o.miniStatus === '已完成') return o
    const receiver = o.receiver === '-' ? '系统' : o.receiver
    return normalizeOrder({
      ...o,
      miniStatus: '已完成',
      receiver,
      flowRecords: appendMergedFlow(o.flowRecords, '告警恢复自动关单', '系统', [
        { label: '工单状态', value: '已完成' },
      ]),
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
      flowRecords: appendMergedFlow(o.flowRecords, '工单关单', o.receiver, [
        { label: '工单状态', value: '已完成' },
      ]),
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

/** 撤销：待派单 → 已取消 */
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
    return normalizeOrder({
      ...o,
      miniStatus: '待完成',
      receiver,
      flowRecords: appendMergedFlow(o.flowRecords, '维修人员接单', receiver, [
        { label: '工单状态', value: '待完成' },
      ]),
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

/** 完成工单暂存：保存草稿，状态不变 */
export function saveFacilityRepairDraft(orderId: string, receiver: string, payload: FacilitySubmitPayload) {
  facilityOrders = facilityOrders.map((o) => {
    if (o.id !== orderId || !canEditRepairOrder(o, receiver) || !isFacilityRepairingStatus(o.miniStatus)) return o
    return { ...o, repairDraft: toDraft(payload) }
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
      repairDraft: undefined,
      repairStarted: undefined,
      onSiteInfo: undefined,
      flowRecords: appendMergedFlow(
        o.flowRecords,
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
      repairDraft: undefined,
      repairStarted: undefined,
      onSiteInfo: undefined,
      flowRecords: appendMergedFlow(
        o.flowRecords,
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
      repairDraft: undefined,
      repairStarted: undefined,
      onSiteInfo: undefined,
      flowRecords: appendMergedFlow(
        o.flowRecords,
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
