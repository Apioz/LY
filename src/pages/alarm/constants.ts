export const ALARM_LEVELS = ['一级告警', '二级告警', '三级告警', '四级告警', '五级告警'] as const
export const ALARM_STATUS = ['待处理', '已处理', '误报', '损坏'] as const
export const ALARM_TYPES = ['设备告警', '事件上报', '消防', '电气', '安防', '环境'] as const
export const DEFENSE_TYPES = ['人防数据', '技防数据'] as const

export const LEVEL_COLORS: Record<string, string> = {
  一级告警: '#ff4d4f',
  二级告警: '#fa8c16',
  三级告警: '#fadb14',
  四级告警: '#1890ff',
  五级告警: '#9254de',
  一级预警: '#ff4d4f',
  二级预警: '#fa8c16',
  三级预警: '#fadb14',
  四级预警: '#1890ff',
}

export type AlarmLevel = (typeof ALARM_LEVELS)[number]
export type AlarmStatus = (typeof ALARM_STATUS)[number]
