import { useState } from 'react'
import {
  Table,
  Space,
  Modal,
  Form,
  Select,
  Cascader,
  message,
  Button,
  Descriptions,
  Radio,
  InputNumber,
  Alert,
  Typography,
} from 'antd'
import SearchBar from '../../components/SearchBar'
import TableToolbar from '../../components/TableToolbar'
import { alarmRulesData, type AlarmRuleItem } from '../../mock/alarmData'
import {
  ALARM_LEVELS,
  ALARM_DEVICE_CASCADER_OPTIONS,
  DEFAULT_TIMEOUT_MINUTES,
  devicesToCascaderPaths,
  cascaderPathsToDevices,
  findDeviceCategory,
} from './constants'
import { formatThresholdDisplay, type ThresholdMode } from '../../store/alarmSync'

const { Text } = Typography

const NONE_THRESHOLD_TIP = '仅启用第三方推送的告警信息，不做额外阈值设置。'

const DEVICE_TIMEOUT_TIP =
  '本系统对设备状态做监控，设备超过设定离线判定时长未响应将被判定为离线并触发设备超时报警。当设备重新接收到传输信息后自动解除报警，告警列表中该条告警状态变更为已处理。'

export default function AlarmSettings() {
  const [data, setData] = useState<AlarmRuleItem[]>(alarmRulesData)
  const [selected, setSelected] = useState<React.Key[]>([])
  const [deviceFilter, setDeviceFilter] = useState<string>()
  const [modal, setModal] = useState<'add' | 'view' | 'edit' | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [viewRecord, setViewRecord] = useState<AlarmRuleItem | null>(null)
  const [form] = Form.useForm()
  const thresholdMode = Form.useWatch('thresholdMode', form) as ThresholdMode | undefined

  const filtered = deviceFilter ? data.filter((r) => r.alarmDevices.includes(deviceFilter)) : data

  const openModal = (type: 'add' | 'view' | 'edit', record?: AlarmRuleItem) => {
    setModal(type)
    if (type === 'add') {
      form.resetFields()
      form.setFieldsValue({
        thresholdMode: 'deviceTimeout',
        customMinutes: DEFAULT_TIMEOUT_MINUTES,
        level: '三级告警',
        alarmDevicePaths: [],
      })
      setEditingKey(null)
      setViewRecord(null)
    } else if (record) {
      form.setFieldsValue({
        alarmDevicePaths: devicesToCascaderPaths(record.alarmDevices),
        level: record.level,
        thresholdMode: record.thresholdMode,
        customMinutes: record.customMinutes ?? DEFAULT_TIMEOUT_MINUTES,
        createTime: record.createTime,
        thresholdDisplay: record.thresholdDisplay,
      })
      setEditingKey(record.key)
      setViewRecord(type === 'view' ? record : null)
    }
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const alarmDevices = cascaderPathsToDevices(values.alarmDevicePaths ?? [])
      const thresholdDisplay = formatThresholdDisplay(values.thresholdMode, values.customMinutes)
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      const row: AlarmRuleItem = {
        key: editingKey || String(Date.now()),
        alarmDevices,
        level: values.level,
        thresholdMode: values.thresholdMode,
        thresholdDisplay,
        customMinutes: values.thresholdMode === 'deviceTimeout' ? values.customMinutes : undefined,
        createTime: editingKey ? data.find((d) => d.key === editingKey)?.createTime || now : now,
      }
      if (modal === 'add') {
        setData((prev) => [row, ...prev])
        message.success('保存成功')
      } else if (modal === 'edit' && editingKey) {
        setData((prev) => prev.map((r) => (r.key === editingKey ? row : r)))
        message.success('保存成功')
      }
      setModal(null)
    })
  }

  const handleDelete = (record: AlarmRuleItem) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该告警设置吗？',
      okType: 'danger',
      onOk: () => {
        setData((prev) => prev.filter((r) => r.key !== record.key))
        message.success('删除成功')
      },
    })
  }

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    {
      title: '告警设备',
      dataIndex: 'alarmDevices',
      ellipsis: true,
      render: (v: string[]) => v?.join('、') || '-',
    },
    { title: '告警等级', dataIndex: 'level', width: 100 },
    { title: '阈值', dataIndex: 'thresholdDisplay', ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      width: 180,
      render: (_: unknown, record: AlarmRuleItem) => (
        <Space>
          <a onClick={() => openModal('view', record)}>查看</a>
          <a onClick={() => openModal('edit', record)}>编辑</a>
          <a style={{ color: '#ff4d4f' }} onClick={() => handleDelete(record)}>
            删除
          </a>
        </Space>
      ),
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
                  initialValue={DEFAULT_TIMEOUT_MINUTES}
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
      <SearchBar
        onSearch={() => message.success('搜索完成')}
        onReset={() => setDeviceFilter(undefined)}
        resetLabel="重置"
      >
        <span>告警设备：</span>
        <Cascader
          placeholder="请选择设备类别 / 设备名称"
          style={{ width: 280 }}
          allowClear
          options={ALARM_DEVICE_CASCADER_OPTIONS}
          value={deviceFilter ? devicesToCascaderPaths([deviceFilter])[0] : undefined}
          onChange={(paths) => setDeviceFilter(paths?.length ? String(paths[paths.length - 1]) : undefined)}
          displayRender={(labels) => labels.join(' / ')}
        />
      </SearchBar>
      <TableToolbar selectedCount={selected.length} onAdd={() => openModal('add')} onClearSelection={() => setSelected([])} />
      <Table
        rowKey="key"
        columns={columns}
        dataSource={filtered}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 10 }}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal
        title={modal === 'add' ? '新增告警规则' : modal === 'edit' ? '编辑告警规则' : '查看告警规则'}
        open={!!modal}
        onCancel={() => setModal(null)}
        width={600}
        destroyOnClose
        footer={
          modal === 'view' ? (
            <Button onClick={() => setModal(null)}>关闭</Button>
          ) : (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <Button onClick={() => setModal(null)} style={{ marginRight: 16 }}>
                取消
              </Button>
              <Button type="primary" onClick={handleSave}>
                保存
              </Button>
            </div>
          )
        }
      >
        {modal === 'view' && viewRecord ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="告警设备">
              {viewRecord.alarmDevices
                .map((name) => {
                  const cat = findDeviceCategory(name)
                  return cat ? `${cat} / ${name}` : name
                })
                .join('；')}
            </Descriptions.Item>
            <Descriptions.Item label="告警等级">{viewRecord.level}</Descriptions.Item>
            <Descriptions.Item label="阈值">{viewRecord.thresholdDisplay}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewRecord.createTime}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              name="alarmDevicePaths"
              label="告警设备"
              rules={[{ required: true, message: '请选择告警设备' }]}
              extra={<Text type="secondary">注：先选设备类别，再选该类别下的设备名称，可多选</Text>}
            >
              <Cascader
                multiple
                maxTagCount="responsive"
                placeholder="请选择设备类别 / 设备名称"
                options={ALARM_DEVICE_CASCADER_OPTIONS}
                displayRender={(labels) => labels.join(' / ')}
                showCheckedStrategy={Cascader.SHOW_CHILD}
              />
            </Form.Item>
            <Form.Item name="level" label="告警等级" rules={[{ required: true, message: '请选择告警等级' }]}>
              <Select placeholder="请选择告警等级" options={ALARM_LEVELS.map((v) => ({ value: v, label: v }))} />
            </Form.Item>
            {thresholdFormSection}
          </Form>
        )}
      </Modal>
    </>
  )
}
