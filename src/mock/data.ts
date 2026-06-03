export const pointRows = [
  { id: 'PT202605140002', name: '室外2F配电间', desc: '', plot: '双翼大厦', location: '1号楼/2F/配电间', tag: 'NFC' },
  { id: 'PT202605140001', name: '1F生活水泵房', desc: '', plot: '双翼大厦', location: '1号楼/1F/生活水泵房', tag: 'NFC' },
  { id: 'PT202605130003', name: 'B2F消防泵房', desc: '', plot: '双翼大厦', location: '1号楼/B2F/消防泵房', tag: 'NFC' },
  { id: 'PT202604280002', name: 'B1F高配间', desc: '', plot: '中期大厦', location: '1号楼/B1F/高压配电间', tag: 'NFC' },
  { id: 'PT202604280001', name: '29F电梯机房', desc: '', plot: '中期大厦', location: '1号楼/29F/电梯机房', tag: 'NFC' },
  { id: 'PT202604270080', name: '1F大堂', desc: '', plot: '天山路473号', location: '1号楼/1F/大堂', tag: 'NFC' },
  { id: 'PT202604270079', name: 'B1F停车场', desc: '', plot: '天山路473号', location: '1号楼/B1F/停车场', tag: 'NFC' },
  { id: 'PT202604270078', name: '1F厨房（麦当劳）', desc: '', plot: '双翼大厦', location: '1号楼/1F/厨房（麦当劳）', tag: 'NFC' },
  { id: 'PT202604270077', name: '2F办公区', desc: '', plot: '双翼大厦', location: '1号楼/2F/办公区', tag: 'NFC' },
  { id: 'PT202604270076', name: '屋顶设备层', desc: '', plot: '中期大厦', location: '1号楼/屋顶/设备层', tag: 'NFC' },
]

export const programRows = [
  { id: 'INPR202605290001', name: '锅炉房安全检查', notes: '', creator: '管理员1', time: '2026-05-29 10:15:22' },
  { id: 'INPR202605280002', name: '电梯机房检查', notes: '', creator: '管理员1', time: '2026-05-28 14:30:11' },
  { id: 'INPR202605270003', name: '消防泵房检查', notes: '', creator: '管理员1', time: '2026-05-27 09:20:45' },
  { id: 'INPR202605260004', name: '配电间安全检查', notes: '', creator: '管理员1', time: '2026-05-26 16:45:33' },
  { id: 'INPR202605250005', name: '厨房卫生安全检查', notes: '', creator: '管理员1', time: '2026-05-25 11:10:08' },
  { id: 'INPR202605240006', name: '停车场安全检查', notes: '', creator: '管理员1', time: '2026-05-24 13:25:17' },
  { id: 'INPR202605230007', name: '办公区消防检查', notes: '', creator: '管理员1', time: '2026-05-23 08:55:42' },
  { id: 'INPR202605220008', name: '屋顶设备检查', notes: '', creator: '管理员1', time: '2026-05-22 15:40:29' },
  { id: 'INPR202605210009', name: '大堂安全检查', notes: '', creator: '管理员1', time: '2026-05-21 10:05:56' },
  { id: 'INPR202605200010', name: '生活水泵房检查', notes: '', creator: '管理员1', time: '2026-05-20 17:30:14' },
]

export const inspectionTree = [
  {
    title: '现场安全检查表',
    key: 'root',
    children: [
      { title: '1、灭火器、墙式消防栓', key: '1' },
      { title: '2、安全疏散、仓库（应急照明灯、疏散通道、标识）', key: '2' },
      { title: '3、消防监控室', key: '3' },
      { title: '4、水泵房、消防设备、特种设备', key: '4' },
      { title: '5、防火门', key: '5' },
      { title: '6、防台防汛设施', key: '6' },
      { title: '7、高压配电房、电气线路、移动设备', key: '7' },
      { title: '8、仓库管理', key: '8' },
      { title: '9、电瓶车充电', key: '9' },
    ],
  },
]

export const projectSettingRows = [
  { name: '中期大厦29F机房及电梯机房安全检查', plot: '中期大厦', category: '物业', desc: '', points: 1, status: '启用' },
  { name: '双翼大厦1F机电房安全检查', plot: '双翼大厦', category: '物业', desc: '', points: 3, status: '启用' },
  { name: '天山路473号B1F停车场检查', plot: '天山路473号', category: '租赁', desc: '', points: 2, status: '启用' },
  { name: '中期大厦B1F高配间检查', plot: '中期大厦', category: '物业', desc: '', points: 1, status: '启用' },
  { name: '双翼大厦2F办公区检查', plot: '双翼大厦', category: '租赁', desc: '', points: 2, status: '启用' },
]

export const planRows = [
  { plan: '双翼大厦1F机电房安全检查', name: '双翼大厦1F机电房安全检查', category: '巡查', inspectors: '郭仲伟, 徐兴庆', plot: '双翼大厦', publisher: '管理员1', start: '2026-05-20', end: '2027-12-31', cycle: '1次/1周', next: '2026-06-03 14:00:00', desc: '', status: '启用' },
  { plan: '中期大厦29F电梯机房检查', name: '中期大厦29F电梯机房检查', category: '巡查', inspectors: '冯晓, 郑晋军', plot: '中期大厦', publisher: '管理员1', start: '2026-05-15', end: '2027-12-31', cycle: '1次/2周', next: '2026-06-10 09:00:00', desc: '', status: '启用' },
  { plan: '天山路473号消防检查', name: '天山路473号消防检查', category: '巡查', inspectors: '武言民', plot: '天山路473', publisher: '管理员1', start: '2026-05-01', end: '2027-06-30', cycle: '1次/1周', next: '2026-06-05 10:30:00', desc: '', status: '启用' },
]

export const workOrderRows = [
  { orderId: 'WO202606010001', plan: '双翼大厦1F机电房安全检查', category: '巡查', plot: '双翼大厦', name: '双翼大厦1F机电房安全检查', points: 3, inspector: '郭仲伟, 徐兴庆', startTime: '2026-06-01 09:00:00', status: '待处理' },
  { orderId: 'WO202606010002', plan: '中期大厦29F电梯机房检查', category: '巡查', plot: '中期大厦', name: '中期大厦29F电梯机房检查', points: 1, inspector: '冯晓, 郑晋军', startTime: '2026-06-01 10:30:00', status: '处理中' },
  { orderId: 'WO202605310003', plan: '天山路473号消防检查', category: '巡查', plot: '天山路473', name: '天山路473号消防检查', points: 2, inspector: '武言民', startTime: '2026-05-31 14:20:00', status: '已完成' },
  { orderId: 'WO202605300004', plan: '北京华路配电检查', category: '巡查', plot: '北京华路', name: '配电间月度检查', points: 1, inspector: '李明', startTime: '2026-05-30 11:00:00', status: '已取消' },
]

export const allInspectionRows = [
  { orderId: '082ec50a6fec43e-XJ-202606010029', plan: '中期大厦29F机电隔间及电梯机房安全检查', category: '巡查', plot: '中期大厦', name: '中期大厦27层电梯厅安全检查', points: 1, inspector: '冯晓, 郑晋军', startTime: '2026-06-01 10:30:00', status: '待处理' },
  { orderId: '082ec50a6fec43e-XJ-202606010028', plan: '双翼大厦1F机电房安全检查', category: '巡查', plot: '双翼大厦', name: '双翼大厦1F机电房安全检查', points: 3, inspector: '郭仲伟, 徐兴庆', startTime: '2026-06-01 09:00:00', status: '已完成' },
  { orderId: '082ec50a6fec43e-XJ-202605310027', plan: '天山路473消防巡查', category: '巡查', plot: '礼田路', name: '礼田路消防通道检查', points: 2, inspector: '武言民', startTime: '2026-05-31 14:20:00', status: '已完成' },
  { orderId: '082ec50a6fec43e-XJ-202605300026', plan: '北京华路配电检查', category: '巡查', plot: '北京华路', name: '配电间月度检查', points: 1, inspector: '李明', startTime: '2026-05-30 11:00:00', status: '待处理' },
]

export const contentConfigTree = [
  {
    key: '1',
    item: '现场安全检查表',
    category: '消防设施',
    safetyLevel: '一级',
    tenSigns: '消防通道',
    sort: 0,
    remark: '',
    updater: 'admin',
    updateTime: '2025-12-12 13:45:19',
    children: [
      {
        key: '1-1',
        item: '一 灭火器、墙式消防栓',
        category: '消防设施',
        safetyLevel: '一级',
        tenSigns: '消防通道',
        sort: 0,
        remark: '',
        updater: 'admin',
        updateTime: '2025-12-12 13:45:19',
        children: [
          {
            key: '1-1-1',
            item: '1、灭火器（每组2支）放置于固定便于取用指定场所并有每月检查记录',
            category: '消防设施',
            safetyLevel: '二级',
            tenSigns: '消防通道',
            sort: 0,
            remark: '',
            updater: 'admin',
            updateTime: '2025-12-12 13:45:19',
          },
        ],
      },
    ],
  },
]

export const dictRows = [
  { code: 'park.card_type', name: '停车卡类型', sort: -1, archived: '否' },
  { code: 'status_category', name: '工单状态', sort: 0, archived: '否' },
  { code: 'device_status', name: '设备状态', sort: 1, archived: '否' },
  { code: 'work_flow_match_level', name: '工作流程匹配层级', sort: 1, archived: '否' },
  { code: 'safety_category', name: '安全类别', sort: 1, archived: '否' },
  { code: 'safety_level', name: '安全等级', sort: 2, archived: '否' },
  { code: 'management_category', name: '管理类别', sort: 2, archived: '否' },
  { code: 'rectification_measure', name: '整改措施', sort: 3, archived: '否' },
  { code: 'alarm_level', name: '告警级别', sort: 3, archived: '否' },
  { code: 'alarm_status', name: '告警状态', sort: 4, archived: '否' },
]

export const safetyLevelOptions = ['一级', '二级', '三级', '四级']

export const categoryPieData = [
  { name: '安全类型', value: 2 },
  { name: '消防设施', value: 8 },
  { name: '电气', value: 5 },
  { name: '指示标志', value: 3 },
  { name: '其他', value: 4 },
  { name: '特种设备', value: 2 },
  { name: '教育培训', value: 1 },
  { name: '场所环境', value: 6 },
  { name: '设备设施', value: 7 },
  { name: '生活环境', value: 3 },
  { name: '施工作业', value: 2 },
  { name: '危险源头', value: 4 },
  { name: '治安保卫', value: 2 },
]

export const rectificationPieData = [
  { name: '未处理', value: 12 },
  { name: '处理中', value: 8 },
  { name: '处理完成', value: 25 },
]

export function getLineDataByMonth(year: number, month: number) {
  const days = new Date(year, month, 0).getDate()
  const data: number[] = []
  for (let d = 1; d <= days; d++) {
    if (d === 1) data.push(16)
    else if (d === 2) data.push(0)
    else data.push(0)
  }
  return { days, data }
}

export const alarmListRows = [
  { id: 'AL20260601001', level: '紧急', device: '消防主机-双翼大厦', content: '烟感报警', time: '2026-06-01 08:12:33', status: '未处理' },
  { id: 'AL20260601002', level: '重要', device: '配电柜-中期大厦', content: '温度过高', time: '2026-06-01 09:45:11', status: '处理中' },
  { id: 'AL20260601003', level: '一般', device: '电梯-29F', content: '运行异常', time: '2026-06-01 11:20:05', status: '已处理' },
]

export const facilityOrderRows = [
  { id: 'SG20260601001', title: '空调维修', plot: '双翼大厦', applicant: '张三', time: '2026-06-01 10:00:00', status: '待派工' },
  { id: 'SG20260601002', title: '照明更换', plot: '中期大厦', applicant: '李四', time: '2026-06-01 14:30:00', status: '进行中' },
]
