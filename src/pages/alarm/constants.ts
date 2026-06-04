export const ALARM_LEVELS = ['一级告警', '二级告警', '三级告警', '四级告警'] as const
export const ALARM_STATUS = ['待处理', '已处理', '误报', '损坏'] as const
/** 告警列表-告警描述 */
export const ALARM_DESC_TYPES = ['火灾报警', '故障报警', '设备超时'] as const
/** 告警设备：一级设备类别 → 二级设备名称 */
export const ALARM_DEVICE_CATEGORIES: Record<string, readonly string[]> = {
  消防设备: ['消防主机', '烟感探测器', '温感探测器', '防火门'],
  供水设备: ['生活水泵', '消防水泵'],
  电气设备: ['配电柜'],
  垂直交通: ['电梯设备'],
  安防监控: ['门禁系统', '监控摄像头'],
}

export const ALARM_DEVICE_CASCADER_OPTIONS = Object.entries(ALARM_DEVICE_CATEGORIES).map(
  ([category, devices]) => ({
    value: category,
    label: category,
    children: devices.map((name) => ({ value: name, label: name })),
  }),
)

/** 全部设备名称（扁平列表，供筛选等使用） */
export const ALARM_DEVICES = Object.values(ALARM_DEVICE_CATEGORIES).flat() as readonly string[]

export function findDeviceCategory(deviceName: string): string | undefined {
  return Object.entries(ALARM_DEVICE_CATEGORIES).find(([, devices]) =>
    devices.includes(deviceName),
  )?.[0]
}

export function devicesToCascaderPaths(devices: string[]): string[][] {
  return devices.map((name) => {
    const category = findDeviceCategory(name)
    return category ? [category, name] : [name]
  })
}

export function cascaderPathsToDevices(paths: string[][]): string[] {
  return paths.map((path) => path[path.length - 1]).filter(Boolean)
}
export const DEFAULT_TIMEOUT_MINUTES = 30

export const LEVEL_COLORS: Record<string, string> = {
  一级告警: '#ff4d4f',
  二级告警: '#fa8c16',
  三级告警: '#fadb14',
  四级告警: '#1890ff',
  一级预警: '#ff4d4f',
  二级预警: '#fa8c16',
  三级预警: '#fadb14',
  四级预警: '#1890ff',
}

export type AlarmLevel = (typeof ALARM_LEVELS)[number]
export type AlarmStatus = (typeof ALARM_STATUS)[number]
export type AlarmDescType = (typeof ALARM_DESC_TYPES)[number]
