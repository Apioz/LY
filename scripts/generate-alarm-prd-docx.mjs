import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'docs')
const outFile = path.join(outDir, 'PRD-告警中心模块.docx')
const outFileAlt = path.join(outDir, 'PRD-告警中心模块-v2.docx')

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        size: opts.size ?? 22,
        color: opts.color,
      }),
    ],
  })
}

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 160 } })
}

function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 } })
}

function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 100 } })
}

function bullets(items) {
  return items.map(
    (text) =>
      new Paragraph({
        spacing: { after: 80, line: 276 },
        indent: { left: 420, hanging: 280 },
        children: [new TextRun({ text: `• ${text}`, size: 22 })],
      }),
  )
}

function table(headers, rows) {
  const headerCells = headers.map(
    (h) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
      }),
  )
  const bodyRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
            }),
        ),
      }),
  )
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    rows: [new TableRow({ children: headerCells }), ...bodyRows],
  })
}

const children = [
  new Paragraph({
    alignment: 'center',
    spacing: { after: 300 },
    children: [new TextRun({ text: '告警中心模块产品需求说明（PRD）', bold: true, size: 36 })],
  }),
  p('文档版本：V1.1'),
  p('更新日期：2026-06-11'),
  p('编写依据：本仓库前端原型实际代码（middle-platform-safety-prototype）'),
  p('涉及源码：src/pages/alarm/*、src/mock/alarmData.ts、src/mock/alarmSettings2Data.ts、src/store/alarmSync.ts、src/store/alarmSettingsStore.ts、src/pages/alarm/constants.ts'),
  p('说明：本文档仅描述「告警中心」菜单下三个页面及其与设施工单的联动逻辑；消防设备管理下的「事件告警」页面归属设备模块，不在本 PRD 范围内。'),

  h1('1. 模块概述'),
  p('告警中心是中台安全管理原型中的独立业务模块，面向运维管理人员，提供告警数据统计看板、告警记录查询、告警规则配置三项能力。'),
  p('模块与设施工单模块存在数据联动：在告警设置中开启「是否生成工单」后，待处理告警在满足延迟条件时可自动创建设施工单（来源标记为「告警同步」）。'),

  h1('2. 菜单与页面结构'),
  table(
    ['菜单分组', '页面名称', '路由 Key', '组件文件'],
    [
      ['告警中心', '告警统计', 'alarm-stats', 'src/pages/alarm/AlarmStatistics.tsx'],
      ['告警中心', '告警列表', 'alarm-list', 'src/pages/alarm/AlarmList.tsx'],
      ['告警中心', '告警设置', 'alarm-settings', 'src/pages/alarm/AlarmSettings2.tsx'],
    ],
  ),
  p(''),

  h1('3. 全局数据字典与枚举'),
  h2('3.1 告警等级'),
  p('一级告警、二级告警、三级告警、四级告警。列表与设置中使用 Tag 颜色：一级 #ff4d4f、二级 #fa8c16、三级 #fadb14、四级 #1890ff。'),

  h2('3.2 告警状态（告警列表）'),
  p('全局枚举 ALARM_STATUS（constants.ts）：待处理、已处理、误报、损坏。'),
  p('告警列表页扩展列表专属状态 AlarmListStatus = AlarmStatus |「自动解除告警」，仅用于告警列表筛选与展示，其他页面（告警统计、告警设置）不引用该状态。'),
  table(
    ['状态', '含义', 'Tag 颜色', '适用范围'],
    [
      ['待处理', '告警产生，尚未人工处置', 'processing', '列表'],
      ['已处理', '告警已人工处置完成', 'success', '列表'],
      ['自动解除告警', '设备恢复传输后自动解除，告警信息已自动闭环', 'cyan', '仅列表'],
      ['误报', '确认为误报', 'warning', '列表'],
      ['损坏', '设备损坏相关', 'error', '列表'],
    ],
  ),
  p('自动解除告警判定：status 字段为「自动解除告警」，或数据项带 autoResolved=true（详情文案统一展示为自动解除告警说明）。该状态视同非待处理，不参与设施工单自动生成。'),

  h2('3.3 告警描述类型（告警列表）'),
  p('火灾报警、故障报警、设备超时。'),

  h2('3.4 告警设备（列表筛选用扁平列表）'),
  p('消防主机、烟感探测器、温感探测器、防火门、生活水泵、消防水泵、配电柜、电梯设备、门禁系统、监控摄像头。设备按类别归类见 constants.ts 中 ALARM_DEVICE_CATEGORIES。'),

  h2('3.5 告警设置设备目录（二级子类维度）'),
  p('告警设置按「一级类别 → 二级子类」配置规则，三级具体设备名称仅用于统计子级数量，不在规则表单中逐台配置。目录包含：'),
  ...bullets([
    '消防设备：消火栓、灭火器、火灾报警、烟感器、温感器、消防主机、防火门',
    '监控设备：监控摄像头、门禁系统、红外探测器、周界报警',
    '供水设备：生活水泵、消防水泵',
  ]),

  h2('3.6 告警列表设备 → 告警设置子类映射'),
  p('告警列表中的设备名称通过 ALARM_DEVICE_TO_SETTINGS_SUB 映射到告警设置规则，用于匹配工单生成规则。映射关系如下：'),
  table(
    ['列表设备名', '设置一级类别', '设置二级子类'],
    [
      ['消防主机', '消防设备', '消防主机'],
      ['烟感探测器', '消防设备', '烟感器'],
      ['温感探测器', '消防设备', '温感器'],
      ['防火门', '消防设备', '防火门'],
      ['监控摄像头', '监控设备', '监控摄像头'],
      ['门禁系统', '监控设备', '门禁系统'],
      ['生活水泵', '供水设备', '生活水泵'],
      ['消防水泵', '供水设备', '消防水泵'],
    ],
  ),
  p('未出现在映射表中的设备（如配电柜、电梯设备）无法匹配告警设置规则，故不会触发自动工单生成。'),

  h1('4. 页面一：告警统计'),
  h2('4.1 页面定位'),
  p('提供告警 KPI 概览、等级分布、趋势曲线及实时告警列表，支持按人防/技防、日/月/年维度切换展示（当前为前端 Mock 数据驱动）。'),

  h2('4.2 页面布局与内容'),
  ...bullets([
    '顶部工具栏：页面标题「告警统计」；人防数据/技防数据切换；日/月/年切换；日期选择器（随周期切换为 date/month/year 格式）；「查询」按钮。',
    'KPI 卡片区（4 列）：待处置、处置超时、设备告警、事件上报。数值由 getKpiCards(period) 计算，按周期乘以系数（日 0.3、年 3、月 1）。',
    '左侧图表区：告警等级分布（环形饼图，数据来自 getLevelDistributionFour，并按周期系数缩放）；告警趋势图（折线面积图，X 轴与数据来自 getTrendData）。',
    '右侧列表区：实时告警列表，展示告警名称、等级 Tag、时间；每条可点「详情」。',
  ]),

  h2('4.3 交互说明'),
  ...bullets([
    '人防/技防切换：切换 realtimeHumanAlarms 与 realtimeTechAlarms 数据源。',
    '日/月/年切换：同步影响 KPI 系数、等级分布缩放系数、趋势图粒度（日→today 按小时、月→month 按日、年→year 按月）。',
    '日期选择器：仅改变展示值，当前实现未将所选日期传入统计函数，不影响图表/KPI 实际数据。',
    '查询按钮：点击后弹出 message「查询成功」，不触发后端请求或数据重算。',
    '实时告警详情：Modal 展示告警名称、告警等级、数据类型（当前人防/技防选项）、告警时间。',
  ]),

  h2('4.4 底层逻辑'),
  ...bullets([
    '数据源：src/mock/alarmData.ts（alarmListData 与本页无直接绑定；统计用 getKpiCards、getLevelDistributionFour、getTrendData、realtimeHumanAlarms、realtimeTechAlarms）。',
    '图表：ECharts（echarts-for-react），配置在前端 useMemo 中生成。',
    '处置超时 KPI 已恢复展示（span=6，四项 KPI 并排）。',
    '小程序数据页 KPI（getKpiCardsByRange）与本页 getKpiCards 同源，属跨端统计口径复用。',
  ]),

  h1('5. 页面二：告警列表'),
  h2('5.1 页面定位'),
  p('展示系统产生的告警记录，支持筛选与详情查看；对待处理且满足规则的告警，自动同步生成设施工单，并在详情中展示工单关联状态。'),

  h2('5.2 列表字段'),
  table(
    ['列名', '字段', '说明'],
    [
      ['序号', '-', '当前页序号'],
      ['告警编号', 'id', '如 AL20260601001'],
      ['告警名称', 'name', ''],
      ['告警等级', 'level', 'Tag 展示'],
      ['告警设备', 'alarmDevices', '多设备以「、」连接'],
      ['安装位置', 'installLocation', ''],
      ['告警描述', 'desc', '火灾报警/故障报警/设备超时'],
      ['告警状态', 'status', 'Tag 展示；含列表专属「自动解除告警」'],
      ['告警时间', 'time', ''],
      ['解除告警时间', 'releaseTime', '无则显示 -'],
      ['操作', '-', '详情'],
    ],
  ),
  p(''),

  h2('5.3 筛选区'),
  ...bullets([
    '告警等级：下拉，选项 ALARM_LEVELS，客户端过滤。',
    '告警状态：下拉，选项 ALARM_LIST_STATUS（ALARM_STATUS + 自动解除告警），客户端过滤。',
    '告警描述：下拉，选项 ALARM_DESC_TYPES，客户端过滤。',
    '告警时间：RangePicker 已渲染，但当前未绑定状态，不参与过滤。',
    '搜索：点击后 message「搜索完成」，不额外处理。',
    '重置：清空三个下拉筛选条件。',
  ]),

  h2('5.4 告警状态展示规则'),
  ...bullets([
    '列表 Tag 颜色映射 ALARM_STATUS_TAG_COLOR：待处理 processing、已处理 success、自动解除告警 cyan、误报 warning、损坏 error。',
    '详情告警状态由 alarmStatusDetailText() 生成：若为自动解除告警或 autoResolved=true，展示「自动解除告警（设备已自动解除告警，告警信息已自动闭环）」；否则展示 status 原值。',
    '「解除告警时间」列/字段（releaseTime）与状态「自动解除告警」独立：前者记录时间点，后者表示闭环状态。',
  ]),

  h2('5.5 详情弹窗'),
  p('点击「详情」打开 Modal，字段：告警编号、告警名称、告警等级、告警设备、安装位置、告警描述、告警状态、告警时间、解除告警时间、设施工单。'),
  p('「设施工单」展示逻辑（facilityOrderLabel）：'),
  ...bullets([
    '若已存在 alarmId 关联的设施工单：显示「{工单编号}（告警同步）」。',
    '若告警状态非待处理：显示「—（仅待处理告警可按规则自动生成）」。',
    '若无匹配规则或未开启生成工单：显示「—（无匹配告警设置）」或「—（该设备告警设置未开启工单生成）」。',
    '若待处理且已配置生成工单但未到时机：显示「告警后 X 分钟生成工单（剩余约 Y 分钟）」。',
    '若已到生成时机：显示「已到生成时机，告警后 X 分钟生成工单」。',
  ]),

  h2('5.6 自动同步设施工单（核心底层逻辑）'),
  ...bullets([
    '页面挂载时执行 syncEligibleAlarmsToFacility(data)。',
    '订阅告警设置变更（subscribeAlarmDeviceRules），规则变化时重新扫描同步。',
    '每 30 秒定时：刷新 UI tick + 再次执行 syncEligibleAlarmsToFacility。',
    '单条同步条件 shouldSyncAlarmToFacility：①告警状态为待处理；②告警设备在 ALARM_DEVICE_TO_SETTINGS_SUB 有映射；③在告警设置中存在匹配 rootCategory+subCategory+level 且 generateWorkOrder=true 的规则；④告警已产生时长 ≥ workOrderDelayMinutes（默认 5 分钟）。',
    '同步创建：调用 syncAlarmToFacility，工单 id 为 SG-{告警编号}，来源「告警同步」，miniStatus「待接单」，receiver「-」，写入流转记录「告警同步生成设施工单」。',
    '防重：若 facilityOrders 中已存在相同 alarmId 的工单，不再重复创建。',
  ]),

  h2('5.7 原型数据'),
  p('列表数据来自 src/mock/alarmData.ts 的 alarmListData（6 条样例），页面内 useState 初始化后不再变更（只读 Mock）。样例概览：'),
  table(
    ['告警编号', '名称', '状态', '备注'],
    [
      ['AL20260601001', '烟感主机告警', '待处理', '可触发工单同步'],
      ['AL20260601002', '配电柜通讯异常', '已处理', '有 releaseTime'],
      ['AL20260601003', '水泵响应超时', '待处理', '可触发工单同步'],
      ['AL20260601004', '消防通道烟感', '误报', '有 releaseTime'],
      ['AL20260601005', '电梯网关离线', '损坏', ''],
      ['AL20260601006', '空调机组超时', '自动解除告警', 'autoResolved=true，有 releaseTime'],
    ],
  ),
  p(''),

  h1('6. 页面三：告警设置'),
  h2('6.1 页面定位'),
  p('按设备二级子类配置告警阈值、告警等级、是否自动生成设施工单及生成时机。支持增删改查、批量删除、树形列表展示。'),

  h2('6.2 列表结构'),
  p('树形表格：一级行为设备类别（root），二级行为已配置规则的子类（category）。仅存在 AlarmDeviceRule2 记录的子类才会出现在树中；未配置的子类不展示。'),
  table(
    ['列名', '一级行', '二级行（规则行）'],
    [
      ['告警设备', '类别名', '子类名'],
      ['子级数量', '空', '该子类下三级设备数量'],
      ['阈值', '空', 'thresholdDisplay'],
      ['告警等级', '空', 'Tag'],
      ['是否生成工单', '空', '否 / 是（告警后 X 分钟生成工单）'],
      ['创建时间', '空', 'createTime'],
      ['操作', '空', '查看 / 编辑 / 删除'],
    ],
  ),
  p(''),

  h2('6.3 筛选与工具栏'),
  ...bullets([
    '告警设备：关键词，匹配子类名或一级类别名（不区分大小写）。',
    '告警等级：精确匹配规则等级。',
    '创建时间：区间过滤规则 createTime。',
    '搜索：应用筛选；若有条件则自动展开匹配到的一级节点。',
    '清空：重置筛选并收起展开行。',
    '工具栏：新增、批量删除（仅可选二级规则行）、清除选择。勾选框仅对 rowType=category 的行启用。',
    '分页 showTotal 显示 filteredRules 条数（规则条数，非树节点总数）。',
  ]),

  h2('6.4 新增告警设置'),
  ...bullets([
    '告警设备：Cascader 多选，精确到二级子类；可选多个子类批量创建。',
    '告警等级：必选，默认三级告警。',
    '告警阈值：二选一——「无」（仅第三方推送，不做阈值）或「设备超时设置」（需填离线判定时长 1~1440 分钟，默认 30）。',
    '是否生成工单：Checkbox，默认勾选；勾选后需填「告警后 X 分钟生成工单」（1~1440，默认 5）。',
    '保存：已为该子类存在规则则跳过；全部重复时报错；部分重复时提示新增/跳过数量。',
  ]),

  h2('6.5 编辑告警设置'),
  ...bullets([
    '设备选择 Cascader 禁用，不可更改 rootCategory/subCategory。',
    '可修改：告警等级、告警阈值、是否生成工单、工单生成时机。',
    '保存后通过 updateAlarmDeviceRules 更新内存 Store，并通知订阅方（含告警列表同步逻辑）。',
  ]),

  h2('6.6 查看告警设置'),
  p('只读 Modal：告警设备（类别/子类）、子级数量、告警等级、告警阈值、离线判定时长（仅设备超时模式）、是否生成工单、工单生成时机、创建时间。'),

  h2('6.7 删除'),
  ...bullets([
    '单条删除：确认后按 key 删除规则。',
    '批量删除：对勾选的规则 key 批量删除。',
  ]),

  h2('6.8 底层数据与初始化'),
  ...bullets([
    '规则存储：src/store/alarmSettingsStore.ts 内存态 alarmDeviceRules，初始值来自 initialAlarmDeviceRules2。',
    'initialAlarmDeviceRules2 由 buildInitialRules() 按设备目录批量生成（约部分子类有规则，部分无规则）。',
    '规则结构 AlarmDeviceRule2：key、rootCategory、subCategory、level、thresholdMode、customMinutes、thresholdDisplay、generateWorkOrder、workOrderDelayMinutes、createTime。',
    '阈值展示文案由 formatThresholdDisplay 生成：无 / 设备离线超过{N}分钟（设备超时报警）。',
  ]),

  h1('7. 告警与设施工单联动（跨模块）'),
  h2('7.1 联动触发链'),
  p('告警设置（规则） → 告警列表扫描（shouldSyncAlarmToFacility） → alarmSync.syncAlarmToFacility → 设施工单 Store（facilityOrders） → 设施工单页 / 小程序展示。'),

  h2('7.2 规则匹配算法'),
  ...bullets([
    '遍历告警的 alarmDevices 数组，按设备名查 ALARM_DEVICE_TO_SETTINGS_SUB 得 rootCategory、subCategory。',
    '在 getAlarmDeviceRules() 中查找 rootCategory+subCategory+level 完全一致的规则。',
    'findWorkOrderGenerationRule 返回第一条 generateWorkOrder=true 的匹配规则。',
    'getAlarmElapsedMinutes 基于告警 time 与当前时间计算已产生分钟数。',
  ]),

  h2('7.3 生成后的工单特征'),
  ...bullets([
    '工单编号：SG-{告警编号}（自动同步新建格式；历史 Mock 数据存在 SG2026… 手工编号）。',
    'alarmId 关联原告警。',
    'source：告警同步。',
    '初始 miniStatus：待接单；中台 status：待处理。',
    '告警列表详情通过 getFacilityOrderByAlarmId 反查展示。',
  ]),

  h2('7.4 告警恢复关单（已实现函数，列表页未调用）'),
  p('alarmSync.closeFacilityByAlarm(alarmId)：将关联工单中未完成单置为已完成，并写入流转「告警恢复自动关单」。当前告警列表页未绑定告警状态变更，该函数供后续扩展。'),

  h1('8. 状态管理与订阅机制'),
  table(
    ['Store 文件', '职责', '订阅 API'],
    [
      ['alarmSettingsStore.ts', '告警设置规则 CRUD（内存）', 'subscribeAlarmDeviceRules'],
      ['alarmSync.ts', '告警→工单同步、设施工单全生命周期', 'subscribeFacility'],
    ],
  ),
  p('告警列表同时订阅 alarmSettingsStore 与本地定时器，保证规则修改或时间推进后工单同步与剩余分钟展示更新。'),

  h1('9. 原型局限与真实落地差异说明'),
  ...bullets([
    '告警列表、告警统计数据均为前端 Mock，无真实后端 API、无 WebSocket 实时推送。',
    '告警统计的日期选择与查询按钮不改变实际统计数据。',
    '告警列表的时间范围筛选未接入过滤逻辑。',
    '告警列表数据为静态数组，页面内不提供告警处置、误报标注、手动解除等写操作入口；自动解除告警状态由数据预置体现。',
    '告警设置保存仅更新浏览器内存，刷新页面后恢复 initialAlarmDeviceRules2（除非后续接入持久化）。',
    '设备超时阈值配置体现为规则文案与离线分钟数，原型未模拟设备真实离线检测链路。',
    '列表设备名与设置子类名存在差异（如烟感探测器→烟感器），依赖映射表，生产环境建议统一设备主数据编码。',
  ]),

  h1('10. 验收要点（测试清单）'),
  ...bullets([
    '告警统计：人防/技防切换列表变化；日/月/年切换 KPI 与趋势图粒度变化；处置超时 KPI 可见。',
    '告警列表：三级筛选生效；可按「自动解除告警」筛选；AL20260601006 详情展示自动闭环说明；待处理+已配规则告警详情显示工单倒计时或已生成工单号。',
    '修改告警设置关闭某设备工单生成后，列表详情文案变为未开启；开启并保存后 30 秒内可触发同步。',
    '告警设置：新增多子类、重复子类跳过、编辑锁定设备、查看只读、单删批删。',
    '映射表外设备（配电柜）告警不应自动生成工单。',
  ]),

  p('—— 文档结束 ——', { after: 0 }),
]

/** 生成前校验：防止数组未展开导致 Word 中段落空白 */
function assertFlatChildren(nodes, path = 'children') {
  nodes.forEach((node, index) => {
    const at = `${path}[${index}]`
    if (Array.isArray(node)) {
      throw new Error(`${at} 是未展开的嵌套数组，请使用 ...bullets([...]) 或展开为单段`)
    }
    if (node instanceof Table) {
      return
    }
    if (node instanceof Paragraph) {
      return
    }
    throw new Error(`${at} 类型异常: ${node?.constructor?.name ?? typeof node}`)
  })
}

fs.mkdirSync(outDir, { recursive: true })
assertFlatChildren(children)

const doc = new Document({
  sections: [{ properties: {}, children }],
})

const buffer = await Packer.toBuffer(doc)
let saved = outFile
try {
  fs.writeFileSync(outFile, buffer)
} catch (err) {
  if (err?.code === 'EBUSY') {
    saved = outFileAlt
    fs.writeFileSync(saved, buffer)
    console.warn(`原文件被占用，已另存为: ${saved}`)
  } else {
    throw err
  }
}
console.log(`Generated: ${saved}`)
