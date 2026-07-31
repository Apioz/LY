import { useEffect, useMemo, useState } from 'react'
import { Select, Space, DatePicker, Tag, Modal, Descriptions, Alert, Button, Divider, Typography } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import SearchBar from '../components/SearchBar'
import AdminTable from '../components/AdminTable'
import FacilityWorkOrderSettingsModal from '../components/FacilityWorkOrderSettingsModal'
import FacilityFlowTimeline from '../components/FacilityFlowTimeline'
import {
  FACILITY_PROCESS_STATUS,
  facilityProcessStatusMatchesFilter,
  facilitySlaColorHex,
  getFacilityOrders,
  getFacilityArrivalTime,
  getFacilitySubmitNote,
  resolveFacilityStatusView,
  subscribeFacility,
  subscribeFacilityWorkOrderSettings,
  type FacilityOrderItem,
  type FacilityProcessStatus,
} from '../store/alarmSync'
import { canEditFacilityWorkOrderSettings } from '../store/platformUser'
import { ALARM_LEVELS, ALARM_DEVICES, LEVEL_COLORS } from './alarm/constants'
import { COMMUNITIES, matchesCommunityName } from '../constants/communities'

const workOrderStatusColor: Record<string, string> = {
  待处理: 'warning',
  处理中: 'processing',
  已处理: 'success',
  损坏: 'error',
}

const processStatusColor: Record<string, string> = {
  待处理: 'default',
  超时待处理: 'error',
  处理中: 'processing',
  逾期处理中: 'warning',
  损坏待处理: 'error',
  已处理: 'success',
}


function matchMonth(alarmTime: string, month: Dayjs) {
  return alarmTime.startsWith(month.format('YYYY-MM'))
}

export default function FacilityWorkOrder() {
  const [data, setData] = useState<FacilityOrderItem[]>(getFacilityOrders())
  const [processStatus, setProcessStatus] = useState<FacilityProcessStatus>()
  const [community, setCommunity] = useState<string>()
  const [level, setLevel] = useState<string>()
  const [device, setDevice] = useState<string>()
  const [month, setMonth] = useState<Dayjs | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [slaTick, setSlaTick] = useState(0)
  const canEditSettings = canEditFacilityWorkOrderSettings()

  const detail = useMemo(
    () => (detailId ? data.find((row) => row.id === detailId) ?? null : null),
    [data, detailId],
  )

  useEffect(() => {
    return subscribeFacility(() => setData([...getFacilityOrders()]))
  }, [])

  useEffect(() => subscribeFacilityWorkOrderSettings(() => setSlaTick((t) => t + 1)), [])

  useEffect(() => {
    const timer = window.setInterval(() => setSlaTick((t) => t + 1), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const now = useMemo(() => Date.now(), [slaTick, data])

  const filtered = useMemo(() => {
    let rows = data
    if (processStatus) {
      rows = rows.filter((r) => facilityProcessStatusMatchesFilter(r, processStatus, now))
    }
    if (community) rows = rows.filter((r) => matchesCommunityName(r.community, community))
    if (level) rows = rows.filter((r) => r.level === level)
    if (device) rows = rows.filter((r) => r.alarmDevice === device)
    if (month) rows = rows.filter((r) => matchMonth(r.alarmTime, month))
    return rows
  }, [data, processStatus, community, level, device, month, now])

  const handleReset = () => {
    setProcessStatus(undefined)
    setCommunity(undefined)
    setLevel(undefined)
    setDevice(undefined)
    setMonth(null)
  }

  const columns: ColumnsType<FacilityOrderItem> = useMemo(
    () => [
      { title: '序号', align: 'center', render: (_v, _r, i) => i + 1 },
      { title: '工单编号', dataIndex: 'id', ellipsis: true },
      {
        title: '小区名称',
        dataIndex: 'community',
        ellipsis: true,
        render: (v: string) => v || '—',
      },
      {
        title: '告警设备',
        dataIndex: 'alarmDevice',
        ellipsis: true,
        render: (v: string) => v || '-',
      },
      {
        title: '安装位置',
        dataIndex: 'installLocation',
        ellipsis: true,
        render: (v: string) => v || '-',
      },
      {
        title: '告警等级',
        dataIndex: 'level',
        align: 'center',
        render: (v: string) => <Tag color={LEVEL_COLORS[v]}>{v}</Tag>,
      },
      { title: '告警描述', dataIndex: 'desc', ellipsis: true },
      { title: '告警时间', dataIndex: 'alarmTime', ellipsis: true },
      { title: '工单状态',
        align: 'center',
        render: (_v, record) => {
          const view = resolveFacilityStatusView(record, undefined, now)
          return (
            <Tag color={workOrderStatusColor[view.workOrderStatus] ?? 'default'}>{view.workOrderStatus}</Tag>
          )
        },
      },
      {
        title: '处理状态',
        align: 'center',
        render: (_v, record) => {
          const view = resolveFacilityStatusView(record, undefined, now)
          return (
            <Tag color={processStatusColor[view.processStatus] ?? 'default'}>{view.processStatus}</Tag>
          )
        },
      },
      {
        title: '剩余天数',
        align: 'center',
        render: (_v, record) => {
          const view = resolveFacilityStatusView(record, undefined, now)
          if (view.label === '—') return '—'
          return <span style={{ color: facilitySlaColorHex(view.color), fontWeight: 500 }}>{view.label}</span>
        },
      },
      { title: '接单人', dataIndex: 'receiver', ellipsis: true },
      { title: '操作',
        fixed: 'right',
        align: 'center',
        render: (_v, record) => <a onClick={() => setDetailId(record.id)}>查看</a>,
      },
    ],
    [now],
  )

  return (
    <>
      <SearchBar onSearch={() => {}} onReset={handleReset} resetLabel="重置">
        <Space wrap size="middle">
          <span>处理状态：</span>
          <Select
            placeholder="请选择处理状态"
            style={{ width: 150 }}
            allowClear
            value={processStatus}
            onChange={setProcessStatus}
            options={FACILITY_PROCESS_STATUS.map((v) => ({ value: v, label: v }))}
          />
          <span>小区名称：</span>
          <Select
            placeholder="请选择小区名称"
            style={{ width: 150 }}
            allowClear
            value={community}
            onChange={setCommunity}
            options={COMMUNITIES.map((v) => ({ value: v, label: v }))}
          />
          <span>告警等级：</span>
          <Select
            placeholder="请选择告警等级"
            style={{ width: 140 }}
            allowClear
            value={level}
            onChange={setLevel}
            options={ALARM_LEVELS.map((v) => ({ value: v, label: v }))}
          />
          <span>告警设备：</span>
          <Select
            placeholder="请选择告警设备"
            style={{ width: 140 }}
            allowClear
            value={device}
            onChange={setDevice}
            options={ALARM_DEVICES.map((v) => ({ value: v, label: v }))}
          />
          <span>告警月份：</span>
          <DatePicker
            picker="month"
            placeholder="请选择月份"
            style={{ width: 140 }}
            value={month}
            onChange={setMonth}
            allowClear
          />
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <Button icon={<SettingOutlined />} onClick={() => setSettingsOpen(true)}>
          {canEditSettings ? '工单设置' : '查看工单设置'}
        </Button>
      </div>
      <Alert
        type="info"
        showIcon
        banner
        style={{ margin: '0 16px 12px' }}
        message="工单状态与处理状态对应：待处理→待处理/超时待处理；处理中→处理中/逾期处理中；已处理→已处理；损坏→损坏待处理。损坏工单不参与「未处理超时」监控；再次接单后的「完成逾期」与其他工单一致。"
      />
      <AdminTable
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 10, showSizeChanger: true }}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal
        title="工单详情"
        open={!!detail}
        onCancel={() => setDetailId(null)}
        footer={<Button onClick={() => setDetailId(null)}>关闭</Button>}
        width={720}
      >
        {detail &&
          (() => {
            const view = resolveFacilityStatusView(detail, undefined, now)
            const falseAlarmNote = getFacilitySubmitNote(detail, '误报说明')
            const repairNote = getFacilitySubmitNote(detail, '维修描述')
            const damageNote = getFacilitySubmitNote(detail, '损坏描述')
            const arrivalTime = getFacilityArrivalTime(detail)
            const showSubmitNotes = !!(falseAlarmNote || repairNote || detail.status === '损坏')

            return (
              <>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="工单编号">{detail.id}</Descriptions.Item>
                  <Descriptions.Item label="小区名称">{detail.community || '—'}</Descriptions.Item>
                  <Descriptions.Item label="告警设备">{detail.alarmDevice || '—'}</Descriptions.Item>
                  <Descriptions.Item label="安装位置">{detail.installLocation || '—'}</Descriptions.Item>
                  <Descriptions.Item label="告警等级">{detail.level}</Descriptions.Item>
                  <Descriptions.Item label="告警描述">{detail.desc}</Descriptions.Item>
                  <Descriptions.Item label="告警时间">{detail.alarmTime}</Descriptions.Item>
                  <Descriptions.Item label="工单状态">
                    <Tag color={workOrderStatusColor[view.workOrderStatus] ?? 'default'}>
                      {view.workOrderStatus}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="处理状态">
                    <Tag color={processStatusColor[view.processStatus] ?? 'default'}>{view.processStatus}</Tag>
                  </Descriptions.Item>
                  {view.label !== '—' && (
                    <Descriptions.Item label="时效状态">
                      <span style={{ color: facilitySlaColorHex(view.color), fontWeight: 500 }}>{view.label}</span>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="接单人">{detail.receiver}</Descriptions.Item>
                  {arrivalTime && <Descriptions.Item label="到达现场时间">{arrivalTime}</Descriptions.Item>}
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
                <Divider style={{ margin: '16px 0' }} />
                <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
                  流转信息
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                  与小程序同步展示，记录从工单生成到闭环的完整操作过程。
                </Typography.Paragraph>
                <FacilityFlowTimeline records={detail.flowRecords} />
              </>
            )
          })()}
      </Modal>
      <FacilityWorkOrderSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
