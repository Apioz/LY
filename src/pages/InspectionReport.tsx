import { useMemo, useState } from 'react'
import { Select, DatePicker, Tabs, Space, Button } from 'antd'
import AdminTable from '../components/AdminTable'
import { ExportOutlined, ReloadOutlined, ColumnHeightOutlined, FullscreenOutlined } from '@ant-design/icons'
import SearchBar from '../components/SearchBar'
import { inspectionReportRows } from '../mock/data'
import { COMMUNITIES, matchesCommunityName } from '../constants/communities'

const reportColumns = [
  { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
  { title: '检查日期', dataIndex: 'date', width: 110 },
  { title: '小区名称', dataIndex: 'community', width: 110, ellipsis: true },
  { title: '管理中心', dataIndex: 'center', width: 100 },
  { title: '安全类别', dataIndex: 'safetyCategory', width: 100 },
  { title: '管理类别', dataIndex: 'category', width: 90 },
  { title: '安全等级', dataIndex: 'safetyLevel', width: 100 },
  { title: '问题描述', dataIndex: 'desc', width: 120 },
  { title: '整改期限', dataIndex: 'deadline', width: 110 },
  { title: '整改措施', dataIndex: 'measure', width: 100 },
  { title: '整改说明', dataIndex: 'rectDesc', width: 120 },
  { title: '整改负责人', dataIndex: 'owner', width: 110 },
  { title: '责任人', dataIndex: 'responsible', width: 90 },
  { title: '确认人', dataIndex: 'confirmer', width: 90 },
  { title: '整改要求完成日期', dataIndex: 'requiredDate', width: 140 },
  { title: '整改实际完成日期', dataIndex: 'actualDate', width: 140 },
  { title: '报表类型', dataIndex: 'reportType', width: 100 },
  { title: '备注', dataIndex: 'remark', width: 100 },
]

export default function InspectionReport() {
  const [subTab, setSubTab] = useState('all')
  const [communityFilter, setCommunityFilter] = useState<string>()

  const filtered = useMemo(() => {
    return inspectionReportRows.filter((row) => {
      if (communityFilter && !matchesCommunityName(row.community ?? row.plot, communityFilter)) return false
      if (subTab === 'workorder' && row.reportType !== '工单报表') return false
      if (subTab === 'import' && row.reportType !== '导入报表') return false
      return true
    })
  }, [subTab, communityFilter])

  return (
    <>
      <SearchBar onSearch={() => {}} onClear={() => setCommunityFilter(undefined)} clearLabel="清空">
        <Space wrap>
          <span>小区名称：</span>
          <Select
            placeholder="请选择小区名称"
            style={{ width: 180 }}
            allowClear
            value={communityFilter}
            onChange={setCommunityFilter}
            options={COMMUNITIES.map((v) => ({ value: v, label: v }))}
          />
          <span>管理中心：</span>
          <Select placeholder="请选择 管理中心" style={{ width: 180 }} allowClear />
          <span>安全等级：</span>
          <Select
            placeholder="请选择 安全等级"
            style={{ width: 180 }}
            allowClear
            options={[{ value: '一级' }, { value: '二级' }, { value: '三级' }, { value: '四级' }]}
          />
          <span>整改实际完成日期：</span>
          <DatePicker.RangePicker placeholder={['开始', '结束']} />
        </Space>
      </SearchBar>
      <div style={{ padding: '0 16px' }}>
        <Tabs
          activeKey={subTab}
          onChange={setSubTab}
          items={[
            { key: 'all', label: '全部' },
            { key: 'workorder', label: '工单报表' },
            { key: 'import', label: '导入报表' },
          ]}
          tabBarExtraContent={
            <Space>
              <Button style={{ color: '#52c41a', borderColor: '#52c41a' }} icon={<ExportOutlined />}>
                导出
              </Button>
              <Button type="text" icon={<ReloadOutlined />} />
              <Button type="text" icon={<ColumnHeightOutlined />} />
              <Button type="text" icon={<FullscreenOutlined />} />
            </Space>
          }
        />
      </div>
      <AdminTable
        rowKey="id"
        columns={reportColumns}
        dataSource={filtered}
        scroll={{ x: 2520 }}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 10 }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}
