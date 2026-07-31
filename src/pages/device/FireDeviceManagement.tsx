import { useMemo, useState } from 'react'
import { Select, Input, Space, Button, Row, Col, Card, Statistic } from 'antd'
import AdminTable from '../../components/AdminTable'
import {
  LinkOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  SearchOutlined,
  FullscreenOutlined,
} from '@ant-design/icons'
import SearchBar from '../../components/SearchBar'
import DeviceDetailModal, { type DeviceDetailMode } from '../../components/device/DeviceDetailModal'
import {
  fireDeviceStats,
  fireDeviceRows as initialFireDeviceRows,
  FIRE_DEVICE_ASSET_CATEGORIES,
  type FireDeviceRow,
} from '../../mock/deviceData'
import { COMMUNITIES, matchesCommunityName } from '../../constants/communities'


function renderCell(v?: string) {
  return v?.trim() ? v : '—'
}

export default function FireDeviceManagement() {
  const [selected, setSelected] = useState<React.Key[]>([])
  const [rows, setRows] = useState<FireDeviceRow[]>(initialFireDeviceRows)
  const [communityFilter, setCommunityFilter] = useState<string>()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<DeviceDetailMode>('view')
  const [activeRecord, setActiveRecord] = useState<FireDeviceRow | null>(null)

  const openModal = (record: FireDeviceRow, mode: DeviceDetailMode) => {
    setActiveRecord(record)
    setModalMode(mode)
    setModalOpen(true)
  }

  const filteredRows = useMemo(
    () => (communityFilter ? rows.filter((r) => matchesCommunityName(r.community, communityFilter)) : rows),
    [rows, communityFilter],
  )

  const columns = useMemo(
    () => [
      { title: '#', width: 50, align: 'center' as const, render: (_: unknown, __: unknown, i: number) => i + 1 },
      {
        title: '小区名称',
        dataIndex: 'community',
        width: 120,
        ellipsis: true,
      },
      {
        title: '安装位置',
        dataIndex: 'location',
        width: 220,
        ellipsis: true,
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 200,
        ellipsis: true,
      },
      {
        title: '设备编号',
        dataIndex: 'deviceNo',
        width: 110,
      },
      {
        title: '资产类型',
        dataIndex: 'ID_资产分类',
        width: 110,
        align: 'center' as const,
      },
      {
        title: '设备类型',
        dataIndex: 'ID_设备类型',
        render: renderCell,
      },
      {
        title: '对接地址',
        dataIndex: 'dockAddress',
        render: renderCell,
      },
      {
        title: '序列号/SN',
        dataIndex: 'serialNo',
        render: renderCell,
      },
      {
        title: '通道号',
        dataIndex: 'channelNo',
        width: 80,
        align: 'center' as const,
      },
      {
        title: 'IP地址',
        dataIndex: 'ipAddress',
        render: renderCell,
      },
      {
        title: '型号',
        dataIndex: 'model',
        render: renderCell,
      },
      {
        title: '品牌',
        dataIndex: 'brand',
        width: 90,
        render: renderCell,
      },
      {
        title: '绑定状态',
        dataIndex: 'bindStatus',
        width: 90,
        align: 'center' as const,
      },
      {
        title: '监测状态',
        dataIndex: 'monitorStatus',
        width: 90,
        align: 'center' as const,
      },
      {
        title: '启用状态',
        dataIndex: 'enableStatus',
        width: 90,
        align: 'center' as const,
      },
      {
        title: '操作',
        width: 200,
        fixed: 'right' as const,
        render: (_: unknown, record: FireDeviceRow) => (
          <Space size={8}>
            <a onClick={() => openModal(record, 'view')}>查看</a>
            <a onClick={() => openModal(record, 'edit')}>编辑</a>
            <a>确认启用</a>
          </Space>
        ),
      },
    ],
    [],
  )

  return (
    <>
      <Row gutter={16} style={{ padding: 16 }}>
        {fireDeviceStats.map((s) => (
          <Col span={8} key={s.label}>
            <Card size="small">
              <Statistic title={s.label} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>
      <SearchBar onSearch={() => {}} onReset={() => setCommunityFilter(undefined)} resetLabel="重置">
        <Space wrap>
          <span>小区名称：</span>
          <Select
            placeholder="请选择小区名称"
            style={{ width: 180 }}
            allowClear
            value={communityFilter}
            onChange={setCommunityFilter}
            options={COMMUNITIES.map((v) => ({ value: v, label: v }))}
          />
          <span>空间位置：</span>
          <Select placeholder="请选择空间位置" style={{ width: 180 }} allowClear />
          <span>消防设备名称：</span>
          <Input placeholder="请输入消防设备名称" style={{ width: 180 }} allowClear />
          <span>消防设备编号：</span>
          <Input placeholder="请输入消防设备编号" style={{ width: 180 }} allowClear />
          <span>资产类型：</span>
          <Select
            placeholder="请选择资产类型"
            style={{ width: 160 }}
            allowClear
            options={FIRE_DEVICE_ASSET_CATEGORIES.map((v) => ({ value: v, label: v }))}
          />
          <Button type="link" style={{ padding: 0 }}>
            展开
          </Button>
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<LinkOutlined />}>关联通道</Button>
          <Button icon={<ExportOutlined />} style={{ color: '#fa8c16', borderColor: '#fa8c16' }}>
            导出
          </Button>
          <Button type="primary" icon={<CheckCircleOutlined />}>
            确认启用
          </Button>
          <Button type="primary" icon={<CloseCircleOutlined />}>
            取消启用
          </Button>
        </Space>
        <Space>
          <Button type="text" icon={<ReloadOutlined />} />
          <Button type="text" icon={<ColumnHeightOutlined />} />
          <Button type="text" icon={<SearchOutlined />} />
          <Button type="text" icon={<FullscreenOutlined />} />
        </Space>
      </div>
      <AdminTable
        rowKey="key"
        columns={columns}
        dataSource={filteredRows}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{
          total: rows.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          pageSize: 20,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        style={{ padding: '0 16px 16px' }}
      />
      <DeviceDetailModal
        kind="fire"
        open={modalOpen}
        mode={modalMode}
        record={activeRecord}
        onClose={() => {
          setModalOpen(false)
          setActiveRecord(null)
        }}
        onSave={(values) => setRows((prev) => prev.map((r) => (r.key === values.key ? (values as FireDeviceRow) : r)))}
      />
    </>
  )
}
