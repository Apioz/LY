export const fireDeviceStats = [
  { label: '消防设备总数（个）', value: 128 },
  { label: '待绑定空间数（个）', value: 12 },
  { label: '已绑定空间数（个）', value: 116 },
]

export const monitorDeviceStats = [
  { label: '总数', value: 460 },
  { label: '待绑定数', value: 0 },
  { label: '已绑定数', value: 460 },
  { label: '正常状态数', value: 460 },
  { label: '异常状态数', value: 0 },
]

export const fireDeviceRows = [
  {
    key: '1',
    spaceCode: 'HNYHY-F001',
    location: '东楼/1F/消控室',
    category: '烟感',
    deviceName: '烟感探测器-A01',
    fireCode: 'XF202601001',
    fireName: '一层大厅烟感',
    bindStatus: '已绑定',
    enableStatus: '已启用',
  },
  {
    key: '2',
    spaceCode: 'HNYHY-F002',
    location: '东楼/B1F/消防泵房',
    category: '消防主机',
    deviceName: '消防报警主机',
    fireCode: 'XF202601002',
    fireName: 'B1F消防主机',
    bindStatus: '待绑定',
    enableStatus: '未启用',
  },
]

export const fireEventAlarmRows = [
  {
    key: '1',
    time: '2026-06-03 10:15:22',
    fireCode: 'XF202601001',
    fireName: '一层大厅烟感',
    alarmType: '火灾报警',
  },
  {
    key: '2',
    time: '2026-06-02 14:30:11',
    fireCode: 'XF202601002',
    fireName: 'B1F消防主机',
    alarmType: '故障报警',
  },
]

export const monitorDeviceRows = [
  {
    key: '1',
    spaceCode: 'HNYHY-E001',
    location: '东楼/1F/东楼外侧南大门入口3',
    assetCode: 'HNYHY-E001',
    assetName: '1080P智能半球',
    deviceNo: '34020000001320000001',
    deviceName: '东楼1层南大门入口3',
    monitorStatus: '正常',
    enableStatus: '未启用',
    protocol: 'API',
    brand: '海康',
  },
  {
    key: '2',
    spaceCode: 'HNYHY-E002',
    location: '东楼/1F/门卫消控室',
    assetCode: 'HNYHY-E002',
    assetName: '人脸识别半球',
    deviceNo: '34020000001320000002',
    deviceName: '东楼1层门卫消控室',
    monitorStatus: '正常',
    enableStatus: '未启用',
    protocol: 'API',
    brand: '海康',
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
