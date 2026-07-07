import { useState } from 'react'
import { Table, Select, Input, Space, Button, Row, Col, Card, Statistic } from 'antd'
import {
  PlusOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
} from '@ant-design/icons'
import SearchBar from '../../components/SearchBar'
import { monitorDeviceStats, monitorDeviceRows, MONITOR_DEVICE_ASSET_CATEGORIES } from '../../mock/deviceData'

const COL_WIDTH = 120

function renderCell(v?: string) {
  return v?.trim() ? v : '—'
}

export default function MonitorDeviceManagement() {
  const [selected, setSelected] = useState<React.Key[]>([])

  const columns = [
    { title: '#', width: 50, align: 'center' as const, render: (_: unknown, __: unknown, i: number) => i + 1 },
    {
      title: '安装位置',
      dataIndex: 'location',
      width: 200,
      ellipsis: true,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '设备编号',
      dataIndex: 'deviceNo',
      width: 150,
      ellipsis: true,
    },
    {
      title: '资产分类',
      dataIndex: 'ID_资产分类',
      width: 110,
      align: 'center' as const,
    },
    {
      title: '设备类型',
      dataIndex: 'ID_设备类型',
      width: COL_WIDTH,
      render: renderCell,
    },
    {
      title: '网络地址',
      dataIndex: 'networkAddress',
      width: COL_WIDTH,
      render: renderCell,
    },
    {
      title: '序列号/SN',
      dataIndex: 'serialNo',
      width: COL_WIDTH,
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
      width: 140,
      render: renderCell,
    },
    {
      title: '型号',
      dataIndex: 'model',
      width: COL_WIDTH,
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
      width: 300,
      fixed: 'right' as const,
      render: () => (
        <Space size={4} wrap>
          <a>查看视频</a>
          <a>编辑</a>
          <a>查看</a>
          <a style={{ color: '#ff4d4f' }}>删除</a>
          <a>确认启用</a>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Row gutter={12} style={{ padding: 16 }}>
        {monitorDeviceStats.map((s) => (
          <Col flex="1" key={s.label}>
            <Card size="small">
              <Statistic title={s.label} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>
      <SearchBar onSearch={() => {}} onReset={() => {}} resetLabel="重置">
        <Space wrap>
          <span>空间位置：</span>
          <Select placeholder="请选择空间位置" style={{ width: 160 }} allowClear />
          <span>设备名称：</span>
          <Input placeholder="请输入设备名称" style={{ width: 160 }} allowClear />
          <span>监测状态：</span>
          <Select
            placeholder="请选择监测状态"
            style={{ width: 160 }}
            allowClear
            options={[
              { value: '正常', label: '正常' },
              { value: '异常', label: '异常' },
            ]}
          />
          <span>资产分类：</span>
          <Select
            placeholder="请选择资产分类"
            style={{ width: 160 }}
            allowClear
            options={MONITOR_DEVICE_ASSET_CATEGORIES.map((v) => ({ value: v, label: v }))}
          />
          <Button type="link" style={{ padding: 0 }}>
            展开
          </Button>
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新增
          </Button>
          <Button type="primary" icon={<CheckCircleOutlined />}>
            确认启用
          </Button>
          <Button type="primary" icon={<CloseCircleOutlined />}>
            取消启用
          </Button>
          <Button icon={<ExportOutlined />} style={{ color: '#fa8c16', borderColor: '#fa8c16' }}>
            导出
          </Button>
        </Space>
        <Space>
          <Button type="text" icon={<ReloadOutlined />} />
          <Button type="text" icon={<ColumnHeightOutlined />} />
          <Button type="text" icon={<FullscreenOutlined />} />
        </Space>
      </div>
      <Table
        rowKey="key"
        tableLayout="fixed"
        scroll={{ x: COL_WIDTH * 10 + 810 }}
        columns={columns}
        dataSource={monitorDeviceRows}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{
          total: 150,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          pageSize: 20,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}
