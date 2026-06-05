import { useMemo, useState } from 'react'
import {
  Table,
  Space,
  Modal,
  Form,
  Select,
  Input,
  message,
  Button,
  DatePicker,
  Radio,
  InputNumber,
  Alert,
  Cascader,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import SearchBar from '../../components/SearchBar'
import TableToolbar from '../../components/TableToolbar'
import { ALARM_LEVELS, LEVEL_COLORS } from './constants'
import { formatThresholdDisplay, type ThresholdMode } from '../../store/alarmSync'
import {
  initialAlarmDeviceRules2,
  buildAlarmSettings2Tree,
  buildDeviceCatalogCascaderOptions,
  createSubCategoryRule,
  findDeviceRule,
  subCategoryPathKey,
  pathsToSubCategorySelections,
  ruleToSubCategoryPath,
  DEFAULT_TIMEOUT_MINUTES,
  type AlarmDeviceRule2,
  type AlarmSettings2TreeRow,
} from '../../mock/alarmSettings2Data'

const { Text } = Typography

const COL_WIDTH = 160
const COLUMN_COUNT = 6
const NONE_THRESHOLD_TIP = '仅启用第三方推送的告警信息，不做额外阈值设置。'
const DEVICE_TIMEOUT_TIP =
  '本系统对设备状态做监控，设备超过设定离线判定时长未响应将被判定为离线并触发设备超时报警。'

const catalogOptions = buildDeviceCatalogCascaderOptions()

function filterRules(
  rules: AlarmDeviceRule2[],
  deviceKeyword?: string,
  level?: string,
  dateRange?: [Dayjs, Dayjs] | null,
) {
  return rules.filter((r) => {
    if (deviceKeyword?.trim()) {
      const kw = deviceKeyword.trim().toLowerCase()
      const hit =
        r.subCategory.toLowerCase().includes(kw) || r.rootCategory.toLowerCase().includes(kw)
      if (!hit) return false
    }
    if (level && r.level !== level) return false
    if (dateRange?.[0] && dateRange?.[1]) {
      const t = new Date(r.createTime.replace(/-/g, '/')).getTime()
      const start = dateRange[0].startOf('day').valueOf()
      const end = dateRange[1].endOf('day').valueOf()
      if (t < start || t > end) return false
    }
    return true
  })
}

function collectExpandKeysForSearch(rules: AlarmDeviceRule2[]): React.Key[] {
  const keys = new Set<React.Key>()
  rules.forEach((r) => {
    keys.add(`root-${r.rootCategory}`)
  })
  return [...keys]
}

export default function AlarmSettings2() {
  const [rules, setRules] = useState<AlarmDeviceRule2[]>(initialAlarmDeviceRules2)
  const [selected, setSelected] = useState<React.Key[]>([])
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])
  const [draftKeyword, setDraftKeyword] = useState('')
  const [draftLevel, setDraftLevel] = useState<string>()
  const [draftDateRange, setDraftDateRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [appliedLevel, setAppliedLevel] = useState<string>()
  const [appliedDateRange, setAppliedDateRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [form] = Form.useForm()
  const thresholdMode = Form.useWatch('thresholdMode', form) as ThresholdMode | undefined

  const filteredRules = useMemo(
    () => filterRules(rules, appliedKeyword, appliedLevel, appliedDateRange),
    [rules, appliedKeyword, appliedLevel, appliedDateRange],
  )

  const displayFilter = useMemo(
    () => ({
      keyword: appliedKeyword,
      level: appliedLevel,
      dateStart: appliedDateRange?.[0]?.startOf('day').valueOf(),
      dateEnd: appliedDateRange?.[1]?.endOf('day').valueOf(),
    }),
    [appliedKeyword, appliedLevel, appliedDateRange],
  )

  const treeData = useMemo(
    () => buildAlarmSettings2Tree(rules, displayFilter),
    [rules, displayFilter],
  )

  const handleSearch = () => {
    setAppliedKeyword(draftKeyword)
    setAppliedLevel(draftLevel)
    setAppliedDateRange(draftDateRange)
    const nextFiltered = filterRules(rules, draftKeyword, draftLevel, draftDateRange)
    if (draftKeyword.trim() || draftLevel || draftDateRange) {
      setExpandedRowKeys(collectExpandKeysForSearch(nextFiltered))
    } else {
      setExpandedRowKeys([])
    }
    message.success('查询完成')
  }

  const handleClear = () => {
    setDraftKeyword('')
    setDraftLevel(undefined)
    setDraftDateRange(null)
    setAppliedKeyword('')
    setAppliedLevel(undefined)
    setAppliedDateRange(null)
    setExpandedRowKeys([])
  }

  const openAdd = (presetPaths?: string[][]) => {
    setModal('add')
    setEditingKey(null)
    form.resetFields()
    form.setFieldsValue({
      subCategoryPaths: presetPaths ?? [],
      thresholdMode: 'deviceTimeout',
      customMinutes: DEFAULT_TIMEOUT_MINUTES,
      level: '三级告警',
    })
  }

  const openEdit = (ruleKey: string) => {
    const record = findDeviceRule(rules, ruleKey)
    if (!record) return
    setModal('edit')
    setEditingKey(ruleKey)
    form.setFieldsValue({
      subCategoryPaths: [ruleToSubCategoryPath(record)],
      level: record.level,
      thresholdMode: record.thresholdMode,
      customMinutes: record.customMinutes ?? DEFAULT_TIMEOUT_MINUTES,
    })
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const thresholdDisplay = formatThresholdDisplay(values.thresholdMode, values.customMinutes)

      if (modal === 'add') {
        const selections = pathsToSubCategorySelections(values.subCategoryPaths ?? [])
        if (!selections.length) {
          message.warning('请至少选择一个二级子类')
          return
        }
        const existing = new Set(rules.map((r) => subCategoryPathKey(r.rootCategory, r.subCategory)))
        const toAdd = selections.filter(
          (s) => !existing.has(subCategoryPathKey(s.rootCategory, s.subCategory)),
        )
        const skipped = selections.length - toAdd.length
        if (!toAdd.length) {
          message.error('所选子类均已配置告警规则')
          return
        }
        const newRows = toAdd.map((s, i) =>
          createSubCategoryRule(
            {
              rootCategory: s.rootCategory,
              subCategory: s.subCategory,
              level: values.level,
              thresholdMode: values.thresholdMode,
              customMinutes: values.customMinutes,
            },
            `${Date.now()}-${i}`,
          ),
        )
        setRules((prev) => [...prev, ...newRows])
        message.success(skipped > 0 ? `新增 ${toAdd.length} 条，${skipped} 条已存在已跳过` : `新增 ${toAdd.length} 条成功`)
      } else if (modal === 'edit' && editingKey) {
        setRules((prev) =>
          prev.map((r) =>
            r.key === editingKey
              ? {
                  ...r,
                  level: values.level,
                  thresholdMode: values.thresholdMode,
                  customMinutes: values.thresholdMode === 'deviceTimeout' ? values.customMinutes : undefined,
                  thresholdDisplay,
                }
              : r,
          ),
        )
        message.success('保存成功')
      }
      setModal(null)
    })
  }

  const handleDelete = (ruleKey: string) => {
    const record = findDeviceRule(rules, ruleKey)
    if (!record) return
    Modal.confirm({
      title: '确认删除',
      content: `确定删除「${record.rootCategory} / ${record.subCategory}」的告警设置吗？`,
      okType: 'danger',
      onOk: () => {
        setRules((prev) => prev.filter((r) => r.key !== ruleKey))
        setSelected((prev) => prev.filter((k) => k !== ruleKey))
        message.success('删除成功')
      },
    })
  }

  const handleBatchDelete = () => {
    const ruleKeys = selected.filter((k) => rules.some((r) => r.key === k))
    if (!ruleKeys.length) {
      message.warning('请选择要删除的子类')
      return
    }
    Modal.confirm({
      title: '批量删除',
      content: `确定删除选中的 ${ruleKeys.length} 条告警设置吗？`,
      okType: 'danger',
      onOk: () => {
        setRules((prev) => prev.filter((r) => !ruleKeys.includes(r.key)))
        setSelected([])
        message.success('删除成功')
      },
    })
  }

  const isCategoryRow = (record: AlarmSettings2TreeRow) => record.rowType === 'category'

  const columns: ColumnsType<AlarmSettings2TreeRow> = [
    {
      title: '告警设备',
      dataIndex: 'name',
      width: COL_WIDTH,
      ellipsis: true,
    },
    {
      title: '子级数量',
      dataIndex: 'childCount',
      width: COL_WIDTH,
      align: 'center',
      render: (v, record) => (isCategoryRow(record) ? v : ''),
    },
    {
      title: '阈值',
      dataIndex: 'thresholdDisplay',
      width: COL_WIDTH,
      ellipsis: true,
      render: (v, record) => (isCategoryRow(record) ? v : ''),
    },
    {
      title: '告警等级',
      dataIndex: 'level',
      width: COL_WIDTH,
      align: 'center',
      render: (v, record) =>
        isCategoryRow(record) ? <Tag color={LEVEL_COLORS[v]}>{v}</Tag> : '',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: COL_WIDTH,
      ellipsis: true,
      render: (v, record) => (isCategoryRow(record) ? v : ''),
    },
    {
      title: '操作',
      width: COL_WIDTH,
      align: 'center',
      render: (_v, record) =>
        isCategoryRow(record) ? (
          <Space size={8}>
            <a onClick={() => openEdit(record.key)}>编辑</a>
            <a style={{ color: '#ff4d4f' }} onClick={() => handleDelete(record.key)}>
              删除
            </a>
          </Space>
        ) : null,
    },
  ]

  const thresholdFormSection = (
    <Form.Item label="告警阈值" required>
      <Form.Item name="thresholdMode" noStyle rules={[{ required: true, message: '请选择告警阈值类型' }]}>
        <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Radio value="none">无</Radio>
            {thresholdMode === 'none' && (
              <Alert type="info" showIcon message={NONE_THRESHOLD_TIP} style={{ marginTop: 8 }} />
            )}
          </div>
          <div>
            <Radio value="deviceTimeout">设备超时设置</Radio>
            {thresholdMode === 'deviceTimeout' && (
              <>
                <Alert type="info" showIcon message={DEVICE_TIMEOUT_TIP} style={{ marginTop: 8, marginBottom: 12 }} />
                <Form.Item
                  name="customMinutes"
                  label="离线判定时长"
                  rules={[{ required: true, message: '请输入离线判定时长' }]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={1} max={1440} addonAfter="分钟" style={{ width: '100%' }} />
                </Form.Item>
              </>
            )}
          </div>
        </Radio.Group>
      </Form.Item>
    </Form.Item>
  )

  return (
    <>
      <SearchBar onSearch={handleSearch} onClear={handleClear} clearLabel="清空">
        <Space wrap size="middle">
          <span>告警设备：</span>
          <Input
            placeholder="请输入"
            style={{ width: 160 }}
            value={draftKeyword}
            onChange={(e) => setDraftKeyword(e.target.value)}
            allowClear
          />
          <span>告警等级：</span>
          <Select
            placeholder="请选择"
            style={{ width: 160 }}
            allowClear
            value={draftLevel}
            onChange={setDraftLevel}
            options={ALARM_LEVELS.map((v) => ({ value: v, label: v }))}
          />
          <span>创建时间：</span>
          <DatePicker.RangePicker
            value={draftDateRange}
            onChange={(v) => setDraftDateRange(v as [Dayjs, Dayjs] | null)}
          />
        </Space>
      </SearchBar>
      <TableToolbar
        selectedCount={selected.length}
        onAdd={() => openAdd()}
        onBatchDelete={handleBatchDelete}
        onClearSelection={() => setSelected([])}
      />
      <Table<AlarmSettings2TreeRow>
        rowKey="key"
        size="middle"
        tableLayout="fixed"
        columns={columns}
        dataSource={treeData}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
        }}
        pagination={{
          showTotal: () => `共 ${filteredRules.length} 条`,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        rowSelection={{
          selectedRowKeys: selected,
          onChange: setSelected,
          checkStrictly: true,
          getCheckboxProps: (record) => ({
            disabled: record.rowType !== 'category',
          }),
        }}
        scroll={{ x: COL_WIDTH * COLUMN_COUNT + 48 }}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal
        title={modal === 'add' ? '新增告警设置' : '编辑告警设置'}
        open={!!modal}
        onCancel={() => setModal(null)}
        width={600}
        destroyOnClose
        footer={
          <div style={{ textAlign: 'center', width: '100%' }}>
            <Button onClick={() => setModal(null)} style={{ marginRight: 16 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subCategoryPaths"
            label="告警设备"
            rules={[{ required: true, message: '请选择告警设备' }]}
            extra={
              <Text type="secondary">
                {modal === 'add'
                  ? '先选设备类别，再选二级子类，可多选（精确到二级子项）'
                  : '编辑时不可更改设备，仅可调整等级与阈值'}
              </Text>
            }
          >
            <Cascader
              multiple={modal === 'add'}
              disabled={modal === 'edit'}
              maxTagCount="responsive"
              placeholder="请选择设备类别 / 二级子类"
              options={catalogOptions}
              displayRender={(labels) => labels.join(' / ')}
              showCheckedStrategy={Cascader.SHOW_CHILD}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="level" label="告警等级" rules={[{ required: true, message: '请选择告警等级' }]}>
            <Select placeholder="请选择" options={ALARM_LEVELS.map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          {thresholdFormSection}
        </Form>
      </Modal>
    </>
  )
}
