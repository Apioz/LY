import { Calendar, Badge, Table, Select, Space } from 'antd'
import type { Dayjs } from 'dayjs'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { programRows } from '../mock/data'

export function InspectionCalendar() {
  const getListData = (value: Dayjs) => {
    const day = value.date()
    if (day === 3 || day === 15) return [{ type: 'processing', content: '安全检查' }]
    if (day === 20) return [{ type: 'warning', content: '整改复查' }]
    return []
  }

  return (
    <div style={{ padding: 16 }}>
      <Space style={{ marginBottom: 16 }}>
        <span>地块名称：</span>
        <Select placeholder="请选择地块名称" style={{ width: 200 }} allowClear />
      </Space>
      <Calendar
        cellRender={(date) => {
          const list = getListData(date)
          return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12 }}>
              {list.map((item, i) => (
                <li key={i}>
                  <Badge status={item.type as 'processing' | 'warning'} text={item.content} />
                </li>
              ))}
            </ul>
          )
        }}
      />
    </div>
  )
}

export function InspectionProjectSettings() {
  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '程序编号', dataIndex: 'id' },
    { title: '程序名称', dataIndex: 'name' },
    { title: '注意事项', dataIndex: 'notes' },
    { title: '创建人', dataIndex: 'creator' },
    { title: '创建时间', dataIndex: 'time' },
    { title: '操作', render: () => <Space><a>查看</a><a>编辑</a><a>删除</a></Space> },
  ]

  return (
    <>
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <span>程序名称：</span>
        <Select placeholder="请输入程序名称" style={{ width: 240 }} showSearch allowClear />
      </SearchBar>
      <TableToolbar />
      <Table rowKey="id" columns={columns} dataSource={programRows} pagination={{ total: 14, showTotal: (t) => `共 ${t} 条` }} style={{ padding: '0 16px 16px' }} />
    </>
  )
}

export function AcceptanceWorkOrder() {
  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '验收编号', dataIndex: 'id' },
    { title: '检查名称', dataIndex: 'name' },
    { title: '地块名称', dataIndex: 'plot' },
    { title: '验收人', dataIndex: 'acceptor' },
    { title: '验收时间', dataIndex: 'time' },
    { title: '验收状态', dataIndex: 'status' },
    { title: '操作', render: () => <a>详情</a> },
  ]

  return (
    <>
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <Space wrap>
          <span>地块名称：</span>
          <Select placeholder="请选择地块名称" style={{ width: 180 }} allowClear />
          <span>验收状态：</span>
          <Select placeholder="请选择验收状态" style={{ width: 180 }} allowClear />
        </Space>
      </SearchBar>
      <Table columns={columns} dataSource={[]} locale={{ emptyText: '暂无' }} style={{ padding: 16 }} />
    </>
  )
}
