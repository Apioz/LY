import { useMemo, useState } from 'react'
import { Select, Space } from 'antd'
import AdminTable from '../components/AdminTable'
import SearchBar from '../components/SearchBar'
import { safetyLevelOptions } from '../mock/data'
import { COMMUNITIES, matchesCommunityName } from '../constants/communities'

const columns = [
  { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
  { title: '工单编号', dataIndex: 'orderId', width: 200 },
  { title: '小区名称', dataIndex: 'community', width: 100 },
  { title: '所属区域', dataIndex: 'area', width: 100 },
  { title: '隐患问题', dataIndex: 'problem', width: 120 },
  { title: '安全类别', dataIndex: 'safetyCategory', width: 100 },
  { title: '检查日期', dataIndex: 'inspectDate', width: 110 },
  { title: '管理类别', dataIndex: 'category', width: 90 },
  { title: '安全等级', dataIndex: 'safetyLevel', width: 90 },
  { title: '问题描述', dataIndex: 'desc', width: 120 },
  { title: '整改说明', dataIndex: 'rectDesc', width: 120 },
  { title: '工单状态', dataIndex: 'status', width: 90 },
  { title: '整改措施', dataIndex: 'measure', width: 100 },
  { title: '整改要求完成日期', dataIndex: 'requiredDate', width: 140 },
  { title: '整改实际完成日期', dataIndex: 'actualDate', width: 140 },
  { title: '确认人', dataIndex: 'confirmer', width: 90 },
  { title: '操作', width: 80, fixed: 'right' as const, render: () => <a>详情</a> },
]

export default function RectificationWorkOrder() {
  const [communityFilter, setCommunityFilter] = useState<string>()

  const filtered = useMemo(
    () =>
      [].filter((row: { community?: string }) => {
        if (communityFilter && !matchesCommunityName(row.community, communityFilter)) return false
        return true
      }),
    [communityFilter],
  )

  return (
    <>
      <SearchBar
        onSearch={() => {}}
        onClear={() => setCommunityFilter(undefined)}
      >
        <Space wrap>
          <span>小区名称：</span>
          <Select
            placeholder="请选择小区名称"
            style={{ width: 160 }}
            allowClear
            value={communityFilter}
            onChange={setCommunityFilter}
            options={COMMUNITIES.map((v) => ({ value: v, label: v }))}
          />
          <span>安全类别：</span>
          <Select placeholder="请选择安全类别" style={{ width: 160 }} allowClear />
          <span>安全等级：</span>
          <Select
            placeholder="请选择安全等级"
            style={{ width: 160 }}
            allowClear
            options={safetyLevelOptions.map((v) => ({ value: v, label: v }))}
          />
          <span>管理类别：</span>
          <Select placeholder="请选择管理类别" style={{ width: 160 }} allowClear />
          <span>工单状态：</span>
          <Select placeholder="请选择工单状态" style={{ width: 160 }} allowClear />
          <span>整改措施：</span>
          <Select placeholder="请选择整改措施" style={{ width: 160 }} allowClear />
        </Space>
      </SearchBar>
      <AdminTable
        columns={columns}
        dataSource={filtered}
        scroll={{ x: 2200 }}
        locale={{ emptyText: '暂无' }}
        style={{ padding: 16 }}
      />
    </>
  )
}
