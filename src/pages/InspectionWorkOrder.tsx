import { useState } from 'react'
import { Table, Select, Space, Tag } from 'antd'
import SearchBar from '../components/SearchBar'
import { workOrderRows } from '../mock/data'

export const WORK_ORDER_STATUS = ['待处理', '处理中', '已完成', '已取消'] as const

const statusColor: Record<string, string> = {
  待处理: 'default',
  处理中: 'processing',
  已完成: 'success',
  已取消: 'error',
}

export default function InspectionWorkOrder() {
  const [statusFilter, setStatusFilter] = useState<string>()
  const filtered = statusFilter ? workOrderRows.filter((r) => r.status === statusFilter) : workOrderRows

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '工单编号', dataIndex: 'orderId', width: 260 },
    { title: '检查计划', dataIndex: 'plan', ellipsis: true },
    { title: '管理类别', dataIndex: 'category', width: 80 },
    { title: '地块名称', dataIndex: 'plot', width: 100 },
    { title: '检查名称', dataIndex: 'name', ellipsis: true },
    { title: '点位数量', dataIndex: 'points', width: 80 },
    { title: '检查人', dataIndex: 'inspector', width: 120 },
    { title: '检查开始时间', dataIndex: 'startTime', width: 170 },
    {
      title: '工单状态',
      dataIndex: 'status',
      width: 90,
      render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag>,
    },
    { title: '操作', width: 80, render: () => <a>详情</a> },
  ]

  return (
    <>
      <SearchBar onSearch={() => {}} onClear={() => {}} clearLabel="清空">
        <Space wrap>
          <span>管理类别：</span>
          <Select placeholder="请选择管理类别" style={{ width: 180 }} allowClear options={[{ value: '巡查' }]} />
          <span>工单状态：</span>
          <Select
            placeholder="请选择工单状态"
            style={{ width: 180 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={WORK_ORDER_STATUS.map((v) => ({ value: v, label: v }))}
          />
        </Space>
      </SearchBar>
      <Table
        rowKey="orderId"
        columns={columns}
        dataSource={filtered}
        scroll={{ x: 1400 }}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 10 }}
        style={{ padding: 16 }}
      />
    </>
  )
}
