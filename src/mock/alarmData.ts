import type { AlarmLevel, AlarmStatus } from '../pages/alarm/constants'

export interface AlarmListItem {
  id: string
  name: string
  level: AlarmLevel
  type: string
  desc: string
  status: AlarmStatus
  time: string
  releaseTime?: string
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
  name: string
  level: AlarmLevel
  type: string
  threshold: string
  createTime: string
}

export const alarmListData: AlarmListItem[] = [
  { id: 'AL20260601001', name: '机架数据异常', level: '一级告警', type: '设备告警', desc: '机房A区机架温度超限', status: '待处理', time: '2026-06-01 08:12:33' },
  { id: 'AL20260601002', name: '烟感报警', level: '二级告警', type: '消防', desc: '双翼大厦B1F烟感触发', status: '已处理', time: '2026-06-01 09:45:11', releaseTime: '2026-06-01 10:20:00' },
  { id: 'AL20260601003', name: '配电温度过高', level: '三级告警', type: '电气', desc: '中期大厦配电柜温度>60℃', status: '待处理', time: '2026-06-01 11:20:05' },
  { id: 'AL20260601004', name: '消防通道占用', level: '四级告警', type: '事件上报', desc: '天山路473号通道堆放杂物', status: '误报', time: '2026-05-31 16:30:22', releaseTime: '2026-05-31 17:00:00' },
  { id: 'AL20260601005', name: '门禁异常开启', level: '五级告警', type: '安防', desc: '非授权时段门禁开启', status: '损坏', time: '2026-05-30 22:15:40' },
  { id: 'AL20260601006', name: '电瓶车违规充电', level: '二级告警', type: '事件上报', desc: '地下车库违规充电检测', status: '已处理', time: '2026-05-30 14:08:18', releaseTime: '2026-05-30 15:30:00' },
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
  { key: '1', name: '烟感超限告警规则', level: '一级告警', type: '消防', threshold: '浓度>80%持续30秒触发', createTime: '2026-05-10 10:00:00' },
  { key: '2', name: '配电温度告警规则', level: '二级告警', type: '电气', threshold: '温度>60℃', createTime: '2026-05-12 14:30:00' },
  { key: '3', name: '消防通道占用规则', level: '三级告警', type: '事件上报', threshold: '视频AI识别通道占用>5分钟', createTime: '2026-05-15 09:20:00' },
]

export const equipmentHealthData = [
  { name: '设备故障数', value: 8000, unit: '台' },
  { name: '消火栓', value: 0, unit: '次' },
  { name: '烟感', value: 100, unit: '%' },
  { name: '温感', value: 100, unit: '%' },
  { name: '防火门', value: 100, unit: '%' },
  { name: '火灾报警', value: 98, unit: '%' },
  { name: '消防水系统', value: 100, unit: '%' },
]

export const personnelMetrics = [
  { label: '月度隐患总数', value: '≥90' },
  { label: '设备闭环处置率', value: '100%' },
  { label: '消防通道畅通率', value: '100%' },
  { label: '电瓶车告警率', value: '≥95%' },
]

export function getKpiByDefense(defense: '人防数据' | '技防数据', period: 'day' | 'month' | 'year') {
  const factor = period === 'day' ? 0.3 : period === 'year' ? 3 : 1
  if (defense === '人防数据') {
    return [
      { label: '待处置', value: Math.round(45 * factor) },
      { label: '处置超时', value: Math.round(22 * factor) },
      { label: '事件上报', value: Math.round(28 * factor) },
      { label: '人员告警', value: Math.round(15 * factor) },
    ]
  }
  return [
    { label: '待处置', value: Math.round(145 * factor) },
    { label: '处置超时', value: Math.round(75 * factor) },
    { label: '设备告警', value: Math.round(76 * factor) },
    { label: '事件上报', value: Math.round(15 * factor) },
  ]
}

export function getLevelDistribution() {
  return [
    { name: '一级告警', value: 26.9 },
    { name: '二级告警', value: 22.5 },
    { name: '三级告警', value: 20.1 },
    { name: '四级告警', value: 18.3 },
    { name: '五级告警', value: 12.2 },
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
  return {
    x: ['1月', '2月', '3月', '4月', '5月', '6月'],
    data: [320, 280, 350, 410, 380, 420],
  }
}
