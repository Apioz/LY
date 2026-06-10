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

/** 告警信息设置：可生成设施工单的设备类别（仅消防设备、安防监控） */
export const ALARM_FACILITY_SYNC_DEVICE_CATEGORIES: Record<string, readonly string[]> = {
  消防设备: ALARM_DEVICE_CATEGORIES['消防设备'],
  安防监控: ALARM_DEVICE_CATEGORIES['安防监控'],
}

export const ALARM_FACILITY_SYNC_DEVICES = Object.values(
  ALARM_FACILITY_SYNC_DEVICE_CATEGORIES,
).flat() as readonly string[]

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

/** 告警列表设备名称 → 告警设置二级子类映射 */
export const ALARM_DEVICE_TO_SETTINGS_SUB: Record<string, { rootCategory: string; subCategory: string }> = {
  消防主机: { rootCategory: '消防设备', subCategory: '消防主机' },
  烟感探测器: { rootCategory: '消防设备', subCategory: '烟感器' },
  温感探测器: { rootCategory: '消防设备', subCategory: '温感器' },
  防火门: { rootCategory: '消防设备', subCategory: '防火门' },
  监控摄像头: { rootCategory: '监控设备', subCategory: '监控摄像头' },
  门禁系统: { rootCategory: '监控设备', subCategory: '门禁系统' },
  生活水泵: { rootCategory: '供水设备', subCategory: '生活水泵' },
  消防水泵: { rootCategory: '供水设备', subCategory: '消防水泵' },
}

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
