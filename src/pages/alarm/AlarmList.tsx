import { useState } from 'react'
import { Table, Select, Space, DatePicker, Tag, Modal, Descriptions, message, Button } from 'antd'
import SearchBar from '../../components/SearchBar'
import { alarmListData, type AlarmListItem } from '../../mock/alarmData'
import { ALARM_LEVELS, ALARM_STATUS, ALARM_TYPES, LEVEL_COLORS } from './constants'

export default function AlarmList() {
  const [data, setData] = useState<AlarmListItem[]>(alarmListData)
  const [levelFilter, setLevelFilter] = useState<string>()
  const [statusFilter, setStatusFilter] = useState<string>()
  const [detail, setDetail] = useState<AlarmListItem | null>(null)

  const filtered = data.filter((r) => {
    if (levelFilter && r.level !== levelFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    return true
  })

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '告警ID', dataIndex: 'id', width: 160 },
    { title: '告警名称', dataIndex: 'name', width: 140 },
    {
      title: '告警等级',
      dataIndex: 'level',
      width: 100,
      render: (v: string) => <Tag color={LEVEL_COLORS[v]}>{v}</Tag>,
    },
    { title: '告警类型', dataIndex: 'type', width: 100 },
    { title: '告警描述', dataIndex: 'desc', ellipsis: true },
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
      render: (_: unknown, record: AlarmListItem) => (
        <a onClick={() => setDetail(record)}>详情</a>
      ),
    },
  ]

  const handleRelease = () => {
    if (!detail || detail.status !== '待处理') return
    Modal.confirm({
      title: '解除告警',
      content: `确认解除告警「${detail.name}」？`,
      onOk: () => {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
        setData((prev) =>
          prev.map((r) =>
            r.id === detail.id ? { ...r, status: '已处理' as const, releaseTime: now } : r,
          ),
        )
        setDetail((d) => (d ? { ...d, status: '已处理', releaseTime: now } : null))
        message.success('告警已解除')
      },
    })
  }

  return (
    <>
      <SearchBar onSearch={() => message.success('搜索完成')} onReset={() => { setLevelFilter(undefined); setStatusFilter(undefined) }}>
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
          <span>告警类型：</span>
          <Select placeholder="请选择告警类型" style={{ width: 160 }} allowClear options={ALARM_TYPES.map((v) => ({ value: v }))} />
          <span>告警时间：</span>
          <DatePicker.RangePicker />
        </Space>
      </SearchBar>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        scroll={{ x: 1300 }}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 10, showSizeChanger: true }}
        style={{ padding: 16 }}
      />
      <Modal
        title="告警详情"
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={
          detail?.status === '待处理' ? (
            <Space>
              <Button type="primary" onClick={handleRelease}>
                解除告警
              </Button>
              <Button onClick={() => setDetail(null)}>关闭</Button>
            </Space>
          ) : (
            <Button onClick={() => setDetail(null)}>关闭</Button>
          )
        }
        width={560}
      >
        {detail && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="告警ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="告警名称">{detail.name}</Descriptions.Item>
            <Descriptions.Item label="告警等级">{detail.level}</Descriptions.Item>
            <Descriptions.Item label="告警类型">{detail.type}</Descriptions.Item>
            <Descriptions.Item label="告警描述">{detail.desc}</Descriptions.Item>
            <Descriptions.Item label="告警状态">{detail.status}</Descriptions.Item>
            <Descriptions.Item label="告警时间">{detail.time}</Descriptions.Item>
            <Descriptions.Item label="解除告警时间">{detail.releaseTime || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}
