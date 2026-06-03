import { useState } from 'react'
import {
  Table,
  Input,
  Space,
  Button,
  Modal,
  Form,
  Select,
  Row,
  Col,
  DatePicker,
  TimePicker,
  InputNumber,
  message,
  Descriptions,
} from 'antd'
import dayjs from 'dayjs'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { planRows as initialPlanRows } from '../mock/data'

export type PlanRow = {
  plan: string
  name: string
  category: string
  inspectors: string
  plot: string
  publisher: string
  start: string
  end: string
  cycle: string
  next: string
  desc: string
  status: string
  timeLimit?: number
  taskStartTime?: string
  cycleNum?: number
  cycleUnit?: string
}

const CYCLE_UNITS = [
  { value: '周', label: '周' },
  { value: '月', label: '月' },
  { value: '季', label: '季' },
]

function PlanForm({ form, disabled }: { form: ReturnType<typeof Form.useForm>[0]; disabled?: boolean }) {
  return (
    <Form form={form} layout="vertical" disabled={disabled}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="plan" label="检查计划" rules={[{ required: true, message: '请输入检查计划' }]}>
            <Input placeholder="请输入检查计划" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={[{ value: '启用' }, { value: '禁用' }]} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="name" label="检查名称" rules={[{ required: true, message: '请选择检查名称' }]}>
            <Select
              placeholder="请选择检查名称"
              showSearch
              options={[
                { value: '双翼大厦1F机电房安全检查' },
                { value: '中期大厦29F电梯机房检查' },
                { value: '天山路473号消防检查' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="category" label="管理类别" rules={[{ required: true, message: '请选择管理类别' }]}>
            <Select placeholder="请选择管理类别" options={[{ value: '巡查' }]} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="timeLimit" label="处理时限">
            <InputNumber min={1} addonAfter="时" style={{ width: '100%' }} placeholder="1" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="inspectors" label="检查人" rules={[{ required: true, message: '请选择检查人' }]}>
            <Select
              mode="multiple"
              placeholder="请选择检查人"
              options={[
                { value: '郭仲伟' },
                { value: '徐兴庆' },
                { value: '冯晓' },
                { value: '郑晋军' },
                { value: '武言民' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="start" label="开始时间" rules={[{ required: true, message: '请选择开始日期' }]}>
            <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="end" label="结束时间" rules={[{ required: true, message: '请选择结束日期' }]}>
            <DatePicker style={{ width: '100%' }} placeholder="请选择结束日期" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="触发周期" required>
            <Space.Compact style={{ width: '100%' }}>
              <span style={{ padding: '4px 8px', background: '#fafafa', border: '1px solid #d9d9d9' }}>每</span>
              <Form.Item name="cycleNum" noStyle rules={[{ required: true, message: '请输入' }]}>
                <InputNumber min={1} style={{ width: '30%' }} />
              </Form.Item>
              <Form.Item name="cycleUnit" noStyle rules={[{ required: true }]}>
                <Select style={{ width: '40%' }} options={CYCLE_UNITS} />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="taskStartTime" label="任务开始时间" rules={[{ required: true }]}>
            <TimePicker style={{ width: '100%' }} defaultOpenValue={dayjs('10:00:00', 'HH:mm:ss')} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="plot" label="地块名称" rules={[{ required: true, message: '请选择地块名称' }]}>
            <Select placeholder="请选择地块名称" options={[{ value: '双翼大厦' }, { value: '中期大厦' }, { value: '天山路473' }]} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="desc" label="计划描述">
            <Input.TextArea rows={3} placeholder="请输入计划描述" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

function recordToForm(record: PlanRow) {
  const [num, unit] = record.cycle?.replace('1次/', '').split('/') || ['1', '周']
  return {
    ...record,
    inspectors: record.inspectors.split(', '),
    start: dayjs(record.start),
    end: dayjs(record.end),
    cycleNum: record.cycleNum ?? (Number(num) || 1),
    cycleUnit: record.cycleUnit ?? (unit || '周'),
    taskStartTime: dayjs(record.taskStartTime || '10:00:00', 'HH:mm:ss'),
    timeLimit: record.timeLimit ?? 1,
  }
}

function formToRecord(values: Record<string, unknown>, old?: PlanRow): PlanRow {
  const inspectors = Array.isArray(values.inspectors) ? (values.inspectors as string[]).join(', ') : String(values.inspectors)
  const cycleNum = values.cycleNum as number
  const cycleUnit = values.cycleUnit as string
  const start = (values.start as dayjs.Dayjs).format('YYYY-MM-DD')
  const end = (values.end as dayjs.Dayjs).format('YYYY-MM-DD')
  const taskTime = (values.taskStartTime as dayjs.Dayjs).format('HH:mm:ss')
  return {
    plan: values.plan as string,
    name: (values.name as string) || (values.plan as string),
    category: values.category as string,
    inspectors,
    plot: values.plot as string,
    publisher: old?.publisher || '管理员1',
    start,
    end,
    cycle: `1次/${cycleNum}${cycleUnit}`,
    next: old?.next || `${start} ${taskTime}`,
    desc: (values.desc as string) || '',
    status: values.status as string,
    timeLimit: values.timeLimit as number,
    taskStartTime: taskTime,
    cycleNum,
    cycleUnit,
  }
}

export default function InspectionPlanSetting() {
  const [data, setData] = useState<PlanRow[]>(initialPlanRows)
  const [selected, setSelected] = useState<React.Key[]>([])
  const [modal, setModal] = useState<'add' | 'view' | 'edit' | null>(null)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [form] = Form.useForm()

  const openModal = (type: 'add' | 'view' | 'edit', record?: PlanRow) => {
    setModal(type)
    if (type === 'add') {
      form.resetFields()
      form.setFieldsValue({ status: '启用', cycleNum: 1, cycleUnit: '月', timeLimit: 1, taskStartTime: dayjs('10:00:00', 'HH:mm:ss') })
      setEditingPlan(null)
    } else if (record) {
      form.setFieldsValue(recordToForm(record))
      setEditingPlan(record.plan)
    }
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const row = formToRecord(values, data.find((d) => d.plan === editingPlan))
      if (modal === 'add') {
        setData((prev) => [row, ...prev])
        message.success('新增成功')
      } else if (modal === 'edit' && editingPlan) {
        setData((prev) => prev.map((r) => (r.plan === editingPlan ? row : r)))
        message.success('编辑成功')
      }
      setModal(null)
    })
  }

  const handleDisable = (record: PlanRow) => {
    const next = record.status === '启用' ? '禁用' : '启用'
    Modal.confirm({
      title: record.status === '启用' ? '确认禁用' : '确认启用',
      content: `确定${next}检查计划「${record.plan}」吗？`,
      onOk: () => {
        setData((prev) => prev.map((r) => (r.plan === record.plan ? { ...r, status: next } : r)))
        message.success(`${next}成功`)
      },
    })
  }

  const handleDelete = (record: PlanRow) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除检查计划「${record.plan}」吗？`,
      okType: 'danger',
      onOk: () => {
        setData((prev) => prev.filter((r) => r.plan !== record.plan))
        message.success('删除成功')
      },
    })
  }

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '检查计划', dataIndex: 'plan', ellipsis: true, width: 200 },
    { title: '检查名称', dataIndex: 'name', ellipsis: true, width: 200 },
    { title: '管理类别', dataIndex: 'category', width: 80 },
    { title: '检查人', dataIndex: 'inspectors', width: 120 },
    { title: '地块名称', dataIndex: 'plot', width: 100 },
    { title: '任务发布人', dataIndex: 'publisher', width: 100 },
    { title: '开始时间', dataIndex: 'start', width: 110 },
    { title: '结束时间', dataIndex: 'end', width: 110 },
    { title: '触发周期', dataIndex: 'cycle', width: 90 },
    { title: '下次执行时间', dataIndex: 'next', width: 160 },
    { title: '检查描述', dataIndex: 'desc', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 70,
      render: (v: string) => <span style={{ color: v === '启用' ? '#1890ff' : '#999' }}>{v}</span>,
    },
    {
      title: '操作',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: PlanRow) => (
        <Space size={4}>
          <Button
            size="small"
            style={{ background: '#fa8c16', color: '#fff', border: 'none' }}
            onClick={() => handleDisable(record)}
          >
            {record.status === '启用' ? '禁用' : '启用'}
          </Button>
          <Button size="small" type="primary" onClick={() => openModal('view', record)}>
            查看
          </Button>
          <Button size="small" onClick={() => openModal('edit', record)}>
            编辑
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <span>检查名称：</span>
        <Input placeholder="请输入检查名称" style={{ width: 240 }} />
      </SearchBar>
      <TableToolbar selectedCount={selected.length} onAdd={() => openModal('add')} onClearSelection={() => setSelected([])} />
      <Table
        rowKey="plan"
        scroll={{ x: 1600 }}
        columns={columns}
        dataSource={data}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{
          total: data.length,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          pageSize: 10,
          showQuickJumper: true,
        }}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal
        title={modal === 'add' ? '新增检查计划' : modal === 'edit' ? '编辑检查计划' : '查看检查计划'}
        open={!!modal}
        onCancel={() => setModal(null)}
        width={800}
        destroyOnClose
        footer={
          modal === 'view' ? (
            <>
              <Button onClick={() => setModal(null)}>关闭</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setModal(null)}>关闭</Button>
              <Button type="primary" onClick={handleSave}>
                确定
              </Button>
            </>
          )
        }
      >
        {modal === 'view' ? (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="检查计划">{form.getFieldValue('plan')}</Descriptions.Item>
            <Descriptions.Item label="状态">{form.getFieldValue('status')}</Descriptions.Item>
            <Descriptions.Item label="检查名称">{form.getFieldValue('name')}</Descriptions.Item>
            <Descriptions.Item label="管理类别">{form.getFieldValue('category')}</Descriptions.Item>
            <Descriptions.Item label="处理时限">{form.getFieldValue('timeLimit')} 时</Descriptions.Item>
            <Descriptions.Item label="检查人">
              {Array.isArray(form.getFieldValue('inspectors'))
                ? form.getFieldValue('inspectors').join(', ')
                : form.getFieldValue('inspectors')}
            </Descriptions.Item>
            <Descriptions.Item label="开始时间">
              {form.getFieldValue('start')?.format?.('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="结束时间">
              {form.getFieldValue('end')?.format?.('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="触发周期">
              每{form.getFieldValue('cycleNum')}
              {form.getFieldValue('cycleUnit')}
            </Descriptions.Item>
            <Descriptions.Item label="任务开始时间">
              {form.getFieldValue('taskStartTime')?.format?.('HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="地块名称" span={2}>
              {form.getFieldValue('plot')}
            </Descriptions.Item>
            <Descriptions.Item label="计划描述" span={2}>
              {form.getFieldValue('desc') || '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <PlanForm form={form} />
        )}
      </Modal>
    </>
  )
}
