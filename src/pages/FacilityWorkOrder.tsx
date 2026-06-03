import { useState } from 'react'
import { Table, Select, Space, DatePicker } from 'antd'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { facilityOrderRows } from '../mock/data'

export default function FacilityWorkOrder() {
  const [selected, setSelected] = useState<React.Key[]>([])

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '工单编号', dataIndex: 'id' },
    { title: '工单标题', dataIndex: 'title' },
    { title: '地块名称', dataIndex: 'plot' },
    { title: '申请人', dataIndex: 'applicant' },
    { title: '申请时间', dataIndex: 'time' },
    { title: '工单状态', dataIndex: 'status' },
    {
      title: '操作',
      render: () => (
        <Space>
          <a>查看</a>
          <a>编辑</a>
          <a style={{ color: '#ff4d4f' }}>删除</a>
        </Space>
      ),
    },
  ]

  return (
    <>
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <Space wrap>
          <span>地块名称：</span>
          <Select placeholder="请选择地块名称" style={{ width: 180 }} allowClear />
          <span>工单状态：</span>
          <Select placeholder="请选择工单状态" style={{ width: 180 }} allowClear options={[{ value: '待派工' }, { value: '进行中' }]} />
          <span>申请时间：</span>
          <DatePicker.RangePicker />
        </Space>
      </SearchBar>
      <TableToolbar selectedCount={selected.length} onClearSelection={() => setSelected([])} />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={facilityOrderRows}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{ showTotal: (t) => `共 ${t} 条` }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}
