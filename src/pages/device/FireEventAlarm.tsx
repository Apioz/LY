import { Table, Input, Select, Space, DatePicker, Button } from 'antd'
import { ExportOutlined, ReloadOutlined, ColumnHeightOutlined, SearchOutlined } from '@ant-design/icons'
import SearchBar from '../../components/SearchBar'
import { fireEventAlarmRows } from '../../mock/deviceData'

export default function FireEventAlarm() {
  const columns = [
    { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '告警时间', dataIndex: 'time', width: 170 },
    { title: '消防设备编号', dataIndex: 'fireCode', width: 140 },
    { title: '消防设备名称', dataIndex: 'fireName', width: 140 },
    { title: '告警类型', dataIndex: 'alarmType', width: 120 },
  ]

  return (
    <>
      <SearchBar onSearch={() => {}} onClear={() => {}}>
        <Space wrap>
          <span>消防设备名称：</span>
          <Input placeholder="请输入 消防设备名称" style={{ width: 180 }} />
          <span>消防设备编号：</span>
          <Input placeholder="请输入 消防设备编号" style={{ width: 180 }} />
          <span>告警时间：</span>
          <DatePicker.RangePicker placeholder={['开始时间', '结束时间']} />
          <span>告警类型：</span>
          <Select placeholder="请选择 告警类型" style={{ width: 160 }} allowClear options={[{ value: '火灾报警' }, { value: '故障报警' }]} />
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <Button icon={<ExportOutlined />} style={{ color: '#fa8c16', borderColor: '#fa8c16' }}>
            导出
          </Button>
          <Button type="text" icon={<ReloadOutlined />} />
          <Button type="text" icon={<ColumnHeightOutlined />} />
          <Button type="text" icon={<SearchOutlined />} />
        </Space>
      </div>
      <Table
        rowKey="key"
        columns={columns}
        dataSource={fireEventAlarmRows}
        pagination={{ showTotal: (t) => `共 ${t} 条` }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}
