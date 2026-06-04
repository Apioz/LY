import { useState } from 'react'
import { Table, Select, Space, DatePicker, Tag, Modal, Descriptions, message, Button } from 'antd'
import SearchBar from '../../components/SearchBar'
import { alarmListData, type AlarmListItem } from '../../mock/alarmData'
import { ALARM_LEVELS, ALARM_STATUS, ALARM_DESC_TYPES, LEVEL_COLORS } from './constants'
import { syncAlarmToFacility, closeFacilityByAlarm } from '../../store/alarmSync'

export default function AlarmList() {
  const [data, setData] = useState<AlarmListItem[]>(alarmListData)
  const [levelFilter, setLevelFilter] = useState<string>()
  const [statusFilter, setStatusFilter] = useState<string>()
  const [descFilter, setDescFilter] = useState<string>()
  const [detail, setDetail] = useState<AlarmListItem | null>(null)

  const filtered = data.filter((r) => {
    if (levelFilter && r.level !== levelFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (descFilter && r.desc !== descFilter) return false
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
    {
      title: '告警设备',
      dataIndex: 'alarmDevices',
      width: 160,
      ellipsis: true,
      render: (v: string[]) => v?.join('、') || '-',
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
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: AlarmListItem) => (
        <Space>
          <a onClick={() => setDetail(record)}>详情</a>
          {record.status === '待处理' && record.desc === '设备超时' && (
            <a
              onClick={() => {
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
                setData((prev) =>
                  prev.map((r) =>
                    r.id === record.id
                      ? { ...r, status: '已处理' as const, releaseTime: now, autoResolved: true }
                      : r,
                  ),
                )
                closeFacilityByAlarm(record.id)
                message.success('设备已恢复传输，告警已自动解除，状态变更为已处理')
              }}
            >
              模拟恢复
            </a>
          )}
          {record.status === '待处理' && (
            <a
              onClick={() => {
                syncAlarmToFacility(record)
                message.success('告警工单已同步至设施工单，请运维人员处理')
              }}
            >
              同步工单
            </a>
          )}
        </Space>
      ),
    },
  ]

  const handleRelease = () => {
    if (!detail || detail.status !== '待处理') return
    Modal.confirm({
      title: '解除告警',
      content: (
        <div>
          <p>确认解除告警「{detail.name}」？</p>
          <p style={{ color: '#666', fontSize: 13 }}>解除后将同步关闭设施工单中关联的告警处置工单，完成闭环。</p>
        </div>
      ),
      onOk: () => {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
        setData((prev) =>
          prev.map((r) =>
            r.id === detail.id ? { ...r, status: '已处理' as const, releaseTime: now } : r,
          ),
        )
        closeFacilityByAlarm(detail.id)
        setDetail((d) => (d ? { ...d, status: '已处理', releaseTime: now } : null))
        message.success('告警已解除，设施工单已关闭')
      },
    })
  }

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
            <Descriptions.Item label="告警设备">{detail.alarmDevices?.join('、')}</Descriptions.Item>
            <Descriptions.Item label="告警描述">{detail.desc}</Descriptions.Item>
            <Descriptions.Item label="告警状态">
              {detail.status}
              {detail.autoResolved ? '（设备恢复传输自动解除）' : ''}
            </Descriptions.Item>
            <Descriptions.Item label="告警时间">{detail.time}</Descriptions.Item>
            <Descriptions.Item label="解除告警时间">{detail.releaseTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="设施工单">
              {detail.desc === '设备超时' || detail.status === '待处理'
                ? `SG-${detail.id}（告警同步）`
                : '—'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}
