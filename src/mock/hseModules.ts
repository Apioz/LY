export const safetyNormRows = [
  { key: '1', name: '安全规范', type: '规范', uploadTime: '2025-12-29 10:39:48' },
  { key: '2', name: '施工操作流程', type: '流程', uploadTime: '2025-12-29 10:39:18' },
  { key: '3', name: '华谊安全生产制度', type: '制度', uploadTime: '2025-12-29 10:38:46' },
]

export const trainingMaterialRows = [
  { key: '1', name: '学习资料', type: '事故教育', uploader: '管理员000000', uploadTime: '2025-12-29 22:11:11' },
  { key: '2', name: 'KYT手册', type: 'KYT隐患案例', uploader: '管理员000000', uploadTime: '2025-12-29 22:10:30' },
]

export const personnelQualRows = [
  {
    key: '1',
    name: '陈敏华',
    empId: '10001',
    certName: '安全管理员',
    certNo: '310101199001011234',
    obtainDate: '2020-05-10',
    expireDate: '2024-05-09',
    recertDate: '',
    authority: '上海市化工行业协会',
    overdue: true,
  },
  {
    key: '2',
    name: '赵五',
    empId: '10002',
    certName: '安全负责人',
    certNo: '310101198805121122',
    obtainDate: '2021-08-15',
    expireDate: '2026-08-14',
    recertDate: '',
    authority: '上海市应急管理局',
    overdue: false,
  },
]

export const drillPlanColumns = [
  '演练编号',
  '预案演练主题(名称)',
  '演练时间',
  '演练方式',
  '直接投入(万元)',
  '组织部门',
  '预案类型',
  '演练级别',
  '完成时间(计划)',
  '参与人数(计划)',
  '创建人',
  '创建时间',
]

export const archiveProjectRows = [
  {
    key: '1',
    plotNo: 'BAE71Bdd3D2',
    plotName: '天山路473',
    abbr: 'TSL',
    address: '天山路473号',
    center: '南区租赁管理中心',
    category: '多业态混合生产经营场所',
    charger: '张三',
    responsible: '李四',
    maintain: 0,
    renovation: 0,
    lease: 0,
    updateTime: '2024-04-15 10:00:00',
  },
  {
    key: '2',
    plotNo: 'BBX001',
    plotName: '双翼大厦',
    abbr: 'SFDX',
    address: '双翼大厦',
    center: '中区物业管理中心',
    category: '人流密集场所',
    charger: '王五',
    responsible: '赵六',
    maintain: 1,
    renovation: 2,
    lease: 0,
    updateTime: '2024-01-20 14:30:00',
  },
]

export const projectMaintenanceRows = [
  {
    key: '1',
    projectNo: 'SLWDS-JWX-007',
    name: '水箱维修',
    plot: '森林湾大厦',
    location: 'B栋/RF/电梯机房1',
    type: '工程项目',
    manager: '陈敏华',
    updateTime: '2024-03-10 09:00:00',
  },
  {
    key: '2',
    projectNo: 'BBX-JWX-001',
    name: '联航办公楼1号楼食堂维修',
    plot: '北亚光路',
    location: '1号楼/1F/食堂',
    type: '检维修项目',
    manager: '赵五',
    updateTime: '2024-02-18 16:20:00',
  },
]

export const renovationRows = [
  {
    key: '1',
    projectNo: 'BBXL-ECZX-002',
    name: '保险养老院3号楼外立面',
    plot: '北宝兴路',
    type: '维修项目',
    manager: '周五',
    updateTime: '2023-12-18 17:00:45',
  },
]

export const specialEquipmentStats = [
  { label: '设备总数', value: 108 },
  { label: '临期提醒（3个月内）', value: 13 },
  { label: '逾期提醒', value: 13 },
]

export const specialEquipmentRows = [
  {
    key: '1',
    equipType: '曳引与强制驱动电梯',
    equipName: '曳引驱动乘客电梯',
    certNo: '梯11PL07204(19)',
    sap: '是',
    manufacturer: '上海三菱电梯',
    model: 'LEHY-M',
    propertyUnit: '华谊集团',
    usageUnit: '双翼大厦',
    manageUnit: '中区物管中心',
    highlight: true,
  },
]

export const gasEquipmentStats = [
  { label: '设备总数（个）', value: 25 },
  { label: '临期提醒（3个月内）', value: 8 },
  { label: '逾期提醒（个）', value: 17 },
]

export const gasEquipmentRows = [
  {
    key: '1',
    address: '天山路473号',
    tenant: '上海证大酒店',
    format: '酒店',
    rating: 'A',
    useGas: '是',
    alarm: '是',
    fireEquip: '是',
    lastInspect: '2025-01-10',
    nextInspect: '2026-01-09',
    highlight: true,
  },
]

export const chargingPileRows = [
  {
    key: '1',
    dept: '西区物管中心',
    address: '辽河西路50号',
    pileNo: '——',
    place: 'outdoor_parking_shed',
    count: 5,
    dedicated: '是',
    leak: '是',
    fire: '是',
  },
  {
    key: '2',
    dept: '园区物管中心',
    address: '成江路788号',
    pileNo: '——',
    place: 'outdoor_parking_shed',
    count: 16,
    dedicated: '是',
    leak: '是',
    fire: '是',
  },
]
