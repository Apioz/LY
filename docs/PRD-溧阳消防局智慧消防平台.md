# 溧阳消防局智慧消防平台 — 产品需求文档（PRD）

| 属性 | 内容 |
| --- | --- |
| 文档版本 | V1.0（基于当前原型代码） |
| 产品名称 | 溧阳消防局中台管理系统 + 维修端小程序 |
| 技术栈 | React 18 + Vite + TypeScript + Ant Design 5 + ECharts |
| 原型状态 | 交互原型（Mock 数据，无真实后端） |
| 适用对象 | 前端开发、后端开发、测试、产品 |

---

## 目录

1. [产品概述](#一产品概述)
2. [核心数据流与跨模块同步](#二核心数据流与跨模块同步)
3. [全局 UI 组件规范](#三全局-ui-组件规范)
4. [中台页面详细需求](#四中台页面详细需求)
5. [小程序详细需求](#五小程序详细需求)
6. [后端 API 清单](#六后端-api-清单建议)
7. [非功能需求与异常处理](#七非功能需求与异常处理)
8. [原型与正式开发差异](#八原型与正式开发差异说明)
9. [页面总览](#九页面总览)

---

## 一、产品概述

### 1.1 产品定位

面向溧阳消防局的智慧消防综合管理平台，覆盖 **告警处置、安全检查、设施工单、设备管理、档案与培训、应急演练** 等业务；配套 **维修端小程序** 供现场人员接单、处理工单。

### 1.2 双端架构

| 端 | 入口 | 说明 |
| --- | --- | --- |
| 中台管理系统 | 默认启动 | 左侧菜单 + 顶部 Tab 多页签，管理员操作 |
| 小程序（H5 原型） | 顶部「切换端 → 小程序」 | 手机壳 UI（华为 Mate 80 Pro Max：440×949px），底部 4 Tab |

### 1.3 全局导航规则（中台）

- **路由方式：** `App.tsx` 内 `MenuKey` 状态驱动，非 URL 路由
- **默认页：** 安全检查统计（`safety-stats`）
- **Tab 规则：**
  - 首页 Tab 固定不可关闭
  - 点击菜单打开新 Tab（已存在则切换）
  - 关闭当前 Tab → 跳转到最后一个 Tab，无则回首页
  - 「更多」下拉仅有「关闭其他」（未实现）
- **顶栏：** 折叠侧栏、端切换下拉、当前用户「管理员」

### 1.4 成熟度图例

| 符号 | 含义 |
| --- | --- |
| ✅ | 已实现交互（本地 state CRUD / 真实联动） |
| 📊 | 只读展示（图表/表格有 Mock 数据） |
| 🔲 | 壳页面（UI 完整，数据空或操作为 stub） |

---

## 二、核心数据流与跨模块同步

### 2.1 告警 → 设施工单 → 小程序 闭环

**流程说明：**

1. 告警列表点击「同步工单」→ 调用 `syncAlarmToFacility(alarm)` → 设施工单新增 `SG-{alarmId}`，状态「待处理」
2. 告警列表「解除告警」或「模拟恢复」→ 调用 `closeFacilityByAlarm` → 关联设施工单变「已处理」
3. 设施工单（中台）通过 `subscribeFacility` 实时同步到小程序
4. 小程序「接单维修」→ 调用 `acceptFacilityOrder(id, 张维修)` → 状态变「处理中」

### 2.2 共享数据模型

#### 设施工单 FacilityOrderItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 工单编号，告警同步为 `SG-{alarmId}` |
| alarmDevices | string[] | 告警设备列表 |
| level | string | 一级~四级告警 |
| desc | string | 火灾报警 / 故障报警 / 设备超时 |
| alarmTime | string | 告警时间 |
| status | enum | 待处理 / 处理中 / 已处理 / 损坏 |
| receiver | string | 接单人，默认 `-` |
| alarmId | string? | 关联告警 ID |
| source | enum | 告警同步 / 手动 |
| damageNote | string? | 损坏说明（≤500字） |
| initiator | string? | 发起人 |
| flowRecords | array | 流转记录 {time, action, operator} |

#### 设施工单状态机

```
待处理 ──接单──► 处理中 ──完成──► 已处理
  │                    ▲
  └──标记损坏──► 损坏 ──再次接单──► 处理中

告警解除 / closeFacilityByAlarm → 非已处理工单自动变已处理
```

#### 小程序工单 MiniWorkOrder

合并来源：`facilityToMiniOrder(中台设施工单)` + `localOrders(报修/维保/巡检 Mock)`

| 类型 | 状态枚举 |
| --- | --- |
| 报修 | 待派单、待审核、待接单、报修待完成、待签字、待关单、已关单、已取消 |
| 设施工单 | 与中台 FACILITY_ORDER_STATUS 同步 |
| 维保 | 待派单、待审核、待接单、处理中、已完成、已取消 |
| 巡检 | 待执行、执行中、已完成、已取消 |

**小程序当前用户：** 张维修 / 溧阳消防局智慧消防（正式环境需替换为登录态）

### 2.3 共享 Store 说明

| 文件 | 职责 |
| --- | --- |
| `src/store/alarmSync.ts` | 设施工单内存存储、pub/sub、告警同步、接单、损坏说明 |
| `src/store/miniProgramUser.ts` | 小程序当前用户常量 |

### 2.4 Mock 数据文件

| 文件 | 内容 |
| --- | --- |
| `src/mock/alarmData.ts` | 告警列表、统计、规则、实时告警 |
| `src/mock/alarmSettings2Data.ts` | 三级设备目录、告警设置2 树形规则 |
| `src/mock/data.ts` | 安全检查、统计种子、检查内容树、字典 |
| `src/mock/hseModules.ts` | 安全规范、培训、资质、档案、设备档案 |
| `src/mock/deviceData.ts` | 消防/监控设备、监控树 |
| `src/mock/miniProgramData.ts` | 小程序本地工单、公告、动态 |

---

## 三、全局 UI 组件规范

### 3.1 SearchBar（筛选区）

- **布局：** 左侧筛选控件 + 右侧按钮
- **按钮：**
  - **搜索**（primary）：触发 onSearch
  - **重置**（ReloadOutlined）：清空草稿筛选
  - **清空**（ClearOutlined）：部分页面替代重置

**异常：** 未绑定 API 的页面点击搜索无实际过滤或仅 Toast 提示。

### 3.2 TableToolbar（表格工具栏）

| 按钮 | 默认 | 行为 |
| --- | --- | --- |
| 新增 | 显示 | onAdd |
| 批量删除 | 显示 | selectedCount=0 时 disabled |
| 导出 | 部分页 | 橙色描边，多数未接线 |
| 刷新/密度/搜索/全屏 | 右侧图标 | 原型未实现 |

选中提示条：「当前表格已选择 N 项」+ 清空链接。

### 3.3 分页通用规则

| 参数 | 常见值 |
| --- | --- |
| pageSize | 10（多数列表）/ 20（培训、监控设备） |
| showSizeChanger | 多数开启 |
| showTotal | 共 {n} 条 |
| showQuickJumper | 检查计划、全部检查、系统字典 |

**原型限制：** 客户端分页，筛选在内存数组上执行，非服务端分页。

---

## 四、中台页面详细需求

### 4.1 首页 home 🔲

| 项 | 说明 |
| --- | --- |
| 入口 | 默认 Tab，侧栏无入口 |
| 内容 | 欢迎文案 + Home 图标 |
| 筛选/按钮/弹窗 | 无 |
| 跳转 | 无 |

---

### 4.2 告警中心

#### 4.2.1 告警统计 alarm-stats 📊

**目的：** 告警 KPI、分布、趋势、实时告警流

**筛选区：**

| 控件 | 选项 | 行为 |
| --- | --- | --- |
| 人防/技防 | Radio | 切换实时列表数据源 |
| 日/月/年 | Radio | 切换 KPI 统计周期 |
| 日期选择器 | date/month/year | 随周期切换 picker |
| 查询 | Button | Toast「查询成功」，不刷新数据 |

**展示区：**

| 区块 | 内容 |
| --- | --- |
| KPI 四卡 | 待处置、处置超时、设备告警、事件上报 |
| 饼图 | 告警等级分布（四级） |
| 折线图 | 告警趋势；子筛选：今日/本月/全年 |
| 实时列表 | 人防/技防告警，每项可点「详情」 |

**弹窗 — 告警详情：**

| 字段 | 说明 |
| --- | --- |
| 名称、等级、数据类型、时间 | Descriptions 展示 |

**分页：** 无（列表滚动）

**后端 API：**

```
GET /alarms/statistics?period=&date=&defenseType=
GET /alarms/realtime?defenseType=
GET /alarms/trend?range=
```

---

#### 4.2.2 告警列表 alarm-list ✅

**目的：** 告警记录管理，联动设施工单

**筛选：**

| 字段 | 控件 | 是否生效 |
| --- | --- | --- |
| 告警等级 | Select（一级~四级） | ✅ 客户端过滤 |
| 告警状态 | Select（待处理/已处理/误报/损坏） | ✅ |
| 告警描述 | Select（火灾/故障/设备超时） | ✅ |
| 告警时间 | RangePicker | ❌ UI 未接线 |

**按钮：**

| 位置 | 按钮 | 条件 | 行为 |
| --- | --- | --- | --- |
| 筛选区 | 搜索 | — | Toast「搜索完成」 |
| 筛选区 | 重置 | — | 清空三个 Select |
| 行操作 | 详情 | 全部 | 打开详情弹窗 |
| 行操作 | 模拟恢复 | 待处理 + 设备超时 | 状态→已处理，写 releaseTime，autoResolved=true，调用 closeFacilityByAlarm |
| 行操作 | 同步工单 | 待处理 | 调用 syncAlarmToFacility，Toast 成功 |
| 弹窗 | 解除告警 | 详情且待处理 | Confirm → 已处理 + closeFacilityByAlarm |
| 弹窗 | 关闭 | — | 关闭弹窗 |

**表格列：** 序号、告警ID、告警名称、告警等级(Tag)、告警设备、告警描述、告警状态(Tag)、告警时间、解除告警时间、操作

**分页：** pageSize=10，showSizeChanger，showTotal

**详情弹窗字段：** 告警ID、名称、等级、设备、描述、状态（含自动解除标注）、时间、解除时间、设施工单（SG-{id}）

**异常/边界：**

- syncAlarmToFacility 按 alarmId 去重，重复同步不新增
- 模拟恢复仅「设备超时 + 待处理」可见
- 解除告警同步关闭关联设施工单（非已处理→已处理）

**后端 API：**

```
GET /alarms?page&size&level&status&desc&timeRange
POST /alarms/{id}/release
POST /alarms/{id}/simulate-recover
POST /alarms/{id}/sync-facility-order
```

---

#### 4.2.3 告警设置 alarm-settings ✅

**目的：** 扁平表告警规则（设备类别→设备名 二级）

**筛选：** 告警设备 Cascader（二级），客户端过滤

**工具栏：** 新增、批量删除（需勾选）、行选择

**表格列：** 序号、告警设备、告警等级、阈值、创建时间、操作（查看/编辑/删除）

**弹窗模式：** 新增 / 查看 / 编辑

**表单字段：**

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| 告警设备 | ✅ | 多选 Cascader（5 类设备） |
| 告警等级 | ✅ | 一级~四级，默认三级 |
| 告警阈值 | ✅ | Radio：none（仅第三方推送）/ deviceTimeout（1~1440 分钟，默认 30） |

**按钮：**

| 按钮 | 行为 |
| --- | --- |
| 保存 | 校验 → 新增置顶 / 编辑覆盖 |
| 删除 | Confirm → 移除行 |
| 批量删除 | 删除选中行 |

**分页：** pageSize=10

**后端 API：**

```
GET/POST/PUT/DELETE /alarm-rules
GET /device-catalog/level2
```

---

#### 4.2.4 告警设置2 alarm-settings-2 ✅

**目的：** 三级资产目录树表告警配置（仅展示已配置设备）

**筛选：**

| 字段 | 控件 | 生效 |
| --- | --- | --- |
| 告警设备 | Input 关键词 | ✅ 搜索后应用 |
| 告警等级 | Select | ✅ |
| 创建时间 | RangePicker | ✅ |
| 清空 | Button | 重置全部筛选 + 折叠树 |

**树结构：** 一级类别 → 二级子类 → 三级设备名

**表格列：** 告警设备(tree)、阈值、告警等级(Tag)、创建时间、操作（仅设备行：编辑/删除）

**工具栏：** 新增、批量删除（仅设备行可选）

**弹窗 — 新增：**

| 字段 | 说明 |
| --- | --- |
| 告警设备 | 三级 Cascader 多选 |
| 告警等级、阈值 | 同告警设置 |

**弹窗 — 编辑：** 设备锁定不可改

**业务规则：**

- 新增跳过已配置设备，Toast 报告跳过数量
- 全选已存在 → 报错「所选设备均已配置」
- 搜索命中自动展开相关父节点
- 默认仅展开一级；pagination total = 规则条数非树行数
- 未配置设备不在列表，但目录中可选（新增时）

**分页：** pageSize=10（按规则数）

**后端 API：**

```
GET /alarm-rules/v2/tree?keyword&level&dateRange
POST /alarm-rules/v2/batch
PUT /alarm-rules/v2/{deviceKey}
DELETE /alarm-rules/v2/batch
GET /device-catalog/level3
```

---

### 4.3 安全检查

#### 4.3.1 安全检查统计 safety-stats 📊

**筛选：**

| 控件 | 说明 |
| --- | --- |
| 月/季/年 | Radio |
| 日期 | 月模式 DatePicker；季模式 + 季度 Select |
| 查询 | 应用 timeFilter 刷新全部图表 |

**图表（全部联动时间筛选）：**

| 图表 | 类型 | X 轴规则 |
| --- | --- | --- |
| 按安全类别统计 | 饼图 | 13 类 |
| 按时间维度统计 | 折线 | 月=按天；季/年=按月 |
| 按整改工单统计 | 饼图 | 未处理/处理中/处理完成 |
| 按安全等级统计 | 环形图+表格 | 等级/数量/占比 |
| TOP5 隐患 | 表格 | 固定 5 行 |

**分页：** 无

---

#### 4.3.2 检查日历 inspection-calendar 🔲

**筛选：** 地块名称 Select（无 options）

**内容：** Calendar 组件；day 3/15 →「安全检查」；day 20 →「整改复查」

**后端：** GET /inspections/calendar?plot&month

---

#### 4.3.3 检查内容录入 inspection-content-entry ✅

**筛选：** 程序名称 Input（未接线）

**工具栏：** 新增、批量删除

**表格列：** 序号、程序编号、程序名称、注意事项、创建人、创建时间、操作（查看/编辑/删除）

**弹窗字段：**

| 字段 | 必填 |
| --- | --- |
| 程序名称 | ✅ |
| 检查内容 | ✅ Tree 多选（来自 inspectionTree） |
| 注意事项 | 否 |

**分页：** pageSize=10，showSizeChanger

---

#### 4.3.4 检查点位设定 inspection-point-setting ✅

**筛选：** 地块名称、点位名称（未接线）

**工具栏：** 新增、批量删除

**表格列：** 序号、点位编号、点位名称、点位描述、地块名称、空间位置、标签名称、操作

**弹窗字段：**

| 字段 | 必填 | 联动 |
| --- | --- | --- |
| 点位名称 | ✅ | — |
| 点位描述 | 否 | — |
| 地块名称 | ✅ | 双翼大厦 / 中期大厦 / 天山路473号 |
| 空间位置 | ✅ | 随地块级联 |
| 标签名称 | 否 | NFC / 二维码 / 蓝牙 |
| 点位标记 | ✅ | 文件上传（本地文件名） |

**分页：** 动态 total，showSizeChanger

---

#### 4.3.5 检查项目设定 inspection-project-setting 📊

**筛选：** 项目类别（物业/租赁）

**表格列：** 序号、检查名称、地块名称、项目类别、项目描述、打点数量、状态、操作（stub）

**工具栏：** 仅行选择，无新增

---

#### 4.3.6 检查计划设定 inspection-plan-setting ✅

**筛选：** 检查名称 Input（未接线）

**工具栏：** 新增

**表格列：** 序号、检查计划、检查名称、管理类别、检查人、地块名称、任务发布人、开始/结束时间、触发周期、下次执行时间、检查描述、状态、操作

**行操作：**

| 操作 | 行为 |
| --- | --- |
| 禁用/启用 | Confirm 切换状态 |
| 查看 | 只读弹窗 |
| 编辑 | 编辑弹窗 |
| 删除 | Confirm 删除 |

**表单字段（新增/编辑）：**

| 字段 | 必填 |
| --- | --- |
| 检查计划 | ✅ |
| 状态 | ✅ 启用/禁用 |
| 检查名称 | ✅ Select |
| 管理类别 | ✅ 巡查 |
| 处理时限 | 否（小时） |
| 检查人 | ✅ 多选 |
| 开始/结束日期 | ✅ |
| 触发周期 | ✅ 每 N 周/月/季 |
| 任务开始时间 | ✅ TimePicker |
| 地块名称 | ✅ |
| 计划描述 | 否 |

**分页：** pageSize=10，showQuickJumper

---

#### 4.3.7 检查工单管理 inspection-work-order ✅

**筛选：**

| 字段 | 生效 |
| --- | --- |
| 管理类别 | ✅ |
| 工单状态 | ✅ |

**状态：** 待处理、处理中、已完成、已取消

**表格列：** 序号、工单编号、检查计划、管理类别、地块名称、检查名称、点位数量、检查人、检查开始时间、工单状态(Tag)、操作（详情 stub）

**分页：** pageSize=10

---

#### 4.3.8 全部检查 all-inspections 📊

**筛选：** 管理类别、地块名称、工单状态（未接线）

**表格列：** 同检查工单 + 详情按钮

**分页：** total=501，pageSize=10，showQuickJumper

---

#### 4.3.9 整改工单 rectification-work-order 🔲

**筛选：** 安全类别、安全等级（一级~四级）、管理类别、工单状态、整改措施

**表格列：** 工单编号、地块、区域、隐患问题、安全类别、检查日期、管理类别、安全等级、问题描述、整改说明、工单状态、整改措施、要求/实际完成日期、确认人、操作（详情）

**数据：** 空（暂无）

**分页：** 无（空表）

---

#### 4.3.10 检查报表 inspection-report 🔲

**筛选：** 管理中心、安全等级、整改实际完成日期 Range

**Tab：** 全部 / 工单报表 / 导入报表

**工具栏：** 导出 + 表格工具图标

**表格列：** 18 列含检查日期、地块、管理中心、安全类别/等级、整改字段、报表类型、备注

**数据：** 空

---

### 4.4 安全规范 safety-norm 📊

**筛选：** 规范名称、规范类型（规范/流程/制度）

**工具栏：** 新增、导出（无批量删除）

**表格列：** #、规范名称、规范类型、附件（查看附件）、上传时间、操作（查看/编辑/删除 stub）

**分页：** pageSize=20

---

### 4.5 教育培训

#### 培训资料 training-materials 📊

**Tab：** 全部 / KYT隐患案例 / 事故教育

**筛选：** 资料名称

**表格列：** 资料名称、资料类型、附件、上传人、上传时间、操作

**分页：** pageSize=20

#### 人员资质 personnel-qualification 📊

**统计卡：** 人员总数 56、证书总数 91、即将到期 0、逾期数 19

**筛选：** 姓名、工号

**按钮：** 新增、导入、导出

**表格列：** 姓名、工号、证书名称（逾期红色）、证书编号、取证/到期/复证日期、发证机关、操作

**业务规则：** overdue=true 行证书名红色高亮

---

### 4.6 应急演练

#### 演练计划 drill-plan 🔲

**筛选：** 预案演练主题、演练方式、预案类型

**按钮：** 新增、导入、导出

**数据：** 空表，操作列均为 stub

#### 演练实施 drill-implement 🔲

**筛选：** 预案演练主题、预案类型、演练方式

**按钮：** 导出 + 工具栏图标

**数据：** 空表

---

### 4.7 档案管理

| 页面 | 筛选 | 关键列 | 数据 |
| --- | --- | --- | --- |
| 全部项目档案 | 地块类别 | 地块编号/名称/地址、管理中心、负责人、检修/装修/租赁数量 | ✅ Mock |
| 项目检维修 | 项目名称、项目类型 | 项目编号、地块、位置、类型、负责人 | ✅ |
| 二次装修 | 同上 | 项目编号、地块、类型、负责人 | ✅ |
| 租赁档案 | 租赁单位、地块名称 | 租赁编号、单位、位置、面积、业态等 | 🔲 空 |

**通用：** 新增/导出、行操作 stub（查看/编辑/删除）

---

### 4.8 设施工单 facility-work-order ✅

**目的：** 中台设施工单管理，与告警/小程序同步

**状态 Tab：** 全部 / 处理中 / 未处理(待处理) / 已处理 / 损坏

**筛选（搜索生效，重置清空 Tab+筛选）：**

| 字段 | 控件 |
| --- | --- |
| 工单状态 | Select |
| 告警等级 | Select |
| 告警设备 | Select（扁平设备名） |
| 告警月份 | MonthPicker |

**提示条：** 「损坏状态工单可被维修人员再次接单」

**表格列：** 序号、工单编号、告警设备、告警等级、告警描述、告警时间、工单状态、接单人、损坏说明（Tab=全部/损坏时显示）、操作

**行操作：**

| 操作 | 条件 |
| --- | --- |
| 查看 | 全部 |
| 填写说明 | 损坏状态 |

**弹窗 — 工单详情：**

| 区块 | 内容 |
| --- | --- |
| 基础信息 | 编号、设备、等级、描述、时间、状态、接单人、来源 |
| 损坏说明 | TextArea ≤500字（仅损坏） |
| 按钮 | 损坏时：关闭 + 保存损坏说明 |

**过滤逻辑：** Tab 状态 AND 搜索条件叠加；设备筛选为 alarmDevices.includes(device)

**分页：** pageSize=10，showSizeChanger

**后端 API：**

```
GET /facility-orders?tab&status&level&device&month&page&size
GET /facility-orders/{id}
PUT /facility-orders/{id}/damage-note
POST /facility-orders/{id}/accept
PUT /facility-orders/{id}/complete
```

---

### 4.9 设备管理

#### 消防设备-设备管理 fire-device-mgmt 📊

**统计：** 总数 128、待绑定 12、已绑定 116

**筛选：** 空间位置、设备名称、消防设备编号

**按钮：** 关联通道、导出、确认启用、取消启用

**表格列：** #、空间编码、安装位置、设备类目、设备名称、消防设备编号/名称、绑定状态、启用状态、操作（编辑/查看）

**分页：** pageSize=10

#### 事件告警 fire-event-alarm 📊

**筛选：** 设备名称/编号、告警时间 Range、告警类型（火灾/故障）

**按钮：** 导出

**表格列：** #、告警时间、设备编号/名称、告警类型

#### 监控设备-设备管理 monitor-device-mgmt 📊

**统计：** 总数 460、待绑定 0、已绑定 460、正常 460、异常 0

**筛选：** 空间位置、设备名称、监测状态（正常/异常）

**按钮：** 新增、确认启用、取消启用、导出

**表格列：** #、空间编码、安装位置、资产编码/名称、设备编号/名称、监测状态、启用状态、协议类型、品牌、操作（查看视频/编辑/查看/删除/确认启用）

**分页：** total=460，pageSize=20

#### 资源监控视图 resource-monitor-view 📊

**统计条：** 总数 138、在线 133、离线 5

**控件：** 设备搜索、实时监控/历史回放 Toggle

**布局：** 左侧设备 Tree → 右侧视频占位区

**后端：** 视频流 API、设备在线状态、回放时间轴

---

### 4.10 基础管理

#### 安全人员网格 personnel-grid 📊

**UI：** 上传新文件、历史记录；当前文件卡片（版本 Tag）；PDF 预览占位

**文件：** 2025年房产经营平台HSE网格图 总表（最新）20250212.docx

#### 地块组织架构 plot-org-structure 📊

**UI：** 同上模式

**文件：** 2026年房产经营平台地块组织架构.docx

#### 特种设备 special-equipment 📊

**统计：** 总数 108、临期 13、逾期 13

**筛选：** 使用单位、设备名称、使用地址

**按钮：** 新增、删除、导出

**表格：** 逾期行红色背景（highlight=true）

**分页：** total=108，pageSize=10

#### 燃气设备 gas-equipment 📊

**统计：** 总数 25、临期 8、逾期 17

**筛选：** 出租地址、承租单位、租赁业态

#### 充电桩 charging-pile 📊

**Tab：** 电动汽车 / 非机动车

**筛选：** 管理部门、安装场所地址

---

### 4.11 系统管理

#### 检查内容配置 inspection-content-config ✅

**筛选：** 检查项目 Input（未接线）

**树表列：** #、检查项目、安全类别、安全等级、排序、备注、更新人、更新时间、操作

**弹窗字段：** 上级科目、检查科目*、安全类别、安全等级*、排序*、备注

**特性：** defaultExpandAllRows，无分页

**删除：** 链接存在但未实现

#### 系统字典 system-dictionary 📊

**筛选：** 字典编号、字典名称（未接线）

**表格列：** #、字典编号(link)、字典名称、字典排序、封存、操作（编辑/删除/字典配置 stub）

**新增弹窗：** 字典编号*、字典名称*、字典排序*、封存 Switch、字典备注

**分页：** total=192，pageSize=10，showQuickJumper

---

## 五、小程序详细需求

**视口：** 440×949px（华为 Mate 80 Pro Max）

**顶栏：** 状态条「溧阳消防局智慧消防」

**底 Tab：** 首页 | 协作(stub) | 数据(stub) | 我的

### 5.1 首页 home

**区块 — 工单受理（5 宫格）：**

| 入口 | 角标规则 | 跳转 |
| --- | --- | --- |
| 报修工单 | 非终态报修数 | list/repair |
| 设施工单 | 待处理设施工单数 | list/facility |
| 维保工单 | 非已完成维保数 | list/maintenance |
| 巡检任务 | 非已完成巡检数 | list/inspection |
| 我的工单 | 与我相关总数 | my-orders |

**区块 — 通知公告 / 最新动态：** 各 3 条，查看更多 stub

---

### 5.2 工作列表 list

**顶栏：** 返回 + 标题「工作列表」+ 小程序控件

**类型 Tab：** 报修 / 设施工单 / 维保 / 巡检

**状态筛选：** 全部 + 各类型状态枚举，换行全展示不滚动

**列表卡片：**

| 行 | 字段 |
| --- | --- |
| 头 | 类型标签(蓝)、创建时间、状态(右) |
| 体 | 问题类型：、问题描述： |

**设施工单：** 数据来自中台 getFacilityOrders() 实时同步

**过滤：** type 匹配 + 可选 status 精确匹配

**分页：** 无，滚动加载（后端建议分页 API）

**跳转：** 卡片 → 工单详情

---

### 5.3 工单详情 detail

**基础信息：** 编号、类型、问题类型、问题描述、状态、发起人、接单人、位置

**流转记录：** 时间线列表

**按钮 — 接单维修：**

| 条件 | 行为 |
| --- | --- |
| type=facility 且 status=待处理 | 调用 acceptFacilityOrder(id, 张维修) → 处理中，写入流转 |

**异常：** 工单不存在 → 空态文案

---

### 5.4 我的工单 my-orders

**Tab：**

| Tab | 过滤逻辑 |
| --- | --- |
| 我发起的 | initiator = 当前用户 |
| 我的待办 | receiver = 当前用户 且 status ∉ {已完成,已处理,已关单,已取消} |
| 我的已办 | receiver = 当前用户 且 status ∈ {已完成,已处理,已关单} |

**类型筛选：** 全部 + 4 类型

**分页：** 无

---

### 5.5 个人中心 profile

**展示：** 头像、张维修、溧阳消防局智慧消防

**菜单：** 通讯录、编辑资料、修改密码（stub）

**按钮：** 退出登录（stub）

**底 Tab「我的」：** 蓝色圆形激活态

---

## 六、后端 API 清单（建议）

### 6.1 认证与用户

```
POST /auth/login
POST /auth/logout
GET  /auth/profile
PUT  /auth/profile
PUT  /auth/password
```

### 6.2 告警域

```
GET    /alarms
GET    /alarms/{id}
POST   /alarms/{id}/release
POST   /alarms/{id}/sync-facility
GET    /alarms/statistics
GET    /alarms/rules
GET    /alarms/rules/v2/tree
POST   /alarms/rules
PUT    /alarms/{id}
DELETE /alarms/{id}
```

### 6.3 设施工单域

```
GET  /facility-orders
POST /facility-orders
GET  /facility-orders/{id}
POST /facility-orders/{id}/accept
PUT  /facility-orders/{id}/damage-note
PUT  /facility-orders/{id}/complete
```

### 6.4 安全检查域

```
GET/POST/PUT/DELETE /inspection/programs
GET/POST/PUT/DELETE /inspection/points
GET/POST/PUT/DELETE /inspection/plans
GET                 /inspection/work-orders
GET                 /inspection/records
GET                 /inspection/statistics
GET/POST            /rectification/orders
GET                 /inspection/reports/export
GET/POST/PUT/DELETE /inspection/content-config/tree
```

### 6.5 小程序工单域

```
GET  /mini/orders?type&status&scope(initiated|todo|done)
GET  /mini/orders/{id}
POST /mini/orders/{id}/accept
GET  /mini/notices
GET  /mini/updates
```

### 6.6 主数据与文件

```
GET  /plots
GET  /devices/catalog?level=2|3
GET  /dictionaries
POST /files/upload
GET  /files/{id}/download
```

---

## 七、非功能需求与异常处理

| 场景 | 期望行为 |
| --- | --- |
| 网络失败 | Toast 错误 + 保留筛选条件 |
| 空列表 | Table locale.emptyText / 小程序「暂无工单」 |
| 并发接单 | 后端乐观锁；前端刷新列表 |
| 重复同步告警 | 按 alarmId 幂等 |
| 损坏工单再接单 | 待处理/损坏均可 accept → 处理中 |
| 权限 | 中台管理员 vs 小程序维修员角色分离 |
| 实时性 | 设施工单建议 WebSocket 或轮询（原型为内存 pub/sub） |

---

## 八、原型与正式开发差异说明

| 项目 | 原型现状 | 正式开发要求 |
| --- | --- | --- |
| 路由 | 内存 MenuKey | 建议 React Router + 权限路由 |
| 数据 | Mock 文件 + 内存 Store | 全量 REST/GraphQL + DB |
| 分页 | 前端切片 | 服务端分页 + 排序 |
| 搜索 | 部分仅 Toast | 全部绑定 query 参数 |
| 文件上传 | 本地文件名 | OSS + 预览服务 |
| 小程序用户 | 硬编码张维修 | JWT + 微信登录 |
| 协作/数据 Tab | stub | 按业务补全或隐藏 |

---

## 九、页面总览

### 9.1 中台页面（36 个）

| 序号 | 页面 | MenuKey | 成熟度 |
| --- | --- | --- | --- |
| 1 | 首页 | home | 🔲 |
| 2 | 告警统计 | alarm-stats | 📊 |
| 3 | 告警列表 | alarm-list | ✅ |
| 4 | 告警设置 | alarm-settings | ✅ |
| 5 | 告警设置2 | alarm-settings-2 | ✅ |
| 6 | 安全检查统计 | safety-stats | 📊 |
| 7 | 检查日历 | inspection-calendar | 🔲 |
| 8 | 检查内容录入 | inspection-content-entry | ✅ |
| 9 | 检查点位设定 | inspection-point-setting | ✅ |
| 10 | 检查项目设定 | inspection-project-setting | 📊 |
| 11 | 检查计划设定 | inspection-plan-setting | ✅ |
| 12 | 检查工单管理 | inspection-work-order | ✅ |
| 13 | 全部检查 | all-inspections | 📊 |
| 14 | 整改工单 | rectification-work-order | 🔲 |
| 15 | 检查报表 | inspection-report | 🔲 |
| 16 | 安全规范 | safety-norm | 📊 |
| 17 | 培训资料 | training-materials | 📊 |
| 18 | 人员资质 | personnel-qualification | 📊 |
| 19 | 演练计划 | drill-plan | 🔲 |
| 20 | 演练实施 | drill-implement | 🔲 |
| 21 | 全部项目档案 | archive-all-projects | 📊 |
| 22 | 项目检维修 | archive-maintenance | 📊 |
| 23 | 二次装修 | archive-renovation | 📊 |
| 24 | 租赁档案 | archive-lease | 🔲 |
| 25 | 设施工单 | facility-work-order | ✅ |
| 26 | 消防设备管理 | fire-device-mgmt | 📊 |
| 27 | 事件告警 | fire-event-alarm | 📊 |
| 28 | 监控设备管理 | monitor-device-mgmt | 📊 |
| 29 | 资源监控视图 | resource-monitor-view | 📊 |
| 30 | 安全人员网格 | personnel-grid | 📊 |
| 31 | 地块组织架构 | plot-org-structure | 📊 |
| 32 | 特种设备 | special-equipment | 📊 |
| 33 | 燃气设备 | gas-equipment | 📊 |
| 34 | 充电桩 | charging-pile | 📊 |
| 35 | 检查内容配置 | inspection-content-config | ✅ |
| 36 | 系统字典 | system-dictionary | 📊 |

### 9.2 小程序页面（5 个）

| 序号 | 页面 | Route | 成熟度 |
| --- | --- | --- | --- |
| M1 | 首页 | home | ✅ |
| M2 | 工作列表 | list | ✅ |
| M3 | 工单详情 | detail | ✅ |
| M4 | 我的工单 | my-orders | ✅ |
| M5 | 个人中心 | profile | 📊 |

---

## 十、菜单结构（完整树）

```
告警中心
  ├─ 告警统计
  ├─ 告警列表
  ├─ 告警设置
  └─ 告警设置2
安全检查
  ├─ 安全检查统计
  ├─ 检查管理
  │   ├─ 检查日历
  │   ├─ 检查内容录入
  │   ├─ 检查点位设定
  │   ├─ 检查项目设定
  │   ├─ 检查计划设定
  │   ├─ 检查工单管理
  │   └─ 全部检查
  ├─ 整改工单
  └─ 检查报表
安全规范
教育培训
  ├─ 培训资料
  └─ 人员资质
应急演练
  ├─ 演练计划
  └─ 演练实施
档案管理
  └─ 项目档案
      ├─ 全部项目档案
      ├─ 项目检维修
      ├─ 二次装修
      └─ 租赁档案
设施工单
设备管理
  ├─ 消防设备
  │   ├─ 设备管理
  │   └─ 事件告警
  └─ 监控设备
      ├─ 设备管理
      └─ 资源监控视图
基础管理
  ├─ 安全人员网格
  ├─ 地块组织架构
  └─ 设备档案
      ├─ 特种设备
      ├─ 燃气设备
      └─ 充电桩设备
系统管理
  ├─ 检查内容配置
  └─ 系统字典
```

---

**文档结束**
