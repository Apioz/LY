import { useState } from 'react'
import {
  Table,
  Input,
  Select,
  Space,
  Button,
  Row,
  Col,
  Card,
  Statistic,
  Tabs,
  Tag,
} from 'antd'
import {
  PlusOutlined,
  ExportOutlined,
  UploadOutlined,
  HistoryOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  SearchOutlined,
  TableOutlined,
  UserOutlined,
  BellOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import SearchBar from '../../components/SearchBar'
import TableToolbar from '../../components/TableToolbar'
import {
  safetyNormRows,
  trainingMaterialRows,
  personnelQualRows,
  archiveProjectRows,
  projectMaintenanceRows,
  renovationRows,
  specialEquipmentStats,
  specialEquipmentRows,
  gasEquipmentStats,
  gasEquipmentRows,
  chargingPileRows,
} from '../../mock/hseModules'

const ops = () => (
  <Space>
    <a>查看</a>
    <a>编辑</a>
    <a style={{ color: '#ff4d4f' }}>删除</a>
  </Space>
)

/** 图1 安全规范 */
export function SafetyNormPage() {
  return (
    <>
      <SearchBar onSearch={() => {}} onReset={() => {}} resetLabel="重置">
        <Space wrap>
          <span>规范名称：</span>
          <Input placeholder="请输入规范名称" style={{ width: 180 }} />
          <span>规范类型：</span>
          <Select placeholder="请选择规范类型" style={{ width: 160 }} allowClear options={[{ value: '规范' }, { value: '流程' }, { value: '制度' }]} />
        </Space>
      </SearchBar>
      <TableToolbar showBatchDelete={false} onAdd={() => {}} showExport />
      <Table
        rowKey="key"
        columns={[
          { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
          { title: '规范名称', dataIndex: 'name' },
          { title: '规范类型', dataIndex: 'type', width: 100 },
          { title: '附件', width: 100, render: () => <a>查看附件</a> },
          { title: '上传时间', dataIndex: 'uploadTime', width: 170 },
          { title: '操作', width: 160, render: ops },
        ]}
        dataSource={safetyNormRows}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 20 }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}

/** 图2 培训资料 */
export function TrainingMaterialsPage() {
  const [tab, setTab] = useState('all')
  const filtered =
    tab === 'all' ? trainingMaterialRows : trainingMaterialRows.filter((r) => (tab === 'kyt' ? r.type === 'KYT隐患案例' : r.type === '事故教育'))

  return (
    <>
      <Tabs
        style={{ padding: '0 16px' }}
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'all', label: '全部' },
          { key: 'kyt', label: 'KYT隐患案例' },
          { key: 'accident', label: '事故教育' },
        ]}
      />
      <SearchBar onSearch={() => {}} onClear={() => {}} clearLabel="清空">
        <span>资料名称：</span>
        <Input placeholder="请输入资料名称" style={{ width: 240 }} />
      </SearchBar>
      <TableToolbar showBatchDelete={false} onAdd={() => {}} />
      <Table
        rowKey="key"
        columns={[
          { title: '资料名称', dataIndex: 'name' },
          { title: '资料类型', dataIndex: 'type', width: 120 },
          { title: '附件', width: 100, render: () => <a>查看附件</a> },
          { title: '上传人', dataIndex: 'uploader', width: 130 },
          { title: '上传时间', dataIndex: 'uploadTime', width: 170 },
          { title: '操作', width: 160, render: ops },
        ]}
        dataSource={filtered}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 20 }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}

/** 图3 人员资质 */
export function PersonnelQualificationPage() {
  return (
    <>
      <Row gutter={16} style={{ padding: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="人员总数" value={56} prefix={<UserOutlined style={{ color: '#ff4d4f' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="证书总数" value={91} prefix={<ExportOutlined style={{ color: '#ff4d4f' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="即将到期" value={0} prefix={<BellOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="逾期数" value={19} prefix={<ExclamationCircleOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
      </Row>
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <Space wrap>
          <span>姓名：</span>
          <Input placeholder="请输入姓名" style={{ width: 160 }} />
          <span>工号：</span>
          <Input placeholder="请输入工号" style={{ width: 160 }} />
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>新增</Button>
          <Button icon={<UploadOutlined />}>导入</Button>
          <Button icon={<ExportOutlined />} style={{ color: '#52c41a', borderColor: '#52c41a' }}>导出</Button>
        </Space>
      </div>
      <Table
        rowKey="key"
        scroll={{ x: 1400 }}
        columns={[
          { title: '姓名', dataIndex: 'name', width: 90 },
          { title: '工号', dataIndex: 'empId', width: 90 },
          {
            title: '证书名称',
            dataIndex: 'certName',
            width: 110,
            render: (v: string, r: { overdue?: boolean }) => <span style={{ color: r.overdue ? '#ff4d4f' : undefined }}>{v}</span>,
          },
          { title: '证书编号', dataIndex: 'certNo', width: 180 },
          { title: '取证日期', dataIndex: 'obtainDate', width: 110 },
          {
            title: '到期日期',
            dataIndex: 'expireDate',
            width: 110,
            sorter: true,
            render: (v: string, r: { overdue?: boolean }) => <span style={{ color: r.overdue ? '#ff4d4f' : undefined }}>{v}</span>,
          },
          { title: '复证日期', dataIndex: 'recertDate', width: 110, render: (v: string) => v || '-' },
          { title: '发证机关', dataIndex: 'authority', width: 160 },
          { title: '操作', width: 160, fixed: 'right', render: ops },
        ]}
        dataSource={personnelQualRows}
        pagination={{ showTotal: (t) => `共 ${t} 条` }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}

/** 图4 演练计划 */
export function DrillPlanPage() {
  return (
    <>
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <Space wrap>
          <span>预案查询：</span>
          <Input placeholder="请输入预案演练主题(名称)" style={{ width: 200 }} />
          <span>演练方式：</span>
          <Select placeholder="请选择演练方式" style={{ width: 160 }} allowClear />
          <span>预案类型：</span>
          <Select placeholder="请选择预案类型" style={{ width: 160 }} allowClear />
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>新增</Button>
          <Button>导入</Button>
          <Button style={{ color: '#52c41a', borderColor: '#52c41a' }}>导出</Button>
        </Space>
      </div>
      <Table
        locale={{ emptyText: '暂无数据' }}
        scroll={{ x: 2000 }}
        columns={[
          '演练编号',
          '预案演练主题(名称)',
          '演练时间',
          '演练方式',
          '直接投入(万元)',
          '组织部门',
          '预案类型',
          '演练级别',
          '完成时间(计划)',
          '参与人数(计划)',
          '创建人',
          '创建时间',
          '操作',
        ].map((t, i) => ({
          title: t,
          width: t === '操作' ? 120 : undefined,
          fixed: t === '操作' ? ('right' as const) : undefined,
          render: t === '操作' ? ops : i === 0 ? () => '-' : undefined,
        }))}
        dataSource={[]}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}

/** 图5 演练实施 */
export function DrillImplementPage() {
  return (
    <>
      <SearchBar onSearch={() => {}} onReset={() => {}} resetLabel="重置">
        <Space wrap>
          <span>预案查询：</span>
          <Input placeholder="请输入预案演练主题" style={{ width: 200 }} />
          <span>预案类型：</span>
          <Select placeholder="请选择预案类型" style={{ width: 160 }} allowClear />
          <span>演练方式：</span>
          <Select placeholder="请选择演练方式" style={{ width: 160 }} allowClear />
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <Button style={{ color: '#52c41a', borderColor: '#52c41a' }}>导出</Button>
        <Space>
          <Button type="text" icon={<ReloadOutlined />} />
          <Button type="text" icon={<ColumnHeightOutlined />} />
          <Button type="text" icon={<SearchOutlined />} />
          <Button type="text" icon={<TableOutlined />} />
        </Space>
      </div>
      <Table
        locale={{ emptyText: '暂无数据' }}
        scroll={{ x: 2400 }}
        columns={[
          '演练编号',
          '预案演练主题(名称)',
          '组织部门',
          '演练时间',
          '预案类型',
          '演练方式',
          '演练级别',
          '直接投入(万元)',
          '参与人数(实际)',
          '完成时间(实际)',
          '备注',
          '创建人',
          '创建时间',
          '演练方案',
          '演练总结',
          '操作',
        ].map((t) => ({
          title: t,
          width: t === '操作' ? 120 : 100,
          fixed: t === '操作' ? ('right' as const) : undefined,
          render: t === '操作' ? ops : t === '演练方案' || t === '演练总结' ? () => <a>查看</a> : () => '-',
        }))}
        dataSource={[]}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}

function ArchiveListPage({
  filters,
  columns,
  data,
}: {
  filters: React.ReactNode
  columns: object[]
  data: object[]
}) {
  const [selected, setSelected] = useState<React.Key[]>([])
  return (
    <>
      <SearchBar onSearch={() => {}} onReset={() => {}} resetLabel="重置">
        {filters}
      </SearchBar>
      <TableToolbar selectedCount={selected.length} onAdd={() => {}} showExport onClearSelection={() => setSelected([])} />
      <Table
        rowKey="key"
        scroll={{ x: 1600 }}
        columns={columns}
        dataSource={data}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{ showTotal: (t) => `共 ${t} 条` }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}

/** 图6 全部项目档案 */
export function ArchiveAllProjectsPage() {
  return (
    <ArchiveListPage
      filters={
        <>
          <span>地块类别：</span>
          <Select placeholder="请选择 地块类别" style={{ width: 180 }} allowClear />
        </>
      }
      data={archiveProjectRows}
      columns={[
        { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
        { title: '地块编号', dataIndex: 'plotNo', width: 120 },
        { title: '地块名称', dataIndex: 'plotName', width: 100 },
        { title: '地块简称', dataIndex: 'abbr', width: 80 },
        { title: '地块地址', dataIndex: 'address', ellipsis: true },
        { title: '管理中心', dataIndex: 'center', width: 140 },
        { title: '地块类别', dataIndex: 'category', width: 160 },
        { title: '地块负责人', dataIndex: 'charger', width: 100 },
        { title: '责任人', dataIndex: 'responsible', width: 90 },
        { title: '项目检修数量', dataIndex: 'maintain', width: 110 },
        { title: '二次装修数量', dataIndex: 'renovation', width: 110 },
        { title: '租赁数量', dataIndex: 'lease', width: 90 },
        { title: '更新人', width: 120, render: () => '管理员000000' },
        { title: '更新时间', dataIndex: 'updateTime', width: 170 },
        { title: '操作', width: 160, fixed: 'right', render: ops },
      ]}
    />
  )
}

/** 图7 项目检维修 */
export function ArchiveMaintenancePage() {
  return (
    <ArchiveListPage
      filters={
        <>
          <span>项目名称：</span>
          <Input placeholder="请输入 项目名称" style={{ width: 180 }} />
          <span>项目类型：</span>
          <Select placeholder="请选择 项目类型" style={{ width: 180 }} allowClear />
        </>
      }
      data={projectMaintenanceRows}
      columns={[
        { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
        { title: '项目编号', dataIndex: 'projectNo', width: 130 },
        { title: '项目名称', dataIndex: 'name' },
        { title: '地块', dataIndex: 'plot', width: 100 },
        { title: '项目地块', dataIndex: 'plot', width: 100 },
        { title: '项目位置', dataIndex: 'location', width: 140 },
        { title: '项目类型', dataIndex: 'type', width: 120 },
        { title: '项目负责人', dataIndex: 'manager', width: 100 },
        { title: '更新人', width: 120, render: () => '管理员000000' },
        { title: '更新时间', dataIndex: 'updateTime', width: 170 },
        { title: '操作', width: 160, fixed: 'right', render: ops },
      ]}
    />
  )
}

/** 图8 二次装修 */
export function ArchiveRenovationPage() {
  return (
    <ArchiveListPage
      filters={
        <>
          <span>项目名称：</span>
          <Input placeholder="请输入项目名称" style={{ width: 180 }} />
          <span>项目类型：</span>
          <Select placeholder="请选择项目类型" style={{ width: 180 }} allowClear />
        </>
      }
      data={renovationRows}
      columns={[
        { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
        { title: '项目编号', dataIndex: 'projectNo', width: 130 },
        { title: '项目名称', dataIndex: 'name' },
        { title: '地块', dataIndex: 'plot', width: 100 },
        { title: '项目类型', dataIndex: 'type', width: 100 },
        { title: '项目负责人', dataIndex: 'manager', width: 100 },
        { title: '更新人', width: 120, render: () => '管理员000000' },
        { title: '更新时间', dataIndex: 'updateTime', width: 170 },
        { title: '操作', width: 160, fixed: 'right', render: ops },
      ]}
    />
  )
}

/** 图9 租赁档案 */
export function ArchiveLeasePage() {
  return (
    <ArchiveListPage
      filters={
        <>
          <span>租赁单位：</span>
          <Input placeholder="请输入租赁单位" style={{ width: 180 }} />
          <span>地块名称：</span>
          <Input placeholder="请输入地块名称" style={{ width: 180 }} />
        </>
      }
      data={[]}
      columns={[
        { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
        { title: '租赁编号', dataIndex: 'leaseNo' },
        { title: '租赁单位', dataIndex: 'tenant' },
        { title: '地块名称', dataIndex: 'plotName' },
        { title: '租赁位置', dataIndex: 'location' },
        { title: '租赁面积(平方米)', dataIndex: 'area' },
        { title: '租赁业态', dataIndex: 'format' },
        { title: '地块类别', dataIndex: 'category' },
        { title: '场所类型', dataIndex: 'venueType' },
        { title: '管理中心', dataIndex: 'center' },
        { title: '负责人', dataIndex: 'charger' },
        { title: '更新时间', dataIndex: 'updateTime' },
        { title: '操作', width: 120, render: ops },
      ]}
    />
  )
}

function DocumentGridPage({ title, fileName }: { title: string; fileName: string }) {
  return (
    <div style={{ padding: 16 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<UploadOutlined />}>上传新文件</Button>
        <Button icon={<HistoryOutlined />}>历史记录</Button>
      </Space>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <span>{fileName}</span>
          <Tag color="success">最新版本</Tag>
          <span style={{ color: '#999' }}>上传时间：2025-03-11 14:08:10</span>
        </Space>
      </Card>
      <Card
        style={{
          minHeight: 480,
          background: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</div>
          <div>组织架构图 / 网格图预览区域</div>
          <div style={{ marginTop: 8, color: '#1890ff' }}>PDF</div>
        </div>
      </Card>
    </div>
  )
}

/** 图10 安全人员网格 */
export function PersonnelGridPage() {
  return (
    <DocumentGridPage
      title="2025年房产经营平台HSE管理网格图"
      fileName="2025年房产经营平台HSE网格图 总表（最新）20250212.docx"
    />
  )
}

/** 图11 地块组织架构 */
export function PlotOrgStructurePage() {
  return (
    <DocumentGridPage
      title="西区物业管理中心 HSE 管理网格图"
      fileName="2026年房产经营平台地块组织架构.docx"
    />
  )
}

/** 图12 特种设备 */
export function SpecialEquipmentPage() {
  const [selected, setSelected] = useState<React.Key[]>([])
  return (
    <>
      <Row gutter={16} style={{ padding: 16 }}>
        {specialEquipmentStats.map((s) => (
          <Col span={8} key={s.label}>
            <Card size="small">
              <Statistic title={s.label} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <Space wrap>
          <span>使用单位名称：</span>
          <Select placeholder="请选择使用单位名称" style={{ width: 180 }} allowClear />
          <span>特种设备名称：</span>
          <Input placeholder="请输入特种设备名称" style={{ width: 180 }} />
          <span>使用地址：</span>
          <Input placeholder="请输入使用地址" style={{ width: 180 }} />
        </Space>
      </SearchBar>
      <div style={{ padding: '8px 16px' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>新增</Button>
          <Button danger>删除</Button>
          <Button style={{ color: '#fa8c16', borderColor: '#fa8c16' }}>导出</Button>
        </Space>
      </div>
      <Table
        rowKey="key"
        scroll={{ x: 2200 }}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        rowClassName={(r: { highlight?: boolean }) => (r.highlight ? 'row-overdue' : '')}
        columns={[
          { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
          { title: '特种设备类型', dataIndex: 'equipType', width: 130 },
          { title: '特种设备名称', dataIndex: 'equipName', width: 130 },
          { title: '产权证/登记证编号', dataIndex: 'certNo', width: 150 },
          { title: '录入集团SAP', dataIndex: 'sap', width: 100 },
          { title: '制造单位名称', dataIndex: 'manufacturer', width: 120 },
          { title: '规格型号', dataIndex: 'model', width: 100 },
          { title: '产权单位名称', dataIndex: 'propertyUnit', width: 110 },
          { title: '使用单位名称', dataIndex: 'usageUnit', width: 110 },
          { title: '管理单位', dataIndex: 'manageUnit', width: 110 },
          { title: '操作', width: 160, fixed: 'right', render: ops },
        ]}
        dataSource={specialEquipmentRows}
        pagination={{ total: 108, showTotal: (t) => `共 ${t} 条`, pageSize: 10 }}
        style={{ padding: '0 16px 16px' }}
      />
      <style>{`.row-overdue td { background: #fff1f0 !important; }`}</style>
    </>
  )
}

/** 图13 燃气设备 */
export function GasEquipmentPage() {
  const [selected, setSelected] = useState<React.Key[]>([])
  return (
    <>
      <Row gutter={16} style={{ padding: 16 }}>
        {gasEquipmentStats.map((s) => (
          <Col span={8} key={s.label}>
            <Card size="small">
              <Statistic title={s.label} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <Space wrap>
          <span>出租地址：</span>
          <Input style={{ width: 160 }} />
          <span>承租单位：</span>
          <Input style={{ width: 160 }} />
          <span>租赁业态：</span>
          <Select placeholder="请选择" style={{ width: 160 }} allowClear />
        </Space>
      </SearchBar>
      <TableToolbar selectedCount={selected.length} onAdd={() => {}} showExport onClearSelection={() => setSelected([])} />
      <Table
        rowKey="key"
        scroll={{ x: 2000 }}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        rowClassName={(r: { highlight?: boolean }) => (r.highlight ? 'row-overdue' : '')}
        columns={[
          { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
          { title: '出租地址', dataIndex: 'address', width: 120 },
          { title: '承租单位', dataIndex: 'tenant', width: 120 },
          { title: '租赁业态', dataIndex: 'format', width: 90 },
          { title: '安全评级', dataIndex: 'rating', width: 80 },
          { title: '使用燃气罐', dataIndex: 'useGas', width: 100 },
          { title: '燃气报警/切断阀', dataIndex: 'alarm', width: 120 },
          { title: '配备消防器材', dataIndex: 'fireEquip', width: 110 },
          { title: '上次检验时间', dataIndex: 'lastInspect', width: 120 },
          { title: '下次检验时间', dataIndex: 'nextInspect', width: 120 },
          { title: '操作', width: 160, fixed: 'right', render: ops },
        ]}
        dataSource={gasEquipmentRows}
        pagination={{ total: 25, showTotal: (t) => `共 ${t} 条` }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}

/** 图14 充电桩设备 */
export function ChargingPilePage() {
  const [tab, setTab] = useState('ev')
  const [selected, setSelected] = useState<React.Key[]>([])
  return (
    <>
      <SearchBar onSearch={() => {}} onClear={() => {}} clearLabel="清空">
        <Space wrap>
          <span>管理部门：</span>
          <Select placeholder="请选择 管理部门" style={{ width: 180 }} allowClear />
          <span>安装场所地址：</span>
          <Input placeholder="请输入 充电桩安装场所地址" style={{ width: 220 }} />
        </Space>
      </SearchBar>
      <Tabs
        style={{ padding: '0 16px' }}
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'ev', label: '电动汽车' },
          { key: 'non-ev', label: '非机动车' },
        ]}
      />
      <TableToolbar selectedCount={selected.length} onAdd={() => {}} showExport onClearSelection={() => setSelected([])} />
      <Table
        rowKey="key"
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        columns={[
          { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
          { title: '管理部门', dataIndex: 'dept', width: 130 },
          { title: '安装场所地址', dataIndex: 'address', ellipsis: true },
          { title: '充电桩编号', dataIndex: 'pileNo', width: 100 },
          { title: '停放场所', dataIndex: 'place', width: 160 },
          { title: '充电桩数量', dataIndex: 'count', width: 100 },
          { title: '充电电源是否专线', dataIndex: 'dedicated', width: 120 },
          { title: '漏电保护措施', dataIndex: 'leak', width: 120 },
          { title: '配备消防器材', dataIndex: 'fire', width: 110 },
          { title: '备注', dataIndex: 'remark', width: 80 },
          { title: '操作', width: 160, render: ops },
        ]}
        dataSource={chargingPileRows}
        pagination={{ showTotal: (t) => `共 ${t} 条` }}
        style={{ padding: '0 16px 16px' }}
      />
    </>
  )
}
