import { useState } from 'react'
import { Table, Form, Input, Select, Space, Modal, Descriptions, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { pointRows as initialPointRows } from '../mock/data'

export type PointRow = {
  id: string
  name: string
  desc: string
  plot: string
  location: string
  tag: string
  drawing?: string
}

const PLOT_OPTIONS = ['双翼大厦', '中期大厦', '天山路473号']
const PLOT_LOCATIONS: Record<string, string[]> = {
  双翼大厦: ['1号楼/2F/配电间', '1号楼/1F/生活水泵房', '1号楼/B2F/消防泵房', '1号楼/1F/厨房（麦当劳）', '1号楼/2F/办公区'],
  中期大厦: ['1号楼/B1F/高压配电间', '1号楼/29F/电梯机房', '1号楼/屋顶/设备层'],
  天山路473号: ['1号楼/1F/大堂', '1号楼/B1F/停车场'],
}
const TAG_OPTIONS = ['NFC', '二维码', '蓝牙']

function PointForm({
  form,
  disabled,
  plot,
  onPlotChange,
}: {
  form: ReturnType<typeof Form.useForm>[0]
  disabled?: boolean
  plot?: string
  onPlotChange: (p?: string) => void
}) {
  const [drawingName, setDrawingName] = useState<string>()

  return (
    <Form form={form} layout="vertical" disabled={disabled}>
      <Form.Item name="name" label="点位名称" rules={[{ required: true, message: '请输入点位名称' }]}>
        <Input placeholder="请输入点位名称" />
      </Form.Item>
      <Form.Item name="desc" label="点位描述">
        <Input placeholder="请输入点位描述" />
      </Form.Item>
      <Form.Item name="plot" label="地块名称" rules={[{ required: true, message: '请选择地块名称' }]}>
        <Select
          placeholder="请选择地块名称"
          options={PLOT_OPTIONS.map((v) => ({ value: v, label: v }))}
          onChange={(v) => {
            onPlotChange(v)
            form.setFieldValue('location', undefined)
          }}
        />
      </Form.Item>
      <Form.Item name="location" label="空间位置" rules={[{ required: true, message: '请选择空间位置' }]}>
        <Select
          placeholder={plot ? '请选择空间位置' : '请先选择地块'}
          disabled={!plot || disabled}
          options={(plot ? PLOT_LOCATIONS[plot] : [])?.map((v) => ({ value: v, label: v }))}
        />
      </Form.Item>
      <Form.Item name="tag" label="标签名称">
        <Select placeholder="请选择标签名称" allowClear options={TAG_OPTIONS.map((v) => ({ value: v, label: v }))} />
      </Form.Item>
      <Form.Item
        name="drawing"
        label="点位标记"
        rules={[{ required: true, message: '请选择图纸' }]}
        extra={drawingName || form.getFieldValue('drawing') || '未选择任何图纸'}
      >
        <Upload
          maxCount={1}
          showUploadList={false}
          beforeUpload={(file) => {
            setDrawingName(file.name)
            form.setFieldValue('drawing', file.name)
            return false
          }}
        >
          <Button icon={<UploadOutlined />} disabled={disabled}>
            选择图纸
          </Button>
        </Upload>
      </Form.Item>
    </Form>
  )
}

export default function InspectionPointSetting() {
  const [data, setData] = useState<PointRow[]>(initialPointRows)
  const [selected, setSelected] = useState<React.Key[]>([])
  const [modal, setModal] = useState<'add' | 'view' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedPlot, setSelectedPlot] = useState<string>()
  const [form] = Form.useForm()

  const openModal = (type: 'add' | 'view' | 'edit', record?: PointRow) => {
    setModal(type)
    if (type === 'add') {
      form.resetFields()
      setEditingId(null)
      setSelectedPlot(undefined)
    } else if (record) {
      form.setFieldsValue({ ...record, drawing: record.drawing || '已上传图纸.pdf' })
      setEditingId(record.id)
      setSelectedPlot(record.plot)
    }
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (modal === 'add') {
        const id = `PT${Date.now()}`
        setData((prev) => [...prev, { ...values, id, tag: values.tag || 'NFC' }])
        message.success('新增成功')
      } else if (modal === 'edit' && editingId) {
        setData((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...values } : r)))
        message.success('编辑成功')
      }
      setModal(null)
    })
  }

  const handleDelete = (record: PointRow) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除点位「${record.name}」吗？`,
      okType: 'danger',
      onOk: () => {
        setData((prev) => prev.filter((r) => r.id !== record.id))
        message.success('删除成功')
      },
    })
  }

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '点位编号', dataIndex: 'id' },
    { title: '点位名称', dataIndex: 'name' },
    { title: '点位描述', dataIndex: 'desc' },
    { title: '地块名称', dataIndex: 'plot' },
    { title: '空间位置', dataIndex: 'location' },
    { title: '标签名称', dataIndex: 'tag' },
    {
      title: '操作',
      width: 180,
      render: (_: unknown, record: PointRow) => (
        <Space>
          <a onClick={() => openModal('view', record)}>查看</a>
          <a onClick={() => openModal('edit', record)}>编辑</a>
          <a style={{ color: '#ff4d4f' }} onClick={() => handleDelete(record)}>
            删除
          </a>
        </Space>
      ),
    },
  ]

  return (
    <>
      <SearchBar onSearch={() => {}} onClear={() => {}}>
        <Space wrap>
          <Form.Item label="地块名称" style={{ marginBottom: 0 }}>
            <Select placeholder="请选择地块名称" style={{ width: 200 }} allowClear options={PLOT_OPTIONS.map((v) => ({ value: v }))} />
          </Form.Item>
          <Form.Item label="点位名称" style={{ marginBottom: 0 }}>
            <Input placeholder="请输入点位名称" style={{ width: 200 }} />
          </Form.Item>
        </Space>
      </SearchBar>
      <TableToolbar
        selectedCount={selected.length}
        onAdd={() => openModal('add')}
        onClearSelection={() => setSelected([])}
        onBatchDelete={() => {
          Modal.confirm({
            title: '批量删除',
            content: `确定删除选中的 ${selected.length} 条记录吗？`,
            okType: 'danger',
            onOk: () => {
              setData((prev) => prev.filter((r) => !selected.includes(r.id)))
              setSelected([])
              message.success('删除成功')
            },
          })
        }}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{ total: data.length, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal
        title={modal === 'add' ? '新增' : modal === 'edit' ? '编辑' : '查看'}
        open={!!modal}
        onCancel={() => setModal(null)}
        footer={
          modal === 'view' ? (
            <Button onClick={() => setModal(null)}>关闭</Button>
          ) : (
            <>
              <Button onClick={() => setModal(null)}>关闭</Button>
              <Button type="primary" onClick={handleSave}>
                确定
              </Button>
            </>
          )
        }
        width={520}
        destroyOnClose
      >
        {modal === 'view' ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="点位编号">{form.getFieldValue('id')}</Descriptions.Item>
            <Descriptions.Item label="点位名称">{form.getFieldValue('name')}</Descriptions.Item>
            <Descriptions.Item label="点位描述">{form.getFieldValue('desc') || '-'}</Descriptions.Item>
            <Descriptions.Item label="地块名称">{form.getFieldValue('plot')}</Descriptions.Item>
            <Descriptions.Item label="空间位置">{form.getFieldValue('location')}</Descriptions.Item>
            <Descriptions.Item label="标签名称">{form.getFieldValue('tag') || '-'}</Descriptions.Item>
            <Descriptions.Item label="点位标记">{form.getFieldValue('drawing') || '未选择任何图纸'}</Descriptions.Item>
          </Descriptions>
        ) : (
          <PointForm form={form} plot={selectedPlot} onPlotChange={setSelectedPlot} />
        )}
      </Modal>
    </>
  )
}
