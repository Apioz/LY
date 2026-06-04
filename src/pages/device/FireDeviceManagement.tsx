import { useState } from 'react'
import { Table, Select, Input, Space, Button, Row, Col, Card, Statistic } from 'antd'
import {
  LinkOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  SearchOutlined,
  TableOutlined,
} from '@ant-design/icons'
import SearchBar from '../../components/SearchBar'
import { fireDeviceStats, fireDeviceRows } from '../../mock/deviceData'

export default function FireDeviceManagement() {
  const [selected, setSelected] = useState<React.Key[]>([])

  const columns = [
    { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '空间编码', dataIndex: 'spaceCode', width: 120 },
    { title: '安装位置', dataIndex: 'location', ellipsis: true },
    { title: '设备类目', dataIndex: 'category', width: 100 },
    { title: '设备名称', dataIndex: 'deviceName', width: 140 },
    { title: '消防设备编号', dataIndex: 'fireCode', width: 130 },
    { title: '消防设备名称', dataIndex: 'fireName', width: 130 },
    { title: '绑定状态', dataIndex: 'bindStatus', width: 90 },
    { title: '启用状态', dataIndex: 'enableStatus', width: 90 },
    {
      title: '操作',
      width: 120,
      render: () => (
        <Space>
          <a>编辑</a>
          <a>查看</a>
        </Space>
      ),
    },
  ]

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
      <SearchBar onSearch={() => {}} onClear={() => {}}>
        <Space wrap>
          <span>空间位置：</span>
          <Select placeholder="请选择 空间位置" style={{ width: 180 }} allowClear />
          <span>设备名称：</span>
          <Input placeholder="请输入 设备名称" style={{ width: 180 }} />
          <span>消防设备编号：</span>
          <Input placeholder="请输入 消防设备编号" style={{ width: 180 }} />
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Button icon={<LinkOutlined />}>关联通道</Button>
          <Button icon={<ExportOutlined />} style={{ color: '#fa8c16', borderColor: '#fa8c16' }}>
            导出
          </Button>
          <Button icon={<CheckCircleOutlined />}>确认启用</Button>
          <Button icon={<CloseCircleOutlined />}>取消启用</Button>
        </Space>
        <Space>
          <Button type="text" icon={<ReloadOutlined />} />
          <Button type="text" icon={<ColumnHeightOutlined />} />
          <Button type="text" icon={<SearchOutlined />} />
          <Button type="text" icon={<TableOutlined />} />
        </Space>
      </div>
      <Table
        rowKey="key"
        columns={columns}
        dataSource={fireDeviceRows}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        locale={{ emptyText: '暂无数据' }}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 10 }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}
