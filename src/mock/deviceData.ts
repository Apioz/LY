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

/** 消防设备资产分类可选值 */
export const FIRE_DEVICE_ASSET_CATEGORIES = [...ALARM_DEVICE_CATEGORIES['消防设备']] as const

/** 安防监控资产分类可选值 */
export const MONITOR_DEVICE_ASSET_CATEGORIES = [...ALARM_DEVICE_CATEGORIES['安防监控']] as const

/** @deprecated 使用 FIRE_DEVICE_ASSET_CATEGORIES */
export const FIRE_DEVICE_MONITOR_TYPES = FIRE_DEVICE_ASSET_CATEGORIES

/** @deprecated 使用 MONITOR_DEVICE_ASSET_CATEGORIES */
export const MONITOR_DEVICE_MONITOR_TYPES = MONITOR_DEVICE_ASSET_CATEGORIES

export interface FireDeviceRow {
  key: string
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
  registerAddress?: string
  model?: string
  brand?: string
  bindStatus: string
  monitorStatus: string
  enableStatus: string
}

export interface MonitorDeviceRow {
  key: string
  location: string
  /** 资产分类 */
  ID_资产分类: (typeof MONITOR_DEVICE_ASSET_CATEGORIES)[number]
  /** 设备类型 */
  ID_设备类型?: string
  networkAddress?: string
  deviceName: string
  deviceNo: string
  serialNo?: string
  channelNo: string
  registerAddress?: string
  model?: string
  brand?: string
  bindStatus: string
  monitorStatus: string
  enableStatus: string
}

export const fireDeviceRows: FireDeviceRow[] = [
  {
    key: '1',
    location: '工程楼3F/1F/空调热水循环泵P-204机房',
    ID_资产分类: '烟感探测器',
    ID_设备类型: '消防设备',
    deviceName: '空调热水循环泵P-204',
    deviceNo: 'P-204',
    channelNo: '1',
    bindStatus: '已绑定',
    monitorStatus: '在线',
    enableStatus: '未启用',
  },
  {
    key: '2',
    location: '工程楼2F/消防控制室/主机机柜',
    ID_资产分类: '消防主机',
    ID_设备类型: '消防设备',
    deviceName: '火灾报警控制器',
    deviceNo: 'FAC-001',
    channelNo: '1',
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
    location: '研发实验室5A/1F/南侧大门入口',
    ID_资产分类: '监控摄像头',
    ID_设备类型: '安防监控',
    deviceName: 'Camera-SKJ-001',
    deviceNo: 'SZ-007_SZ-007',
    serialNo: 'SZ-007',
    channelNo: '1',
    registerAddress: '192.168.20.204',
    brand: '海康',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
  {
    key: '2',
    location: '研发实验室5A/1F/4号与5号电梯厅中间',
    ID_资产分类: '监控摄像头',
    ID_设备类型: '安防监控',
    deviceName: '4号与5号电梯厅中间半球',
    deviceNo: 'SZ-008_SZ-008',
    serialNo: 'SZ-008',
    channelNo: '1',
    registerAddress: '192.168.20.205',
    brand: '海康',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
  {
    key: '3',
    location: '双翼大厦/1F/主入口门厅',
    ID_资产分类: '门禁系统',
    ID_设备类型: '安防监控',
    deviceName: '主入口门禁摄像头',
    deviceNo: 'SZ-009_SZ-009',
    serialNo: 'SZ-009',
    channelNo: '2',
    registerAddress: '192.168.20.206',
    brand: '海康',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
  {
    key: '4',
    location: '森林湾大厦/B1F/车库通道A',
    ID_资产分类: '监控摄像头',
    ID_设备类型: '安防监控',
    deviceName: '车库通道枪机-A12',
    deviceNo: 'SZ-010_SZ-010',
    serialNo: 'SZ-010',
    channelNo: '1',
    registerAddress: '192.168.20.207',
    brand: '大华',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
  {
    key: '5',
    location: '中期大厦/屋顶/设备平台西侧',
    ID_资产分类: '监控摄像头',
    ID_设备类型: '安防监控',
    deviceName: '屋顶监控云台',
    deviceNo: 'SZ-011_SZ-011',
    serialNo: 'SZ-011',
    channelNo: '1',
    registerAddress: '192.168.20.208',
    brand: '海康',
    bindStatus: '已绑定',
    monitorStatus: '正常',
    enableStatus: '未启用',
  },
]

export const monitorTreeData = [
  {
    title: '东楼 (138)',
    key: 'building-east',
    children: [
      {
        title: '1F (35)',
        key: 'floor-1f',
        children: [
          { title: '门卫、消控室 (8)', key: 'area-guard', isLeaf: true },
          { title: '候梯厅 (6)', key: 'area-elevator', isLeaf: true },
          { title: '走道 (12)', key: 'area-corridor', isLeaf: true },
        ],
      },
      {
        title: 'B1F (20)',
        key: 'floor-b1f',
        children: [{ title: '地库消防控制室 (5)', key: 'area-b1-fire', isLeaf: true }],
      },
    ],
  },
]
