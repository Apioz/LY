export const fireDeviceStats = [
  { label: '消防设备总数（个）', value: 2 },
  { label: '待绑定空间数（个）', value: 0 },
  { label: '已绑定空间数（个）', value: 2 },
]

export const monitorDeviceStats = [
  { label: '总数', value: 150 },
  { label: '待绑定数', value: 0 },
  { label: '已绑定数', value: 150 },
  { label: '正常状态数', value: 150 },
  { label: '异常状态数', value: 0 },
]

import { ALARM_DEVICE_CATEGORIES } from '../pages/alarm/constants'
import { normalizeCommunity } from '../constants/communities'

/** 消防设备资产类型可选值 */
export const FIRE_DEVICE_ASSET_CATEGORIES = [
  ...ALARM_DEVICE_CATEGORIES['消防设备'],
  '消防水泵',
  '生活水泵',
] as const

/** 安防监控资产分类可选值 */
export const MONITOR_DEVICE_ASSET_CATEGORIES = [...ALARM_DEVICE_CATEGORIES['安防监控']] as const

/** @deprecated 使用 FIRE_DEVICE_ASSET_CATEGORIES */
export const FIRE_DEVICE_MONITOR_TYPES = FIRE_DEVICE_ASSET_CATEGORIES

/** @deprecated 使用 MONITOR_DEVICE_ASSET_CATEGORIES */
export const MONITOR_DEVICE_MONITOR_TYPES = MONITOR_DEVICE_ASSET_CATEGORIES

export interface FireDeviceRow {
  key: string
  /** 小区名称 */
  community: string
  location: string
  /** 资产分类 */
  ID_资产分类: (typeof FIRE_DEVICE_ASSET_CATEGORIES)[number]
  /** 设备类型 */
  ID_设备类型?: string
  dockAddress?: string
  deviceName: string
  deviceNo: string
  serialNo?: string
  channelNo: string
  ipAddress?: string
  model?: string
  brand?: string
  bindStatus: string
  monitorStatus: string
  enableStatus: string
}

export interface MonitorDeviceRow {
  key: string
  /** 小区名称 */
  community: string
  location: string
  /** 资产类型 */
  ID_资产分类: (typeof MONITOR_DEVICE_ASSET_CATEGORIES)[number]
  /** 设备类型 */
  ID_设备类型?: string
  /** 对接地址 */
  dockAddress?: string
  networkAddress?: string
  deviceName: string
  deviceNo: string
  serialNo?: string
  channelNo: string
  ipAddress?: string
  model?: string
  brand?: string
  bindStatus: string
  monitorStatus: string
  enableStatus: string
  /** 平台账号 */
  account?: string
  /** 平台密码 */
  password?: string
}

export const fireDeviceRows: FireDeviceRow[] = [
  {
    key: '1',
    community: '双翼大厦',
    location: '工程楼 / 3F / 空调热水循环泵P-204机房',
    ID_资产分类: '生活水泵',
    ID_设备类型: '消防水泵',
    dockAddress: 'MODBUS-001',
    deviceName: '空调热水循环泵P-204',
    deviceNo: 'P-204',
    serialNo: 'SN-P204-2024',
    channelNo: '1',
    ipAddress: '192.168.10.101',
    brand: '格兰富',
    model: 'CR15-5',
    bindStatus: '已绑定',
    monitorStatus: '在线',
    enableStatus: '未启用',
  },
  {
    key: '2',
    community: '双翼大厦',
    location: '工程楼 / 2F / 消防控制室主机机柜',
    ID_资产分类: '消防主机',
    ID_设备类型: '火灾报警控制器',
    dockAddress: 'FAC-HOST-001',
    deviceName: '火灾报警控制器',
    deviceNo: 'FAC-001',
    serialNo: 'SN-FAC-001',
    channelNo: '1',
    ipAddress: '192.168.10.102',
    brand: '海湾',
    model: 'GST5000',
    bindStatus: '已绑定',
    monitorStatus: '在线',
    enableStatus: '未启用',
  },
]

export const fireEventAlarmRows = [
  {
    key: '1',
    time: '2026-06-03 10:15:22',
    fireCode: 'P-204',
    fireName: '空调热水循环泵P-204',
    alarmType: '火灾报警',
  },
  {
    key: '2',
    time: '2026-06-02 14:30:11',
    fireCode: 'FAC-001',
    fireName: '火灾报警控制器',
    alarmType: '故障报警',
  },
]

export const monitorDeviceRows: MonitorDeviceRow[] = [
  {
    key: '1',
    community: normalizeCommunity(undefined, '东楼 / 1F / 东楼室外南-1F-00009') || '双翼大厦',
    location: '东楼 / 1F / 东楼室外南-1F-00009',
    ID_资产分类: '监控摄像头',
    ID_设备类型: '枪机',
    dockAddress: '34020000001320012158',
    deviceName: '东楼一层南门出入口3',
    deviceNo: '34020000001320012158_34020000001320012158',
    serialNo: '34020000001320012158',
    channelNo: '1',
    ipAddress: '192.168.12.158',
    brand: '皓维',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
  {
    key: '2',
    community: normalizeCommunity(undefined, '研发实验室5A/1F/4号与5号电梯厅中间') || '中期大厦',
    location: '研发实验室5A/1F/4号与5号电梯厅中间',
    ID_资产分类: '监控摄像头',
    ID_设备类型: '安防监控',
    dockAddress: 'SZ-008',
    deviceName: '4号与5号电梯厅中间半球',
    deviceNo: 'SZ-008_SZ-008',
    serialNo: 'SZ-008',
    channelNo: '1',
    ipAddress: '192.168.20.205',
    brand: '海康',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
  {
    key: '3',
    community: '双翼大厦',
    location: '双翼大厦/1F/主入口门厅',
    ID_资产分类: '门禁系统',
    ID_设备类型: '安防监控',
    dockAddress: 'SZ-009',
    deviceName: '主入口门禁摄像头',
    deviceNo: 'SZ-009_SZ-009',
    serialNo: 'SZ-009',
    channelNo: '2',
    ipAddress: '192.168.20.206',
    brand: '海康',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
  {
    key: '4',
    community: '森林湾大厦',
    location: '森林湾大厦/B1F/车库通道A',
    ID_资产分类: '监控摄像头',
    ID_设备类型: '安防监控',
    dockAddress: 'SZ-010',
    deviceName: '车库通道枪机-A12',
    deviceNo: 'SZ-010_SZ-010',
    serialNo: 'SZ-010',
    channelNo: '1',
    ipAddress: '192.168.20.207',
    brand: '大华',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
  {
    key: '5',
    community: '中期大厦',
    location: '中期大厦/屋顶/设备平台西侧',
    ID_资产分类: '监控摄像头',
    ID_设备类型: '安防监控',
    dockAddress: 'SZ-011',
    deviceName: '屋顶监控云台',
    deviceNo: 'SZ-011_SZ-011',
    serialNo: 'SZ-011',
    channelNo: '1',
    ipAddress: '192.168.20.208',
    brand: '海康',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
]

export const fireLocationCascaderOptions = [
  {
    value: '工程楼',
    label: '工程楼',
    children: [
      {
        value: '3F',
        label: '3F',
        children: [{ value: '空调热水循环泵P-204机房', label: '空调热水循环泵P-204机房' }],
      },
      {
        value: '2F',
        label: '2F',
        children: [{ value: '消防控制室主机机柜', label: '消防控制室主机机柜' }],
      },
    ],
  },
]

export const monitorLocationCascaderOptions = [
  {
    value: '东楼',
    label: '东楼',
    children: [
      {
        value: '1F',
        label: '1F',
        children: [
          { value: '东楼室外南-1F-00009', label: '东楼室外南-1F-00009' },
          { value: '门卫、消控室', label: '门卫、消控室' },
          { value: '候梯厅', label: '候梯厅' },
        ],
      },
      {
        value: 'B1F',
        label: 'B1F',
        children: [{ value: '地库消防控制室', label: '地库消防控制室' }],
      },
    ],
  },
  {
    value: '研发实验室5A',
    label: '研发实验室5A',
    children: [
      {
        value: '1F',
        label: '1F',
        children: [{ value: '南侧大门入口', label: '南侧大门入口' }],
      },
    ],
  },
  {
    value: '双翼大厦',
    label: '双翼大厦',
    children: [
      {
        value: '1F',
        label: '1F',
        children: [{ value: '主入口门厅', label: '主入口门厅' }],
      },
    ],
  },
]

export interface MonitorTreeNode {
  title: string
  key: string
  community?: string
  building?: string
  isLeaf?: boolean
  children?: MonitorTreeNode[]
}

/** 资源监控设备树：小区 → 楼栋 → 楼层 → 区域 */
export const monitorTreeData: MonitorTreeNode[] = [
  {
    title: '双翼大厦 (138)',
    key: 'community-shuangyi',
    community: '双翼大厦',
    children: [
      {
        title: '东楼 (98)',
        key: 'shuangyi-east',
        community: '双翼大厦',
        building: '东楼',
        children: [
          {
            title: '1F (35)',
            key: 'shuangyi-east-1f',
            children: [
              { title: '门卫、消控室 (8)', key: 'shuangyi-east-guard', isLeaf: true },
              { title: '候梯厅 (6)', key: 'shuangyi-east-elevator', isLeaf: true },
              { title: '走道 (12)', key: 'shuangyi-east-corridor', isLeaf: true },
            ],
          },
          {
            title: 'B1F (20)',
            key: 'shuangyi-east-b1f',
            children: [{ title: '地库消防控制室 (5)', key: 'shuangyi-east-b1-fire', isLeaf: true }],
          },
          {
            title: '2F (43)',
            key: 'shuangyi-east-2f',
            children: [
              { title: '配电间 (18)', key: 'shuangyi-east-power', isLeaf: true },
              { title: '消防通道 (25)', key: 'shuangyi-east-fire-pass', isLeaf: true },
            ],
          },
        ],
      },
      {
        title: 'B栋 (40)',
        key: 'shuangyi-b',
        community: '双翼大厦',
        building: 'B栋',
        children: [
          {
            title: '客梯机房 (12)',
            key: 'shuangyi-b-elevator',
            isLeaf: true,
          },
          {
            title: '1F (28)',
            key: 'shuangyi-b-1f',
            children: [
              { title: '主入口门厅 (10)', key: 'shuangyi-b-lobby', isLeaf: true },
              { title: '消防控制室 (18)', key: 'shuangyi-b-fire-room', isLeaf: true },
            ],
          },
        ],
      },
    ],
  },
  {
    title: '中期大厦 (52)',
    key: 'community-zhongqi',
    community: '中期大厦',
    children: [
      {
        title: '主楼 (52)',
        key: 'zhongqi-main',
        community: '中期大厦',
        building: '主楼',
        children: [
          {
            title: '29F (8)',
            key: 'zhongqi-29f',
            children: [{ title: '电梯机房 (8)', key: 'zhongqi-elevator-room', isLeaf: true }],
          },
          {
            title: 'B1F (24)',
            key: 'zhongqi-b1f',
            children: [
              { title: '高压配电间 (14)', key: 'zhongqi-power', isLeaf: true },
              { title: '生活泵房 (10)', key: 'zhongqi-pump', isLeaf: true },
            ],
          },
          {
            title: '屋顶 (20)',
            key: 'zhongqi-roof',
            children: [{ title: '设备平台 (20)', key: 'zhongqi-roof-platform', isLeaf: true }],
          },
        ],
      },
    ],
  },
  {
    title: '森林湾大厦 (36)',
    key: 'community-senlinwan',
    community: '森林湾大厦',
    children: [
      {
        title: 'A栋 (36)',
        key: 'senlinwan-a',
        community: '森林湾大厦',
        building: 'A栋',
        children: [
          {
            title: '3F (16)',
            key: 'senlinwan-a-3f',
            children: [{ title: '消防通道 (16)', key: 'senlinwan-a-fire-pass', isLeaf: true }],
          },
          {
            title: 'B2F (20)',
            key: 'senlinwan-a-b2f',
            children: [
              { title: '生活泵房 (12)', key: 'senlinwan-a-pump', isLeaf: true },
              { title: '车库监控 (8)', key: 'senlinwan-a-garage', isLeaf: true },
            ],
          },
        ],
      },
    ],
  },
]

function parseTreeNodeCount(title: string) {
  const match = title.match(/\((\d+)\)\s*$/)
  return match ? Number(match[1]) : 0
}

/** 资源监控汇总（按小区节点统计） */
export function getMonitorTreeSummary() {
  const total = monitorTreeData.reduce((sum, node) => sum + parseTreeNodeCount(node.title), 0)
  const online = Math.max(0, total - 5)
  return { total, online, offline: total - online }
}

/** 根据树节点 key 解析小区名称 / 楼栋路径 */
export function resolveMonitorTreePath(
  key: string,
  nodes: MonitorTreeNode[] = monitorTreeData,
  trail: { community?: string; building?: string; labels: string[] } = { labels: [] },
): { community?: string; building?: string; path: string } | null {
  for (const node of nodes) {
    const next = {
      community: node.community ?? trail.community,
      building: node.building ?? trail.building,
      labels: [...trail.labels, node.title.replace(/\s*\(\d+\)\s*$/, '')],
    }
    if (node.key === key) {
      return {
        community: next.community,
        building: next.building,
        path: next.labels.join(' / '),
      }
    }
    if (node.children?.length) {
      const found = resolveMonitorTreePath(key, node.children, next)
      if (found) return found
    }
  }
  return null
}
