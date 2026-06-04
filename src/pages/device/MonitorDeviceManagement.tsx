import { useState } from 'react'
import { Table, Select, Input, Space, Button, Row, Col, Card, Statistic } from 'antd'
import {
  PlusOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import SearchBar from '../../components/SearchBar'
import { monitorDeviceStats, monitorDeviceRows } from '../../mock/deviceData'

export default function MonitorDeviceManagement() {
  const [selected, setSelected] = useState<React.Key[]>([])

  const columns = [
    { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '空间编码', dataIndex: 'spaceCode', width: 110 },
    { title: '安装位置', dataIndex: 'location', ellipsis: true, width: 180 },
    { title: '资产编码', dataIndex: 'assetCode', width: 110 },
    { title: '资产名称', dataIndex: 'assetName', width: 120 },
    { title: '设备编号', dataIndex: 'deviceNo', width: 160, ellipsis: true },
    { title: '设备名称', dataIndex: 'deviceName', ellipsis: true, width: 160 },
    { title: '监测状态', dataIndex: 'monitorStatus', width: 80 },
    { title: '启用状态', dataIndex: 'enableStatus', width: 80 },
    { title: '协议类型', dataIndex: 'protocol', width: 80 },
    { title: '品牌', dataIndex: 'brand', width: 80 },
    {
      title: '操作',
      width: 280,
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
      <SearchBar onSearch={() => {}} onClear={() => {}}>
        <Space wrap>
          <span>空间位置：</span>
          <Select placeholder="请选择 空间位置" style={{ width: 160 }} allowClear />
          <span>设备名称：</span>
          <Input placeholder="请输入 设备名称" style={{ width: 160 }} />
          <span>监测状态：</span>
          <Select placeholder="请选择 监测状态" style={{ width: 160 }} allowClear options={[{ value: '正常' }, { value: '异常' }]} />
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新增
          </Button>
          <Button icon={<CheckCircleOutlined />}>确认启用</Button>
          <Button icon={<CloseCircleOutlined />}>取消启用</Button>
          <Button icon={<ExportOutlined />} style={{ color: '#fa8c16', borderColor: '#fa8c16' }}>
            导出
          </Button>
        </Space>
        <Button type="text" icon={<ReloadOutlined />} />
      </div>
      <Table
        rowKey="key"
        scroll={{ x: 1600 }}
        columns={columns}
        dataSource={monitorDeviceRows}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{ total: 460, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`, pageSize: 20 }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}
