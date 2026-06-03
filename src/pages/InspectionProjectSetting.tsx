import { useState } from 'react'
import { Table, Select, Space } from 'antd'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { projectSettingRows } from '../mock/data'

export default function InspectionProjectSetting() {
  const [selected, setSelected] = useState<React.Key[]>([])

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '检查名称', dataIndex: 'name', ellipsis: true },
    { title: '地块名称', dataIndex: 'plot' },
    { title: '项目类别', dataIndex: 'category' },
    { title: '项目描述', dataIndex: 'desc' },
    { title: '打点数量', dataIndex: 'points', width: 90 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: string) => <span style={{ color: '#1890ff' }}>{v}</span>,
    },
    {
      title: '操作',
      width: 160,
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
        <span>项目类别：</span>
        <Select placeholder="请选择项目类别" style={{ width: 200 }} allowClear options={[{ value: '物业' }, { value: '租赁' }]} />
      </SearchBar>
      <TableToolbar selectedCount={selected.length} onClearSelection={() => setSelected([])} />
      <Table
        rowKey="name"
        columns={columns}
        dataSource={projectSettingRows}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{ showTotal: (t) => `共 ${t} 条` }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}
