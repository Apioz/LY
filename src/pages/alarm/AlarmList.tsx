import { useEffect, useState } from 'react'
import { Table, Select, Space, DatePicker, Tag, Modal, Descriptions, message, Button } from 'antd'
import SearchBar from '../../components/SearchBar'
import { alarmListData, type AlarmListItem } from '../../mock/alarmData'
import { ALARM_LEVELS, ALARM_STATUS, ALARM_DESC_TYPES, LEVEL_COLORS } from './constants'
import {
  findMatchingAlarmRule,
  findWorkOrderGenerationRule,
  getAlarmWorkOrderSyncRemainMinutes,
  getFacilityOrderByAlarmId,
  getFacilityWorkOrderDelayMinutes,
  shouldSyncAlarmToFacility,
  syncEligibleAlarmsToFacility,
} from '../../store/alarmSync'
import { subscribeAlarmDeviceRules } from '../../store/alarmSettingsStore'

function facilityOrderLabel(alarm: AlarmListItem) {
  const order = getFacilityOrderByAlarmId(alarm.id)
  if (order) return `${order.id}（告警同步）`

  if (alarm.status !== '待处理') {
    return '—（仅待处理告警可按规则自动生成）'
  }

  const workOrderRule = findWorkOrderGenerationRule(alarm)
  if (!workOrderRule) {
    const matched = findMatchingAlarmRule(alarm)
    if (matched && !matched.generateWorkOrder) {
      return '—（该设备告警设置未开启工单生成）'
    }
    return '—（无匹配告警设置）'
  }

  const delay = getFacilityWorkOrderDelayMinutes(alarm) ?? 5
  const remain = getAlarmWorkOrderSyncRemainMinutes(alarm)
  if (remain !== undefined && remain > 0) {
    return `告警后 ${delay} 分钟生成工单（剩余约 ${remain} 分钟）`
  }
  if (shouldSyncAlarmToFacility(alarm)) {
    return `已到生成时机，告警后 ${delay} 分钟生成工单`
  }
  return `告警后 ${delay} 分钟生成工单`
}

export default function AlarmList() {
  const [data] = useState<AlarmListItem[]>(alarmListData)
  const [levelFilter, setLevelFilter] = useState<string>()
  const [statusFilter, setStatusFilter] = useState<string>()
  const [descFilter, setDescFilter] = useState<string>()
  const [detail, setDetail] = useState<AlarmListItem | null>(null)
  const [, setTick] = useState(0)

  const runFacilitySync = () => {
    syncEligibleAlarmsToFacility(data)
  }

  useEffect(() => {
    runFacilitySync()
  }, [])

  useEffect(() => subscribeAlarmDeviceRules(runFacilitySync), [data])

  /** 定时复检：待处理告警到达生成时机后自动创建设施工单，并刷新剩余时间展示 */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((n) => n + 1)
      runFacilitySync()
    }, 30000)
    return () => window.clearInterval(timer)
  }, [data])

  const filtered = data.filter((r) => {
    if (levelFilter && r.level !== levelFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (descFilter && r.desc !== descFilter) return false
    return true
  })

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '告警编号', dataIndex: 'id', width: 160 },
    { title: '告警名称', dataIndex: 'name', width: 140 },
    {
      title: '告警等级',
      dataIndex: 'level',
      width: 100,
      render: (v: string) => <Tag color={LEVEL_COLORS[v]}>{v}</Tag>,
    },
    {
      title: '告警设备',
      dataIndex: 'alarmDevices',
      width: 160,
      ellipsis: true,
      render: (v: string[]) => v?.join('、') || '-',
    },
    {
      title: '安装位置',
      dataIndex: 'installLocation',
      width: 180,
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    { title: '告警描述', dataIndex: 'desc', width: 110 },
    {
      title: '告警状态',
      dataIndex: 'status',
      width: 90,
      render: (v: string) => {
        const color = v === '待处理' ? 'processing' : v === '已处理' ? 'success' : v === '误报' ? 'warning' : 'error'
        return <Tag color={color}>{v}</Tag>
      },
    },
    { title: '告警时间', dataIndex: 'time', width: 170 },
    { title: '解除告警时间', dataIndex: 'releaseTime', width: 170, render: (v: string) => v || '-' },
    {
      title: '操作',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: AlarmListItem) => <a onClick={() => setDetail(record)}>详情</a>,
    },
  ]

  return (
    <>
      <SearchBar
        onSearch={() => message.success('搜索完成')}
        onReset={() => {
          setLevelFilter(undefined)
          setStatusFilter(undefined)
          setDescFilter(undefined)
        }}
      >
        <Space wrap>
          <span>告警等级：</span>
          <Select
            placeholder="请选择告警等级"
            style={{ width: 160 }}
            allowClear
            value={levelFilter}
            onChange={setLevelFilter}
            options={ALARM_LEVELS.map((v) => ({ value: v, label: v }))}
          />
          <span>告警状态：</span>
          <Select
            placeholder="请选择告警状态"
            style={{ width: 160 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={ALARM_STATUS.map((v) => ({ value: v, label: v }))}
          />
          <span>告警描述：</span>
          <Select
            placeholder="请选择告警描述"
            style={{ width: 160 }}
            allowClear
            value={descFilter}
            onChange={setDescFilter}
            options={ALARM_DESC_TYPES.map((v) => ({ value: v, label: v }))}
          />
          <span>告警时间：</span>
          <DatePicker.RangePicker />
        </Space>
      </SearchBar>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        scroll={{ x: 1480 }}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 10, showSizeChanger: true }}
        style={{ padding: 16 }}
      />
      <Modal
        title="告警详情"
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={<Button onClick={() => setDetail(null)}>关闭</Button>}
        width={560}
      >
        {detail && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="告警编号">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="告警名称">{detail.name}</Descriptions.Item>
            <Descriptions.Item label="告警等级">{detail.level}</Descriptions.Item>
            <Descriptions.Item label="告警设备">{detail.alarmDevices?.join('、')}</Descriptions.Item>
            <Descriptions.Item label="安装位置">{detail.installLocation || '—'}</Descriptions.Item>
            <Descriptions.Item label="告警描述">{detail.desc}</Descriptions.Item>
            <Descriptions.Item label="告警状态">
              {detail.status}
              {detail.autoResolved ? '（设备恢复传输自动解除）' : ''}
            </Descriptions.Item>
            <Descriptions.Item label="告警时间">{detail.time}</Descriptions.Item>
            <Descriptions.Item label="解除告警时间">{detail.releaseTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="设施工单">{facilityOrderLabel(detail)}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}
