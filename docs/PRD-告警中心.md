# 溧阳消防局智慧消防平台 — 告警中心模块 PRD

| 属性 | 内容 |
| --- | --- |
| 文档版本 | V1.0 |
| 模块范围 | 告警统计、告警列表、告警设置 |
| 原型代码路径 | src/pages/alarm/ |
| 适用角色 | 消防管理员 |
| 文档状态 | 基于当前原型实现，可直接交付开发 |

---

# 一、模块概述

## 1. 模块名称

告警中心

## 2. 使用角色

**消防管理员**（中台登录用户，原型顶栏显示为「管理员」）

权限范围：查看告警统计数据、浏览告警清单、配置告警阈值规则。本模块不涉及小程序端操作。

## 3. 模块整体作用

告警中心承担消防告警全生命周期管理的前台能力，具体包括：

1. **告警设置**：按「一级设备类别 → 二级子类」维度配置告警等级与阈值（无 / 设备超时），规则精确到二级子项；列表展示子级数量（三级设备总数）。
2. **告警统计**：按人防/技防、日/月/年维度查看 KPI、等级分布、趋势图及实时告警流。
3. **告警列表**：查询、筛选历史与当前告警记录，查看详情；支持设备超时类告警的「模拟恢复」操作。

三者关系：告警设置定义规则 → 设备/系统触发后产生告警 → 告警列表记录 → 告警统计聚合展示。

## 4. 子菜单与跳转规则

| 菜单项 | 路由 Key | 页面组件 | 说明 |
| --- | --- | --- | --- |
| 告警统计 | alarm-stats | AlarmStatistics | 默认不自动打开，需点击菜单 |
| 告警列表 | alarm-list | AlarmList | — |
| 告警设置 | alarm-settings | AlarmSettings2 | 原「告警设置2」，旧版 v1 已移除 |

**菜单跳转规则（中台 MainLayout）：**

1. 用户点击左侧「告警中心」下任一子菜单 → 触发 `onNavigate(menuKey)` → 内容区渲染对应页面组件。
2. 非「首页」页面自动在顶部 Tab 栏新增/激活对应 Tab（可关闭，首页 Tab 不可关闭）。
3. 关闭当前 Tab 时，自动切换至最后一个 Tab；若无其他 Tab 则回首页。
4. **三个子页面之间无按钮级跨页跳转**（无「去告警列表」等链接）；仅通过左侧菜单或顶部 Tab 切换。
5. 三个页面均**不携带 URL 查询参数**（原型为内存路由 `MenuKey` 驱动）。
6. 告警中心菜单组展开：当 activeKey 为 `alarm-stats` / `alarm-list` / `alarm-settings` 时，侧栏自动展开 `group-alarm`。

---

# 二、分页面逐个拆解

---

## 页面一：告警统计（alarm-stats）

### 1. 页面用途

**业务作用：** 为消防管理员提供告警态势总览 Dashboard，包括核心 KPI、等级分布、趋势变化、实时告警滚动列表。

**使用场景：**

- 每日/每月巡检前查看待处置与超时情况；
- 切换人防/技防数据源对比人工与设备告警；
- 点击实时告警「详情」快速了解单条告警摘要。

**本页特点：** 无传统表格分页；以卡片 + 图表 + 列表为主；无新增/删除/批量操作。

### 2. 页面布局分区

| 分区 | 位置 | 内容 |
| --- | --- | --- |
| 顶部筛选区 | 页面最上方 Card 内 | 页面标题「告警统计」+ 人防/技防 + 日/月/年 + 日期选择器 + 查询按钮 |
| KPI 卡片区 | 筛选区下方，4 列 | 待处置、处置超时、设备告警、事件上报 |
| 图表展示区（左 16 列） | KPI 下方 | 告警等级分布（饼图）、告警趋势图（折线图，带今日/本月/全年子筛选） |
| 实时告警区（右 8 列） | 与图表区同行 | 实时告警列表 Card |
| 弹窗区 | 覆盖层 | 告警详情 Modal（由实时列表「详情」触发） |
| 分页区 | **无** | 实时列表为全量展示，不分页 |

### 3. 筛选条件详情

#### 3.1 人防数据 / 技防数据（Radio.Group，按钮样式）

| 属性 | 说明 |
| --- | --- |
| 组件类型 | Radio.Button 二选一 |
| 可选值 | 人防数据、技防数据 |
| 默认值 | **技防数据** |
| 数据源 | 前端写死枚举 |
| 空值规则 | 不可为空，始终有选中项 |
| 生效逻辑 | 切换后立即更换右侧「实时告警」列表数据源（`realtimeHumanAlarms` / `realtimeTechAlarms`），**不触发接口** |
| 对 KPI/图表影响 | 原型中 KPI 与等级分布、趋势图**不受**人防/技防切换影响（仅实时列表切换） |
| 清空按钮 | 本页无「清空/重置」按钮 |

#### 3.2 日 / 月 / 年（Radio.Group）

| 属性 | 说明 |
| --- | --- |
| 可选值 | day（日）、month（月）、year（年） |
| 默认值 | **month（月）** |
| 生效逻辑 | 切换后联动下方 DatePicker 的 picker 模式与显示格式 |
| 对 KPI 影响 | 切换 period 后 KPI 数值按系数重算：日×0.3、月×1、年×3（`getKpiCards(period)`） |
| 组合查询 | 需点击「查询」按钮才 Toast 提示；**日期选择变更不自动刷新 KPI**（period 变更会即时刷新 KPI） |

#### 3.3 日期选择器（DatePicker）

| 属性 | 说明 |
| --- | --- |
| 默认值 | `2025-01`（月模式） |
| picker 联动 | day→date，格式 YYYY-MM-DD；month→month，格式 YYYY.MM；year→year，格式 YYYY |
| allowClear | **false**（不可清空） |
| 输入规则 | 仅能通过选择器点选，无手动非法输入校验 |
| 空值逻辑 | 不允许为空 |
| 与查询按钮 | 点击「查询」仅 `message.success('查询成功')`，**不根据所选日期重新请求数据**（原型未接线） |

#### 3.4 告警趋势图子筛选（今日 / 本月 / 全年）

| 属性 | 说明 |
| --- | --- |
| 位置 | 「告警趋势图」Card 右上角 extra |
| 默认值 | **本月（month）** |
| 生效逻辑 | 切换后**立即**重绘折线图（`getTrendData(trendRange)`） |
| X 轴数据 | 今日：6 个时点；本月：31 天；全年：12 月 |
| Y 轴 | 全年模式 max=500；本月不限制 |

#### 3.5 多条件组合查询规则

- 人防/技防 + 日期 + 查询：**原型未实现服务端组合查询**。
- 趋势图子筛选独立于顶部「查询」按钮，即时生效。
- period 变更即时影响 KPI 四卡数值。

#### 3.6 清空按钮逻辑

本页面**无**搜索栏组件，无清空/重置按钮。

### 4. 顶部功能按钮

| 按钮 | 是否存在 | 点击动作 |
| --- | --- | --- |
| 查询 | ✅ | Toast「查询成功」，无数据刷新 |
| 搜索 | ❌ | — |
| 清空/重置 | ❌ | — |
| 新增 | ❌ | — |
| 批量删除 | ❌ | — |
| 刷新 | ❌ | — |

**实时告警列表·详情链接：**

- 点击某条实时告警右侧「详情 ›」→ 设置 `detailId` → 打开「告警详情」Modal。
- Modal 字段（只读）：告警名称、告警等级（levelLabel）、数据类型（当前人防/技防选中值）、告警时间。
- Modal footer：**null**（无底部按钮）；点击遮罩或右上角 X 关闭（`onCancel` 清空 detailId）。
- 无保存、无编辑。

### 5. 表格/列表展示

本页无 Ant Design Table，以下为各展示区块字段说明。

#### 5.1 KPI 四卡（Statistic）

| 展示名 | 数据来源 | 计算规则 |
| --- | --- | --- |
| 待处置 | getKpiCards | 145 × period系数，四舍五入 |
| 处置超时 | 同上 | 75 × 系数 |
| 设备告警 | 同上 | 76 × 系数 |
| 事件上报 | 同上 | 15 × 系数 |

#### 5.2 告警等级分布（饼图）

| 字段 | 数据来源 | 展示规则 |
| --- | --- | --- |
| 一级告警 | getLevelDistributionFour | 26.9%，颜色 #ff4d4f |
| 二级告警 | 同上 | 26.9%，#fa8c16 |
| 三级告警 | 同上 | 26.9%，#fadb14 |
| 四级告警 | 同上 | 19.3%，#1890ff |
| 标签格式 | — | `{名称}\n{百分比}%` |

**说明：** 原型数据固定，不随顶部筛选变化。

#### 5.3 实时告警列表（List）

| 展示元素 | 字段 | 数据来源 | 展示规则 |
| --- | --- | --- | --- |
| 左侧色条 | level 1-4 | item.level | LEVEL_WARN_COLORS 映射 |
| 图标 | — | WarningOutlined | 颜色同等级 |
| 标题 | name | RealtimeAlarmItem.name | 与 levelLabel Tag 同行 |
| 等级 Tag | levelLabel | 如「一级预警」 | 背景色同等级 |
| 描述 | time | 如 06-03 09:12:33 | 灰色副标题 |
| 操作 | 详情 › | 链接 | 打开 Modal |

**人防 Mock 数据（4 条）：** r1 消防通道占用告警… r4 值班离岗检测

**技防 Mock 数据（4 条）：** t1 机架数据异常… t4 水泵压力偏低

**勾选框：** 无

### 6. 分页逻辑

- **无分页组件。**
- 实时列表固定展示当前数据源全部条目（各 4 条）。
- 后端实现建议：实时列表 WebSocket 推送或轮询，KPI/图表接口带 period+date+defense 参数。

### 7. 页面跳转逻辑

| 触发方式 | 目标 | 携带参数 |
| --- | --- | --- |
| 侧栏「告警统计」 | 本页 | 无 |
| Tab 切换 | 本页 | 无 |
| 实时列表「详情」 | 本页内 Modal | detailId（内存状态） |
| 跳转告警列表/设置 | **不支持** | — |

### 8. 异常场景

| 场景 | 原型行为 | 正式开发建议 |
| --- | --- | --- |
| 实时列表无数据 | 列表区域空白 | 展示 Empty「暂无实时告警」 |
| 查询接口失败 | 未实现 | Message.error + 保留上次数据 |
| detailId 无匹配项 | Modal 打开但内容为空 | 不应出现；接口需校验 |
| 图表数据为空 | 饼图/折线图为空 | 展示「暂无统计数据」占位 |

---

## 页面二：告警列表（alarm-list）

### 1. 页面用途

**业务作用：** 展示系统产生的告警记录清单，支持多维度筛选、查看详情；对「设备超时 + 待处理」类告警提供模拟恢复能力。

**使用场景：**

- 管理员按等级/状态/描述类型筛查待处理告警；
- 查看单条告警完整信息与关联设施工单编号（只读展示）；
- 模拟设备恢复传输后告警自动关闭（仅设备超时场景）。

**已移除功能（当前原型不存在）：** 同步工单、解除告警（详情弹窗内已去掉）。

### 2. 页面布局分区

| 分区 | 内容 |
| --- | --- |
| 顶部筛选区 | SearchBar：告警等级、告警状态、告警描述、告警时间 RangePicker + 搜索 + 重置 |
| 功能按钮区 | **无** TableToolbar（无新增/批量删除） |
| 表格展示区 | 10 列数据表 + 操作列 |
| 分页区 | 表格底部分页器 |
| 弹窗区 | 告警详情 Modal |

### 3. 筛选条件详情

#### 3.1 告警等级（Select）

| 属性 | 说明 |
| --- | --- |
| placeholder | 请选择告警等级 |
| 宽度 | 160px |
| allowClear | true |
| 可选值 | 一级告警、二级告警、三级告警、四级告警（ALARM_LEVELS） |
| 默认值 | undefined（不过滤） |
| 数据源 | constants.ts 写死 |
| 生效时机 | **即时过滤**（onChange 更新 levelFilter，表格 dataSource 为 filtered 计算结果） |
| 空值逻辑 | 清空后该条件不参与过滤（AND 其他条件） |

#### 3.2 告警状态（Select）

| 可选值 | 待处理、已处理、误报、损坏 |
| 默认 | 不过滤 |
| 生效 | 即时过滤 status 精确匹配 |

#### 3.3 告警描述（Select）

| 可选值 | 火灾报警、故障报警、设备超时 |
| 默认 | 不过滤 |
| 生效 | 即时过滤 desc 精确匹配 |

#### 3.4 告警时间（RangePicker）

| 属性 | 说明 |
| --- | --- |
| 原型状态 | **UI 已展示，未绑定 state，不参与过滤** |
| 正式开发 | 建议绑定 timeStart/timeEnd，筛选 alarm.time 区间 |

#### 3.5 搜索按钮

- 点击 → Toast「搜索完成」
- **不改变过滤结果**（因等级/状态/描述已即时过滤）

#### 3.6 重置按钮

- 点击 → levelFilter、statusFilter、descFilter 置 undefined
- **不重置** RangePicker（未绑定）
- 表格恢复全量 alarmListData 展示（仍受即时 filter 逻辑约束，重置后等于全量）

#### 3.7 多条件组合查询规则

```
filtered = data.filter(row =>
  (!levelFilter || row.level === levelFilter) AND
  (!statusFilter || row.status === statusFilter) AND
  (!descFilter || row.desc === descFilter)
)
```

逻辑关系：**AND**；某 Select 为空则该维度忽略。

### 4. 顶部功能按钮

| 按钮 | 说明 |
| --- | --- |
| 搜索 | 见上，仅 Toast |
| 重置 | 清空三个 Select 筛选 |
| 新增 | 无 |
| 批量删除 | 无 |
| 清空 | 无（本页用「重置」） |
| 刷新 | 无 |

**行操作·详情：**

- 点击 → `setDetail(record)` → 打开告警详情 Modal

**行操作·模拟恢复（条件显示）：**

- 显示条件：`status === '待处理'` **且** `desc === '设备超时'`
- 点击动作：
  1. 当前时间写入 releaseTime
  2. status → 已处理
  3. autoResolved → true
  4. 调用 `closeFacilityByAlarm(record.id)` 关闭关联设施工单
  5. Toast「设备已恢复传输，告警已自动解除，状态变更为已处理」
- 无二次确认弹窗

**详情 Modal·关闭按钮：**

- 唯一 footer 按钮「关闭」→ setDetail(null)

### 5. 表格列表

**rowKey：** id

**无行勾选框（rowSelection）**

| 列名 | 字段 | 宽度 | 释义 | 数据来源 | 展示规则 |
| --- | --- | --- | --- | --- | --- |
| 序号 | — | 60 | 当前页序号 | 渲染 index+1 | 从 1 递增 |
| 告警ID | id | 160 | 唯一标识 | alarmListData.id | 原文，如 AL20260601001 |
| 告警名称 | name | 140 | 告警标题 | .name | 原文 |
| 告警等级 | level | 100 | 四级枚举 | .level | Tag，LEVEL_COLORS 配色 |
| 告警设备 | alarmDevices | 160 | 设备名数组 | .alarmDevices | join('、')，空则 '-'，ellipsis |
| 告警描述 | desc | 110 | 描述类型 | .desc | 火灾/故障/设备超时 |
| 告警状态 | status | 90 | 处理状态 | .status | Tag：待处理 processing、已处理 success、误报 warning、损坏 error |
| 告警时间 | time | 170 | 发生时间 | .time | yyyy-MM-dd HH:mm:ss |
| 解除告警时间 | releaseTime | 170 | 解除时间 | .releaseTime | 空显示 '-' |
| 操作 | — | 120 fixed right | 行内链接 | — | 详情；条件显示模拟恢复 |

**Mock 数据 6 条（alarmListData）：**

| id | name | level | desc | status |
| --- | --- | --- | --- | --- |
| AL20260601001 | 烟感主机告警 | 一级 | 火灾报警 | 待处理 |
| AL20260601002 | 配电柜通讯异常 | 二级 | 故障报警 | 已处理 |
| AL20260601003 | 水泵响应超时 | 三级 | 设备超时 | 待处理 |
| AL20260601004 | 消防通道烟感 | 四级 | 火灾报警 | 误报 |
| AL20260601005 | 电梯网关离线 | 二级 | 故障报警 | 损坏 |
| AL20260601006 | 空调机组超时 | 三级 | 设备超时 | 已处理(autoResolved) |

**详情 Modal 字段：**

| 字段 | 说明 |
| --- | --- |
| 告警ID | 原文 |
| 告警名称 | 原文 |
| 告警等级 | 原文 |
| 告警设备 | 数组 join |
| 告警描述 | 原文 |
| 告警状态 | 若 autoResolved 追加「（设备恢复传输自动解除）」 |
| 告警时间 | 原文 |
| 解除告警时间 | 空则 '-' |
| 设施工单 | 当 desc=设备超时 或 status=待处理 时显示 `SG-{id}（告警同步）`，否则 — |

**删除：** 本页无删除操作。

### 6. 分页逻辑

| 参数 | 值 |
| --- | --- |
| 默认页码 | 1 |
| 默认每页条数 | 10（pageSize） |
| showSizeChanger | true（可选 10/20/50…） |
| showTotal | `共 {n} 条` |
| 数据刷新 | 客户端对 filtered 数组分页切片；切换页码/条数不重新请求（原型无接口） |
| 筛选联动 | 筛选后 total 随 filtered.length 变化 |

### 7. 页面跳转逻辑

| 触发 | 目标 | 参数 |
| --- | --- | --- |
| 菜单/Tab | 本页 | 无 |
| 详情 | 本页 Modal | 无 URL 参数 |
| 跨页至统计/设置 | 仅菜单 | 无 |

### 8. 异常场景

| 场景 | 行为 |
| --- | --- |
| 筛选无结果 | 表格 Empty 默认「暂无数据」 |
| 模拟恢复重复点击 | 状态已非待处理后按钮不再显示 |
| 接口失败 | 原型无；建议 Message.error |
| 必填（本页无表单） | — |

---

## 页面三：告警设置（alarm-settings）

### 1. 页面用途

**业务作用：** 按资产目录「一级类别 → 二级子类」配置告警规则（等级 + 阈值），仅展示**已配置**的二级子类；列表树形展示，二级行显示该子类下三级设备总数（子级数量）。

**使用场景：**

- 为新接入的消防/监控/供水子类配置超时阈值；
- 按关键词/等级/创建时间检索已有规则；
- 批量删除失效规则。

### 2. 页面布局分区

| 分区 | 内容 |
| --- | --- |
| 顶部筛选区 | SearchBar：告警设备关键词、告警等级、创建时间 Range + 搜索 + **清空** |
| 功能按钮区 | TableToolbar：新增、批量删除 + 右侧图标按钮（刷新/密度/搜索/全屏，原型未接线）+ 选中提示条 |
| 表格展示区 | 树形 Table（一级 root → 二级 category 叶子）+ 行勾选 |
| 分页区 | 表格底部分页（total 按规则条数） |
| 弹窗区 | 新增/编辑告警设置 Modal |

### 3. 筛选条件详情

#### 3.1 告警设备（Input 关键词）

| 属性 | 说明 |
| --- | --- |
| placeholder | 请输入 |
| 宽度 | 160px |
| allowClear | true |
| 默认 | 空字符串（draftKeyword） |
| 匹配规则 | 应用后对 rootCategory、subCategory 做**模糊包含**（toLowerCase） |
| 生效时机 | 点击「搜索」后将 draft 复制到 appliedKeyword |

#### 3.2 告警等级（Select）

| 可选值 | 一级~四级告警 |
| 默认 | 不过滤 |
| 生效 | 搜索后精确匹配 rule.level |

#### 3.3 创建时间（RangePicker）

| 绑定 | draftDateRange / appliedDateRange |
| 规则 | 含起止日期的 startOf/endOf day；rule.createTime 落在区间内 |
| 空值 | 不选则不按时间过滤 |

#### 3.4 搜索按钮

1. applied ← draft 三个字段
2. 若有任一筛选条件 → 自动展开命中规则所属一级节点（expandedRowKeys）
3. 若全部为空 → 折叠所有 expandedRowKeys=[]
4. Toast「查询完成」

#### 3.5 清空按钮（clearLabel="清空"）

1. 清空 draft 与 applied 全部筛选
2. expandedRowKeys=[]
3. **不 Toast**

#### 3.6 多条件组合

AND 关系；同时作用于 `filterRules` 与树构建 `displayFilter`。

### 4. 顶部功能按钮

#### 4.1 新增

- 点击 → openAdd() → Modal title「新增告警设置」
- 表单默认值：thresholdMode=deviceTimeout，customMinutes=30，level=三级告警，subCategoryPaths=[]

#### 4.2 批量删除

- selectedCount=0 时按钮 **disabled**
- 点击 → 过滤 selected 中有效 rule key → 若无则 warning「请选择要删除的子类」
- 有选中 → Modal.confirm 标题「批量删除」，内容含条数，okType danger → 删除 → 清空 selected → success

#### 4.3 搜索 / 清空

见第 3 节。

#### 4.4 刷新 / 密度 / 搜索 / 全屏（TableToolbar 右侧）

- 原型：**无 onClick 实现**，点击无效果。

#### 4.5 选中提示条

- 文案「当前表格已选择 N 项」+ 链接「清空」→ onClearSelection 清空 selected

#### 4.6 新增/编辑 Modal 表单字段

| 字段名 | 组件 | 必填 | 新增 | 编辑 |
| --- | --- | --- | --- | --- |
| 告警设备 subCategoryPaths | Cascader 两级多选 | ✅ | 可选 一级→二级，多选 | **disabled** 不可改 |
| 告警等级 level | Select | ✅ | 一级~四级 | 可改 |
| 告警阈值 thresholdMode | Radio | ✅ | none / deviceTimeout | 可改 |
| 离线判定时长 customMinutes | InputNumber | 条件必填 | deviceTimeout 时 1~1440，默认 30 | 同左 |

**阈值说明文案：**

- none：「仅启用第三方推送的告警信息，不做额外阈值设置。」
- deviceTimeout：展示设备超时说明 Alert + 离线判定时长输入框

**保存校验：**

1. form.validateFields()
2. 新增：pathsToSubCategorySelections 至少 1 条；否则 warning「请至少选择一个二级子类」
3. 新增：跳过已存在 subCategoryPathKey 的项；全重复则 error「所选子类均已配置告警规则」
4. 部分跳过：success「新增 X 条，Y 条已存在已跳过」
5. 编辑：更新 level、thresholdMode、customMinutes、thresholdDisplay

**取消/关闭：**

- 点击「取消」或遮罩 → setModal(null)，destroyOnClose 销毁表单

**单行删除确认：**

- Modal.confirm 标题「确认删除」
- 内容含 rootCategory / subCategory 路径
- okType danger → 删除单条 + 从 selected 移除该 key

### 5. 表格列表

**树形结构：**

- **一级行（rowType=root）**：设备类别名（消防设备/监控设备/供水设备）；无阈值/等级/时间/操作/子级数量；**不可勾选**
- **二级行（rowType=category）**：子类名；展示全部数据列；**可勾选、可编辑删除**

**仅展示已配置子类**；未配置的不出现在列表（但新增 Cascader 仍可选）。

**列定义（等宽 160px）：**

| 列名 | 一级行 | 二级行 |
| --- | --- | --- |
| 告警设备（树名列） | 类别名，可展开 | 子类名 |
| 子级数量 | 空 | catalog 三级设备数组 length |
| 阈值 | 空 | thresholdDisplay，ellipsis |
| 告警等级 | 空 | Tag 配色 LEVEL_COLORS |
| 创建时间 | 空 | createTime |
| 操作 | 空 | 编辑、删除（红色） |

**勾选逻辑：**

- checkStrictly: true（父子不联动）
- getCheckboxProps：rowType !== 'category' 时 disabled
- 仅二级叶子行可勾选供批量删除

**设备目录（三级仅计数量）：**

- 消防设备：消火栓(6)、灭火器(8)、火灾报警(6)、烟感器(5)、温感器(4)、消防主机(3)、防火门(4)
- 监控设备：监控摄像头(8)、门禁系统(6)、红外探测器(4)、周界报警(3)
- 供水设备：生活水泵(4)、消防水泵(5)

### 6. 分页逻辑

| 参数 | 值 |
| --- | --- |
| 默认页码 | 1 |
| pageSize | 10 |
| showSizeChanger | true |
| showQuickJumper | true |
| showTotal | `共 {filteredRules.length} 条`（**规则条数，非树行数**） |
| 说明 | 树形 Table 分页对根节点分页；total 取扁平规则数 |

### 7. 页面跳转逻辑

| 触发 | 目标 | 参数 |
| --- | --- | --- |
| 菜单 alarm-settings | 本页 | 无 |
| 无跨页按钮 | — | — |

### 8. 异常场景

| 场景 | 行为 |
| --- | --- |
| 无已配置规则/筛选无命中 | 树为空，表格 Empty |
| 批量删除未选 | warning「请选择要删除的子类」 |
| 新增全重复 | error「所选子类均已配置告警规则」 |
| 表单必填为空 | Ant Form 字段下红字提示，不提交 |
| validateFields 失败 | 不关闭 Modal |
| 接口失败 | 建议 error + 保留列表 |

---

# 三、模块公共枚举数据字典

## 3.1 告警等级（ALARM_LEVELS）

| 枚举值 | 含义 | Tag 颜色 |
| --- | --- | --- |
| 一级告警 | 最高优先级，需立即响应 | #ff4d4f |
| 二级告警 | 高优先级 | #fa8c16 |
| 三级告警 | 中等优先级 | #fadb14 |
| 四级告警 | 一般提示 | #1890ff |

**统计页实时列表使用「预警」文案：** 一级预警~四级预警，颜色映射与上表一致。

## 3.2 告警状态（ALARM_STATUS，告警列表）

| 枚举值 | 含义 |
| --- | --- |
| 待处理 | 告警产生，尚未处置 |
| 已处理 | 已完成处置或自动恢复 |
| 误报 | 判定为误报 |
| 损坏 | 关联设备损坏 |

## 3.3 告警描述类型（ALARM_DESC_TYPES）

| 枚举值 | 含义 |
| --- | --- |
| 火灾报警 | 火灾类告警 |
| 故障报警 | 设备故障类 |
| 设备超时 | 设备离线超时（可模拟恢复） |

## 3.4 人防/技防（告警统计）

| 枚举值 | 含义 |
| --- | --- |
| 人防数据 | 人工巡查、人员行为类告警源 |
| 技防数据 | 设备、传感器类告警源 |

## 3.5 阈值模式（ThresholdMode，告警设置）

| 枚举值 | 含义 | thresholdDisplay |
| --- | --- | --- |
| none | 仅第三方推送，不设阈值 | 「无」 |
| deviceTimeout | 离线超过 N 分钟触发 | 「设备离线超过{N}分钟（设备超时报警）」 |

默认 N = 30（DEFAULT_TIMEOUT_MINUTES），范围 1~1440。

## 3.6 设备类型 — 告警设置目录（一级类别）

| 一级类别 | 二级子类 |
| --- | --- |
| 消防设备 | 消火栓、灭火器、火灾报警、烟感器、温感器、消防主机、防火门 |
| 监控设备 | 监控摄像头、门禁系统、红外探测器、周界报警 |
| 供水设备 | 生活水泵、消防水泵 |

## 3.7 设备类型 — 告警列表关联（ALARM_DEVICE_CATEGORIES，扁平设备名）

| 一级类别 | 二级设备名 |
| --- | --- |
| 消防设备 | 消防主机、烟感探测器、温感探测器、防火门 |
| 供水设备 | 生活水泵、消防水泵 |
| 电气设备 | 配电柜 |
| 垂直交通 | 电梯设备 |
| 安防监控 | 门禁系统、监控摄像头 |

---

# 四、接口需求清单

## 4.1 告警统计

| 接口 | 方法 | 入参 | 出参 |
| --- | --- | --- | --- |
| 查询 KPI 统计 | GET /api/alarms/statistics/kpi | period, date, defenseType? | { pending, timeout, deviceAlarm, eventReport } |
| 等级分布 | GET /api/alarms/statistics/level-distribution | period, date | [{ name, value, percent }] |
| 告警趋势 | GET /api/alarms/statistics/trend | range: today\|month\|year, period?, date? | { xLabels[], values[] } |
| 实时告警列表 | GET /api/alarms/realtime | defenseType | [{ id, name, level, levelLabel, time }] |
| 实时告警详情 | GET /api/alarms/realtime/{id} | id | { name, levelLabel, defenseType, time } |

## 4.2 告警列表

| 接口 | 方法 | 入参 | 出参 |
| --- | --- | --- | --- |
| 分页查询告警列表 | GET /api/alarms | page, pageSize, level?, status?, desc?, timeStart?, timeEnd? | { total, list: AlarmListItem[] } |
| 告警详情 | GET /api/alarms/{id} | id | AlarmListItem + facilityOrderId? |
| 模拟恢复 | POST /api/alarms/{id}/simulate-recover | id | 更新后 AlarmListItem；同步关闭设施工单 |

**AlarmListItem 字段：** id, name, level, alarmDevices[], desc, status, time, releaseTime?, autoResolved?, facilityOrderId?

## 4.3 告警设置

| 接口 | 方法 | 入参 | 出参 |
| --- | --- | --- | --- |
| 查询规则列表（树） | GET /api/alarm-rules | keyword?, level?, createTimeStart?, createTimeEnd? | 树形或扁平列表 + total |
| 查询设备目录 | GET /api/alarm-rules/catalog | — | 一级→二级 Cascader 选项 + 各二级 childCount |
| 新增规则（支持批量） | POST /api/alarm-rules | [{ rootCategory, subCategory, level, thresholdMode, customMinutes? }] | 成功条数、跳过条数 |
| 编辑规则 | PUT /api/alarm-rules/{key} | level, thresholdMode, customMinutes? | 更新后规则 |
| 单条删除 | DELETE /api/alarm-rules/{key} | key | success |
| 批量删除 | DELETE /api/alarm-rules/batch | keys[] | success count |

**规则实体字段：** key, rootCategory, subCategory, level, thresholdMode, customMinutes?, thresholdDisplay, createTime, childCount（只读，服务端按 catalog 计算）

---

**文档结束**

*生成依据：src/pages/alarm/AlarmStatistics.tsx、AlarmList.tsx、AlarmSettings2.tsx、constants.ts、mock/alarmData.ts、mock/alarmSettings2Data.ts*
