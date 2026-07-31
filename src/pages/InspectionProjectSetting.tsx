import { useMemo, useState } from 'react'
import { Select, Space } from 'antd'
import AdminTable from '../components/AdminTable'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { projectSettingRows } from '../mock/data'
import { COMMUNITIES, matchesCommunityName } from '../constants/communities'

export default function InspectionProjectSetting() {
  const [selected, setSelected] = useState<React.Key[]>([])
  const [communityFilter, setCommunityFilter] = useState<string>()
  const [categoryFilter, setCategoryFilter] = useState<string>()

  const filtered = useMemo(
    () =>
      projectSettingRows.filter((row) => {
        if (communityFilter && !matchesCommunityName(row.plot, communityFilter)) return false
        if (categoryFilter && row.category !== categoryFilter) return false
        return true
      }),
    [communityFilter, categoryFilter],
  )

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '检查名称', dataIndex: 'name', ellipsis: true },
    { title: '小区名称', dataIndex: 'plot' },
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
      <SearchBar
        onSearch={() => {}}
        onReset={() => {
          setCommunityFilter(undefined)
          setCategoryFilter(undefined)
        }}
      >
        <Space wrap>
          <span>小区名称：</span>
          <Select
            placeholder="请选择小区名称"
            style={{ width: 200 }}
            allowClear
            value={communityFilter}
            onChange={setCommunityFilter}
            options={COMMUNITIES.map((v) => ({ value: v, label: v }))}
          />
          <span>项目类别：</span>
          <Select
            placeholder="请选择项目类别"
            style={{ width: 200 }}
            allowClear
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ value: '物业' }, { value: '租赁' }]}
          />
        </Space>
      </SearchBar>
      <TableToolbar selectedCount={selected.length} onClearSelection={() => setSelected([])} />
      <AdminTable
        rowKey="name"
        columns={columns}
        dataSource={filtered}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{ showTotal: (t) => `共 ${t} 条` }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}
