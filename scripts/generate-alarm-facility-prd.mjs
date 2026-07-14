import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'docs')
const outFile = path.join(outDir, '告警中心与设施工单模块PRD.docx')

const h1 = (text) =>
  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, bold: true })] })
const h2 = (text) =>
  new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, bold: true })] })
const h3 = (text) =>
  new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, bold: true })] })
const p = (text) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun(text)] })
const bullet = (text) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [new TextRun(text)] })
const note = (text) =>
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, italics: true, color: '666666' })],
  })

function table(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (h) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
            }),
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((c) => new TableCell({ children: [new Paragraph(String(c))] })),
          }),
      ),
    ],
  })
}

const children = [
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: '告警中心 & 设施工单模块 PRD', bold: true, size: 36 })],
  }),
  p('文档版本：基于当前原型系统代码（2026-07）'),
  p('核心数据源：src/store/alarmSync.ts、src/store/alarmListStore.ts、src/store/alarmSettingsStore.ts'),
  note('说明：本文档完全依据当前原型实现编写，描述已实现的功能、字段取值、业务逻辑与交互行为。原型阶段数据存于内存 Store，未接真实后端。'),

  h1('1. 模块概览与架构'),
  h2('1.1 模块范围'),
  table(
    ['模块', '中台页面', '路由 Key', '核心 Store'],
    [
      ['告警统计', '告警中心 → 告警统计', 'alarm-stats', 'mock/alarmData.ts（静态）'],
      ['告警列表', '告警中心 → 告警列表', 'alarm-list', 'store/alarmListStore.ts'],
      ['告警设置', '告警中心 → 告警设置', 'alarm-settings', 'store/alarmSettingsStore.ts'],
      ['设施工单', '设施工单', 'facility-work-order', 'store/alarmSync.ts'],
      ['小程序设施工单', '小程序 → 工单', '—', '同上（共享 facilityOrders）'],
    ],
  ),
  p(''),
  h2('1.2 数据流总览'),
  bullet('告警列表 (alarmListStore) → syncEligibleAlarmsToFacility（定时/规则变更触发）→ 设施工单 (alarmSync.facilityOrders)'),
  bullet('设施工单 → facilityToMiniOrder → 小程序工单列表/详情 (miniProgramData)'),
  p('单一数据源：中台设施工单与小程序设施工单共用 alarmSync.ts 中的 facilityOrders[]，通过 subscribeFacility 实时同步。流转记录 flowRecords 两端一致。'),

  h1('2. 告警中心模块'),
  h2('2.1 公共枚举与常量'),
  p('来源：src/pages/alarm/constants.ts'),
  table(
    ['枚举', '取值'],
    [
      ['告警等级 ALARM_LEVELS', '一级告警、二级告警、三级告警、四级告警'],
      ['告警状态 ALARM_STATUS', '待处理、已处理、误报、损坏'],
      ['告警描述 ALARM_DESC_TYPES', '火灾报警、故障报警、设备超时'],
      ['默认离线判定 DEFAULT_TIMEOUT_MINUTES', '30（分钟）'],
    ],
  ),
  p(''),
  h3('告警列表扩展状态（仅列表使用）'),
  table(
    ['状态', '含义', '取值来源'],
    [
      ['告警', '活跃告警但未配置工单生成', 'AlarmListItem.noWorkOrder === true'],
      ['自动解除告警', '设备恢复/接口解除后系统自动关闭', 'status === 自动解除告警 或 autoResolved === true'],
    ],
  ),

  h2('2.2 告警统计'),
  p('页面：AlarmStatistics.tsx | 数据：mock/alarmData.ts 静态 Mock，未接入告警列表 Store。'),
  bullet('切换人防数据 / 技防数据，展示实时预警列表'),
  bullet('切换日 / 月 / 年 + 日期，展示 KPI 卡片（待处置、处置超时、设备告警、事件上报）'),
  bullet('告警等级分布饼图、告警趋势折线图'),
  p('交互：点击实时预警条目打开详情 Modal（只读）。'),

  h2('2.3 告警列表'),
  p('页面：AlarmList.tsx | 数据：alarmListStore.getAlarmList()'),
  h3('2.3.1 列表字段'),
  table(
    ['列名', '字段来源'],
    [
      ['告警编号', 'id'],
      ['告警名称', 'name'],
      ['告警等级', 'level'],
      ['告警设备', 'alarmDevice（一条告警对应一个设备）'],
      ['安装位置', 'installLocation'],
      ['告警描述', 'desc'],
      ['告警状态', '见状态展示规则'],
      ['告警时间', 'time'],
      ['解除告警时间', 'releaseTime（有则展示）'],
    ],
  ),
  p(''),
  h3('2.3.2 筛选条件'),
  table(
    ['筛选项', '取值来源', '逻辑'],
    [
      ['告警等级', 'ALARM_LEVELS', '精确匹配 level'],
      ['告警状态', 'ALARM_STATUS + 告警 + 自动解除告警', '精确匹配 status'],
      ['告警描述', 'ALARM_DESC_TYPES', '精确匹配 desc'],
      ['告警时间 RangePicker', '—', 'UI 存在，未接入筛选逻辑'],
    ],
  ),
  p(''),
  h3('2.3.3 告警状态展示规则'),
  bullet('自动解除告警 → status 为「自动解除告警」或 autoResolved 为 true'),
  bullet('告警 → status 为「告警」或 noWorkOrder 为 true'),
  bullet('其他 → 直接展示 status'),
  p('Tag 颜色：待处理=processing，告警=blue，已处理=success，自动解除告警=cyan，误报=warning，损坏=error'),

  h3('2.3.4 详情弹窗 — 设施工单字段'),
  p('计算函数：facilityOrderLabel(alarm)，按优先级：'),
  table(
    ['条件', '展示文案'],
    [
      ['已存在关联工单', '{工单编号}（告警同步）'],
      ['noWorkOrder 或 status=告警', '—（不生成工单）'],
      ['status ≠ 待处理', '—（仅待处理告警可按规则自动生成）'],
      ['无匹配工单生成规则', '—（无匹配告警设置）或 —（该设备告警设置未开启工单生成）'],
      ['未到生成时机', '告警后 {N} 分钟生成工单（剩余约 {M} 分钟）'],
      ['已到生成时机', '已到生成时机，告警后 {N} 分钟生成工单'],
    ],
  ),

  h3('2.3.5 自动生成设施工单'),
  p('触发时机：页面加载时；每 30 秒定时复检；告警设置规则变更时。'),
  p('核心函数：syncEligibleAlarmsToFacility(alarms)'),
  p('生成条件（shouldSyncAlarmToFacility，须全部满足）：'),
  bullet('告警 status === 待处理'),
  bullet('匹配到告警设置规则且 generateWorkOrder === true'),
  bullet('告警产生时长 ≥ workOrderDelayMinutes（默认 5 分钟）'),
  bullet('该 alarmId 尚未存在关联工单'),
  p('生成结果：'),
  bullet('工单编号：SG-{告警编号}'),
  bullet('来源：告警同步；小程序状态：待接单；中台工单状态：待处理'),
  bullet('接单人：-；首条流转：告警同步生成设施工单，工单状态=待接单'),

  h2('2.4 告警设置'),
  p('页面：AlarmSettings2.tsx | 数据：alarmSettingsStore + mock/alarmSettings2Data.ts'),
  h3('2.4.1 设备目录结构'),
  table(
    ['一级类别', '二级子类（部分）'],
    [
      ['消防设备', '消火栓、灭火器、火灾报警、烟感器、温感器、消防主机、防火门'],
      ['监控设备', '监控摄像头、门禁系统、红外探测器、周界报警'],
      ['供水设备', '生活水泵、消防水泵'],
    ],
  ),
  h3('2.4.2 规则字段'),
  table(
    ['字段', '说明'],
    [
      ['rootCategory / subCategory', '一级类别 / 二级子类'],
      ['level', '告警等级，须与告警精确匹配'],
      ['thresholdMode', 'none | deviceTimeout'],
      ['customMinutes', '离线判定时长 1–1440，默认 30，仅 deviceTimeout'],
      ['generateWorkOrder', '是否生成设施工单'],
      ['workOrderDelayMinutes', '告警后 N 分钟生成工单，默认 5，仅勾选时'],
      ['createTime', '创建时间'],
    ],
  ),
  h3('2.4.3 告警阈值类型'),
  table(
    ['thresholdMode', '展示', '自动解除条件'],
    [
      ['none', '无（第三方/接口推送）', 'externalClearReceived: true'],
      ['deviceTimeout', '设备离线超过N分钟', 'deviceBackOnline: true'],
    ],
  ),
  h3('2.4.4 规则匹配逻辑'),
  p('函数 findMatchingAlarmRule(alarm)：alarm.alarmDevice → ALARM_DEVICE_TO_SETTINGS_SUB 映射 → 匹配 rootCategory + subCategory + level。'),
  p('已映射设备：消防主机、烟感探测器、温感探测器、防火门、监控摄像头、门禁系统、生活水泵、消防水泵。'),
  note('配电柜、电梯设备、红外探测器等不在映射表中 → 显示「无匹配告警设置」。'),

  h2('2.5 告警自动解除'),
  p('核心函数：processAlarmAutoResolve → alarmListStore.ingestAlarmAutoResolveSignal'),
  h3('2.5.1 分类判定（isDeviceTimeoutTypeAlarm）'),
  bullet('匹配规则 thresholdMode === deviceTimeout，或告警描述 desc === 设备超时 → 超时类'),
  bullet('否则 → 非超时类（接口推送）'),
  h3('2.5.2 解除前置条件'),
  bullet('告警 status 必须为 待处理'),
  bullet('超时类：deviceBackOnline === true'),
  bullet('非超时类：externalClearReceived === true'),
  h3('2.5.3 解除后效果'),
  p('告警：status→自动解除告警，autoResolved=true，写入 releaseTime。'),
  p('关联工单（forceCloseFacilityByAlarmRecovery）：miniStatus→已完成，repairNote→系统自动解除报警，追加流转「告警恢复自动关单」。无论是否有人接单均强制关单。'),
  h3('2.5.4 演示数据'),
  table(
    ['告警编号', '场景', '关联工单'],
    [
      ['AL20260601006', '超时类，未接单关单', 'SG-AL20260601006'],
      ['AL20260601008', '超时类，已接单仍关单', 'SG-AL20260601008'],
      ['AL20260601009', '非超时类，接口解除', 'SG-AL20260601009'],
      ['AL20260601003', '待处理，可动态触发', 'SG20260601001'],
    ],
  ),

  h1('3. 设施工单模块（中台）'),
  p('页面：FacilityWorkOrder.tsx | 数据：getFacilityOrders() / subscribeFacility'),
  h2('3.1 双状态体系'),
  p('由 resolveFacilityStatusView() 计算：'),
  h3('工单状态（4 种）'),
  table(
    ['值', '来源 miniStatus'],
    [
      ['待处理', '待接单 / 已取消'],
      ['处理中', '待完成'],
      ['已处理', '已完成'],
      ['损坏', '损坏'],
    ],
  ),
  h3('处理状态（6 种）'),
  table(
    ['工单状态', '条件', '处理状态'],
    [
      ['待处理', '未超未接单时限', '待处理'],
      ['待处理', '已超未接单时限', '超时待处理'],
      ['处理中', '未超完成时限', '处理中'],
      ['处理中', '已超完成时限', '逾期处理中'],
      ['已处理', '—', '已处理'],
      ['损坏', '在工单池', '损坏待处理'],
    ],
  ),
  p('SLA：未处理超时锚点 alarmTime + unhandledTimeoutDays（默认 3 天）；完成逾期锚点 acceptedAt + completionOverdueDays（默认 7 天）。损坏工单在工单池不参与未处理超时。列表每 60 秒刷新 SLA。'),

  h2('3.2 列表 Tab 与筛选'),
  bullet('Tab：全部、处理中、未处理、已处理、损坏'),
  bullet('筛选：工单状态、处理状态、告警等级、告警设备、告警月份'),

  h2('3.3 详情弹窗'),
  bullet('基础信息：工单编号、设备、位置、等级、描述、时间、双状态、时效、接单人'),
  bullet('提交信息（只读）：到达现场时间 getFacilityArrivalTime()；误报/维修/损坏描述 getFacilitySubmitNote()'),
  bullet('流转信息：FacilityFlowTimeline，与小程序 flowRecords 同源，含图片预览'),

  h2('3.4 工单设置'),
  table(
    ['配置项', '默认值', '说明'],
    [
      ['未处理超时（天）', '3', '超时未接单 → 超时待处理'],
      ['完成逾期（天）', '7', '接单后超时未完成 → 逾期处理中'],
    ],
  ),
  p('权限：admin 或 facility:work-order:settings 可编辑；无权限仅查看。中台设施工单无业务编辑操作。'),

  h1('4. 设施工单模块（小程序）'),
  p('当前用户：MINI_CURRENT_USER = 张维修'),
  h2('4.1 工单来源'),
  p('告警同步与手动创建均直接进入工单池，初始 miniStatus 均为「待接单」，由维修人员自主接单，无派单指派环节。'),
  table(
    ['来源', '初始 miniStatus', '说明'],
    [
      ['告警同步', '待接单', '告警满足规则后自动生成'],
      ['手动创建', '待接单', '中台/后台创建后进入工单池'],
    ],
  ),

  h2('4.2 列表可见性'),
  table(
    ['miniStatus', '是否出现在设施工单列表'],
    [
      ['待接单、损坏', '是（工单池，全员可见，可自主接单）'],
      ['待完成', '仅 receiver === 当前用户'],
      ['已完成', '是'],
      ['已取消', '否（仅我的已办）'],
    ],
  ),

  h2('4.3 完整操作流程'),
  h3('阶段一：工单池（待接单 / 损坏）'),
  p('接单：待接单或损坏 → 待完成，流转「维修人员接单」，receiver=当前用户，写入 acceptedAt。'),

  h3('阶段二：待完成'),
  table(
    ['操作', '前置', '后置', '流转'],
    [
      ['取消接单', '未开始维修', '待接单', '[取消接单]'],
      ['开始维修', '接单人=当前用户', 'repairStarted=true', '开始维修'],
      ['继续处理', '已开始维修', '维修中页面', '—'],
    ],
  ),
  note('开始维修后不可取消接单。'),

  h3('阶段三：维修中页面（MiniFacilityRepairingForm）'),
  bullet('字段：到达现场时间（必填）、故障原因（选填，最多500字）'),
  bullet('暂存 → holdOnSiteFacilityRepair → 流转「现场信息暂存」'),
  bullet('下一步 → proceedFacilityRepairNextStep → 进入完成工单表单'),

  h3('阶段四：完成工单（MiniFacilityForm form=complete）'),
  table(
    ['判断', '必填', '图片', '提交函数', '结果 miniStatus'],
    [
      ['误报', '误报说明', '必填最多9张', 'submitFalseAlarmFacilityOrder', '已完成'],
      ['维修', '维修描述', '选填最多9张', 'submitRepairFacilityOrder', '已完成'],
      ['损坏', '损坏描述', '必填最多9张', 'submitDamageFacilityOrder', '损坏（receiver重置为-）'],
    ],
  ),
  p('所有提交均必填：到达现场时间、告警事故判断。'),
  p('底部按钮：维修=取消/暂存/提交；误报/损坏=取消/提交。'),
  p('闭环流转标准结构（三段式）：'),
  bullet('1. 告警同步/手动创建设施工单 → 待接单'),
  bullet('2. 维修人员接单'),
  bullet('3. 提交误报/维修/损坏（含告警事故判断、到达现场时间、描述、图片、工单状态）'),
  note('处理中可有「开始维修」等中间节点；已闭环工单以三段式为准。损坏工单在工单池待再次接单时流转记录保持不变。'),

  h3('阶段五：损坏工单再次处理'),
  p('损坏 → 工单池 → 任意人员再次接单 → 待完成 → 重新走维修流程。'),

  h3('阶段六：告警自动关单'),
  p('系统追加「告警恢复自动关单」，维修描述=系统自动解除报警。'),

  h2('4.4 小程序详情展示'),
  bullet('申请详情 FacilityFieldRows：含时效状态、中台双状态等 extra 字段'),
  bullet('流程记录 FlowTimeline：与中台同源，含图片'),

  h1('5. 流转记录规范'),
  p('类型 FacilityFlowRecord：time, action, operator, detail?, fields[], images[]'),
  table(
    ['action', '典型 fields'],
    [
      ['告警同步生成设施工单', '工单状态'],
      ['手动创建设施工单', '工单状态=待接单'],
      ['维修人员接单', '工单状态=待完成'],
      ['开始维修', '维修状态=维修进行中'],
      ['[取消接单]', '取消说明、工单状态=待接单'],
      ['现场信息暂存', '到达现场时间?、故障原因?、工单状态'],
      ['进入完成工单', '到达现场时间、故障原因?、下一步'],
      ['完成工单暂存', '完整提交字段+图片（正式提交前移除）'],
      ['提交误报/维修/损坏', '告警事故判断、到达现场时间、描述、上传图片?、工单状态'],
      ['告警恢复自动关单', '维修描述=系统自动解除报警、解除告警时间'],
    ],
  ),

  h1('6. 状态映射总表'),
  table(
    ['miniStatus', '中台工单状态'],
    [
      ['待接单、已取消', '待处理'],
      ['待完成', '处理中'],
      ['已完成', '已处理'],
      ['损坏', '损坏'],
    ],
  ),

  h1('7. 权限说明'),
  table(
    ['功能', '权限要求'],
    [
      ['中台设施工单列表/详情', '无限制（原型）'],
      ['中台工单设置编辑', 'admin 或 facility:work-order:settings'],
      ['小程序设施工单操作', '当前登录用户（原型固定张维修）'],
    ],
  ),

  h1('8. 原型限制'),
  bullet('告警统计与告警列表/设施工单未打通，使用独立 Mock'),
  bullet('告警列表时间范围筛选未实现'),
  bullet('数据存于内存 Store，刷新页面重置'),
  bullet('规则匹配依赖 ALARM_DEVICE_TO_SETTINGS_SUB，未映射设备无法匹配'),
  bullet('自动解除需外部信号 ingestAlarmAutoResolveSignal，无真实设备网关'),
  bullet('小程序照片为本地 blob/base64，无真实文件上传服务'),

  h1('9. 建议检验路径'),
  table(
    ['检验项', '操作'],
    [
      ['告警→工单生成', '告警列表 AL20260601003，等待或触发 sync'],
      ['自动解除（未接单）', 'AL20260601006 + SG-AL20260601006'],
      ['自动解除（已接单）', 'AL20260601008 + SG-AL20260601008'],
      ['损坏闭环流转', 'SG20260520004'],
      ['小程序完整流程', 'SG20260601001 接单→开始维修→完成→提交'],
      ['双状态 SLA', '中台列表查看剩余/超时/逾期天数'],
    ],
  ),
]

const doc = new Document({
  creator: 'Middle Platform Safety Prototype',
  title: '告警中心与设施工单模块PRD',
  description: '基于当前原型系统代码编写的需求说明文档',
  sections: [{ properties: {}, children }],
})

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(outFile, buffer)
console.log('Generated:', outFile)
