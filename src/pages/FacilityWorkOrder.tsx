import { useEffect, useMemo, useState } from 'react'
import {
  Table,
  Select,
  Space,
  DatePicker,
  Tag,
  Modal,
  Descriptions,
  Tabs,
  Alert,
  Button,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import SearchBar from '../components/SearchBar'
import {
  FACILITY_ORDER_STATUS,
  getFacilityOrders,
  getFacilitySubmitNote,
  subscribeFacility,
  type FacilityOrderItem,
  type FacilityOrderStatus,
} from '../store/alarmSync'
import { ALARM_LEVELS, ALARM_DEVICES, LEVEL_COLORS } from './alarm/constants'

type StatusTabKey = 'all' | 'processing' | 'unprocessed' | 'processed' | 'damaged'

const STATUS_TABS: { key: StatusTabKey; label: string; status?: FacilityOrderStatus }[] = [
  { key: 'all', label: '全部' },
  { key: 'processing', label: '处理中', status: '处理中' },
  { key: 'unprocessed', label: '未处理', status: '待处理' },
  { key: 'processed', label: '已处理', status: '已处理' },
  { key: 'damaged', label: '损坏', status: '损坏' },
]

const statusColor: Record<string, string> = {
  待处理: 'warning',
  处理中: 'processing',
  已处理: 'success',
  损坏: 'error',
}

const COL_WIDTH = 132

interface ListFilters {
  status?: string
  level?: string
  device?: string
  month?: Dayjs | null
}

function matchMonth(alarmTime: string, month: Dayjs) {
  return alarmTime.startsWith(month.format('YYYY-MM'))
}

export default function FacilityWorkOrder() {
  const [data, setData] = useState<FacilityOrderItem[]>(getFacilityOrders())
  const [statusTab, setStatusTab] = useState<StatusTabKey>('all')
  const [draftStatus, setDraftStatus] = useState<string>()
  const [draftLevel, setDraftLevel] = useState<string>()
  const [draftDevice, setDraftDevice] = useState<string>()
  const [draftMonth, setDraftMonth] = useState<Dayjs | null>(null)
  const [applied, setApplied] = useState<ListFilters>({})
  const [detail, setDetail] = useState<FacilityOrderItem | null>(null)

  useEffect(() => {
    return subscribeFacility(() => setData([...getFacilityOrders()]))
  }, [])

  const tabStatus = STATUS_TABS.find((t) => t.key === statusTab)?.status

  const filtered = useMemo(() => {
    let rows = data
    if (tabStatus) rows = rows.filter((r) => r.status === tabStatus)
    if (applied.status) rows = rows.filter((r) => r.status === applied.status)
    if (applied.level) rows = rows.filter((r) => r.level === applied.level)
    if (applied.device) rows = rows.filter((r) => r.alarmDevices?.includes(applied.device!))
    if (applied.month) rows = rows.filter((r) => matchMonth(r.alarmTime, applied.month!))
    return rows
  }, [data, tabStatus, applied])

  const columns: ColumnsType<FacilityOrderItem> = useMemo(
    () => [
      { title: '序号', width: 64, align: 'center', render: (_v, _r, i) => i + 1 },
      { title: '工单编号', dataIndex: 'id', width: COL_WIDTH, ellipsis: true },
      {
        title: '告警设备',
        dataIndex: 'alarmDevices',
        width: COL_WIDTH,
        ellipsis: true,
        render: (v: string[]) => v?.join('、') || '-',
      },
      {
        title: '安装位置',
        dataIndex: 'installLocation',
        width: COL_WIDTH,
        ellipsis: true,
        render: (v: string) => v || '-',
      },
      {
        title: '告警等级',
        dataIndex: 'level',
        width: COL_WIDTH,
        align: 'center',
        render: (v: string) => <Tag color={LEVEL_COLORS[v]}>{v}</Tag>,
      },
      { title: '告警描述', dataIndex: 'desc', width: COL_WIDTH, ellipsis: true },
      { title: '告警时间', dataIndex: 'alarmTime', width: COL_WIDTH, ellipsis: true },
      {
        title: '工单状态',
        dataIndex: 'status',
        width: COL_WIDTH,
        align: 'center',
        render: (v: string) => <Tag color={statusColor[v] ?? 'default'}>{v}</Tag>,
      },
      { title: '接单人', dataIndex: 'receiver', width: COL_WIDTH, ellipsis: true },
      {
        title: '操作',
        width: 80,
        fixed: 'right',
        align: 'center',
        render: (_v, record) => <a onClick={() => setDetail(record)}>查看</a>,
      },
    ],
    [],
  )

  const handleSearch = () => {
    setApplied({
      status: draftStatus,
      level: draftLevel,
      device: draftDevice,
      month: draftMonth,
    })
  }

  const handleReset = () => {
    setDraftStatus(undefined)
    setDraftLevel(undefined)
    setDraftDevice(undefined)
    setDraftMonth(null)
    setApplied({})
    setStatusTab('all')
  }

  const scrollX = COL_WIDTH * 8 + 64 + 80

  return (
    <>
      <SearchBar onSearch={handleSearch} onReset={handleReset} resetLabel="重置">
        <Space wrap size="middle">
          <span>工单状态：</span>
          <Select
            placeholder="请选择工单状态"
            style={{ width: 160 }}
            allowClear
            value={draftStatus}
            onChange={setDraftStatus}
            options={FACILITY_ORDER_STATUS.map((v) => ({ value: v, label: v }))}
          />
          <span>告警等级：</span>
          <Select
            placeholder="请选择告警等级"
            style={{ width: 160 }}
            allowClear
            value={draftLevel}
            onChange={setDraftLevel}
            options={ALARM_LEVELS.map((v) => ({ value: v, label: v }))}
          />
          <span>告警设备：</span>
          <Select
            placeholder="请选择告警设备"
            style={{ width: 160 }}
            allowClear
            value={draftDevice}
            onChange={setDraftDevice}
            options={ALARM_DEVICES.map((v) => ({ value: v, label: v }))}
          />
          <span>告警月份：</span>
          <DatePicker
            picker="month"
            placeholder="请选择月份"
            style={{ width: 160 }}
            value={draftMonth}
            onChange={setDraftMonth}
            allowClear
          />
        </Space>
      </SearchBar>
      <Tabs
        style={{ padding: '0 16px', marginBottom: 0 }}
        activeKey={statusTab}
        onChange={(k) => setStatusTab(k as StatusTabKey)}
        items={STATUS_TABS.map((t) => ({ key: t.key, label: t.label }))}
      />
      <Alert
        type="info"
        showIcon
        banner
        style={{ margin: '0 16px 12px' }}
        message="注：损坏状态的工单可被维修人员再次接单，进行维修处理"
      />
      <Table
        rowKey="id"
        tableLayout="fixed"
        columns={columns}
        dataSource={filtered}
        scroll={{ x: scrollX }}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 10, showSizeChanger: true }}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal
        title="工单详情"
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={
          <Button onClick={() => setDetail(null)}>关闭</Button>
        }
        width={600}
      >
        {detail && (() => {
          const falseAlarmNote = getFacilitySubmitNote(detail, '误报说明')
          const repairNote = getFacilitySubmitNote(detail, '维修描述')
          const damageNote = getFacilitySubmitNote(detail, '损坏描述')
          const showSubmitNotes = !!(falseAlarmNote || repairNote || detail.status === '损坏')

          return (
            <>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="工单编号">{detail.id}</Descriptions.Item>
                <Descriptions.Item label="告警设备">{detail.alarmDevices?.join('、')}</Descriptions.Item>
                <Descriptions.Item label="安装位置">{detail.installLocation || '—'}</Descriptions.Item>
                <Descriptions.Item label="告警等级">{detail.level}</Descriptions.Item>
                <Descriptions.Item label="告警描述">{detail.desc}</Descriptions.Item>
                <Descriptions.Item label="告警时间">{detail.alarmTime}</Descriptions.Item>
                <Descriptions.Item label="工单状态">{detail.status}</Descriptions.Item>
                <Descriptions.Item label="接单人">{detail.receiver}</Descriptions.Item>
                {falseAlarmNote && (
                  <Descriptions.Item label="误报说明">{falseAlarmNote}</Descriptions.Item>
                )}
                {repairNote && <Descriptions.Item label="维修描述">{repairNote}</Descriptions.Item>}
                {detail.status === '损坏' && (
                  <Descriptions.Item label="损坏描述">
                    {damageNote || <span style={{ color: '#999' }}>暂无</span>}
                  </Descriptions.Item>
                )}
              </Descriptions>
              {showSubmitNotes && (
                <Alert
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                  message="误报说明、维修描述、损坏描述由小程序运维人员在完成工单时填写，中台仅可查看。"
                />
              )}
            </>
          )
        })()}
      </Modal>
    </>
  )
}
