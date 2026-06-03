import { Table, Select, Space, Button } from 'antd'
import SearchBar from '../components/SearchBar'
import { allInspectionRows } from '../mock/data'

export default function AllInspections() {
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
    { title: '工单状态', dataIndex: 'status', width: 90 },
    {
      title: '操作',
      width: 80,
      render: () => <Button type="link" size="small">详情</Button>,
    },
  ]

  return (
    <>
      <SearchBar onSearch={() => {}} onReset={() => {}} resetLabel="重置">
        <Space wrap>
          <span>管理类别：</span>
          <Select placeholder="请选择管理类别" style={{ width: 160 }} allowClear options={[{ value: '巡查' }]} />
          <span>地块名称：</span>
          <Select placeholder="请选择地块名称" style={{ width: 160 }} allowClear />
          <span>工单状态：</span>
          <Select
            placeholder="请选择工单状态"
            style={{ width: 160 }}
            allowClear
            options={['待处理', '处理中', '已完成', '已取消'].map((v) => ({ value: v }))}
          />
        </Space>
      </SearchBar>
      <Table
        rowKey="orderId"
        columns={columns}
        dataSource={allInspectionRows}
        scroll={{ x: 1400 }}
        pagination={{
          total: 501,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          pageSize: 10,
          showQuickJumper: true,
        }}
        style={{ padding: 16 }}
      />
    </>
  )
}
