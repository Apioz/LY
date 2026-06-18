import type { AlarmLevel, AlarmStatus, AlarmDescType } from '../pages/alarm/constants'
import { DEFAULT_TIMEOUT_MINUTES } from '../pages/alarm/constants'

export type AlarmListStatus = AlarmStatus | '告警' | '自动解除告警'

export interface AlarmListItem {
  id: string
  name: string
  level: AlarmLevel
  /** 告警设备 */
  alarmDevices: string[]
  /** 设备安装位置 */
  installLocation: string
  desc: AlarmDescType
  status: AlarmListStatus
  time: string
  releaseTime?: string
  facilityOrderId?: string
  /** 设备恢复传输后自动解除（列表展示为「自动解除告警」） */
  autoResolved?: boolean
  /** 未配置工单生成的活跃告警（列表展示为「告警」，无工单处理流程） */
  noWorkOrder?: boolean
}

export interface RealtimeAlarmItem {
  id: string
  name: string
  levelLabel: string
  level: 1 | 2 | 3 | 4
  time: string
  defense: '人防数据' | '技防数据'
}

export interface AlarmRuleItem {
  key: string
  /** 告警设备，系统内设备，可多选 */
  alarmDevices: string[]
  level: AlarmLevel
  /** 无：仅第三方推送 | 设备超时设置 */
  thresholdMode: 'none' | 'deviceTimeout'
  thresholdDisplay: string
  customMinutes?: number
  createTime: string
}

export const alarmListData: AlarmListItem[] = [
  { id: 'AL20260601001', name: '烟感主机告警', level: '一级告警', alarmDevices: ['消防主机', '烟感探测器'], installLocation: '双翼大厦消防控制室', desc: '火灾报警', status: '待处理', time: '2026-06-01 08:12:33' },
  { id: 'AL20260601002', name: '配电柜通讯异常', level: '二级告警', alarmDevices: ['配电柜'], installLocation: '双翼大厦1层配电间', desc: '故障报警', status: '已处理', time: '2026-06-01 09:45:11', releaseTime: '2026-06-01 10:20:00' },
  { id: 'AL20260601003', name: '水泵响应超时', level: '三级告警', alarmDevices: ['消防水泵', '生活水泵'], installLocation: '双翼大厦地下一层消防泵房', desc: '设备超时', status: '待处理', time: '2026-06-01 11:20:05' },
  { id: 'AL20260601004', name: '消防通道烟感', level: '四级告警', alarmDevices: ['烟感探测器'], installLocation: '森林湾大厦3层消防通道', desc: '火灾报警', status: '误报', time: '2026-05-31 16:30:22', releaseTime: '2026-05-31 17:00:00' },
  { id: 'AL20260601005', name: '电梯网关离线', level: '二级告警', alarmDevices: ['电梯设备'], installLocation: '双翼大厦B栋客梯机房', desc: '故障报警', status: '告警', time: '2026-05-30 22:15:40', noWorkOrder: true },
  { id: 'AL20260601006', name: '空调机组超时', level: '三级告警', alarmDevices: ['配电柜'], installLocation: '中期大厦屋顶设备平台', desc: '设备超时', status: '自动解除告警', time: '2026-05-30 14:08:18', releaseTime: '2026-05-30 15:30:00', autoResolved: true },
  { id: 'AL20260601007', name: '配电柜温度超限', level: '二级告警', alarmDevices: ['配电柜'], installLocation: '双翼大厦2层配电间', desc: '故障报警', status: '告警', time: '2026-06-04 09:15:22', noWorkOrder: true },
]

export const realtimeHumanAlarms: RealtimeAlarmItem[] = [
  { id: 'r1', name: '消防通道占用告警', levelLabel: '一级预警', level: 1, time: '06-03 09:12:33', defense: '人防数据' },
  { id: 'r2', name: '人员聚集超限', levelLabel: '二级预警', level: 2, time: '06-03 08:45:11', defense: '人防数据' },
  { id: 'r3', name: '未授权区域闯入', levelLabel: '三级预警', level: 3, time: '06-02 16:17:51', defense: '人防数据' },
  { id: 'r4', name: '值班离岗检测', levelLabel: '四级预警', level: 4, time: '06-02 14:20:05', defense: '人防数据' },
]

export const realtimeTechAlarms: RealtimeAlarmItem[] = [
  { id: 't1', name: '机架数据异常', levelLabel: '一级预警', level: 1, time: '06-03 10:12:33', defense: '技防数据' },
  { id: 't2', name: '烟感浓度超限', levelLabel: '二级预警', level: 2, time: '06-03 09:30:11', defense: '技防数据' },
  { id: 't3', name: '配电温度异常', levelLabel: '三级预警', level: 3, time: '06-02 16:17:51', defense: '技防数据' },
  { id: 't4', name: '水泵压力偏低', levelLabel: '四级预警', level: 4, time: '06-02 11:20:05', defense: '技防数据' },
]

export const alarmRulesData: AlarmRuleItem[] = [
  {
    key: '1',
    alarmDevices: ['消防主机', '烟感探测器'],
    level: '一级告警',
    thresholdMode: 'none',
    thresholdDisplay: '无',
    createTime: '2026-05-10 10:00:00',
  },
  {
    key: '2',
    alarmDevices: ['配电柜', '电梯设备'],
    level: '二级告警',
    thresholdMode: 'none',
    thresholdDisplay: '无',
    createTime: '2026-05-12 14:30:00',
  },
  {
    key: '3',
    alarmDevices: ['消防水泵', '生活水泵'],
    level: '三级告警',
    thresholdMode: 'deviceTimeout',
    thresholdDisplay: `设备离线超过${DEFAULT_TIMEOUT_MINUTES}分钟（设备超时报警）`,
    customMinutes: DEFAULT_TIMEOUT_MINUTES,
    createTime: '2026-05-15 09:20:00',
  },
]

export type AlarmKpiPeriod = 'day' | 'week' | 'month' | 'year'
export type AlarmKpiRange = 'today' | 'week' | 'month'

export function getKpiCards(period: AlarmKpiPeriod) {
  const factor = period === 'day' ? 0.3 : period === 'week' ? 0.55 : period === 'year' ? 3 : 1
  return [
    { label: '待处置', value: Math.round(145 * factor) },
    { label: '处置超时', value: Math.round(75 * factor) },
    { label: '设备告警', value: Math.round(76 * factor) },
    { label: '事件上报', value: Math.round(15 * factor) },
  ]
}

/** 小程序数据页：今日 / 本周 / 本月，与中台告警统计 KPI 同源 */
export function getKpiCardsByRange(range: AlarmKpiRange) {
  const periodMap: Record<AlarmKpiRange, AlarmKpiPeriod> = {
    today: 'day',
    week: 'week',
    month: 'month',
  }
  return getKpiCards(periodMap[range])
}

export function getLevelDistributionFour() {
  return [
    { name: '一级告警', value: 26.9 },
    { name: '二级告警', value: 26.9 },
    { name: '三级告警', value: 26.9 },
    { name: '四级告警', value: 19.3 },
  ]
}

export function getTrendData(range: 'today' | 'month' | 'year') {
  if (range === 'today') {
    return {
      x: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      data: [120, 180, 320, 280, 410, 350],
    }
  }
  if (range === 'year') {
    return {
      x: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      data: [320, 280, 350, 410, 380, 420, 390, 450, 400, 380, 360, 400],
    }
  }
  const days = 31
  const x = Array.from({ length: days }, (_, i) => `${i + 1}日`)
  const data = Array.from({ length: days }, (_, i) => {
    const base = 80 + (i % 7) * 25
    return base + Math.floor(Math.sin(i / 3) * 40)
  })
  return { x, data }
}
