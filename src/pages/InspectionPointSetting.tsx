import { useMemo, useRef, useState } from 'react'
import { Table, Form, Input, Select, Space, Modal, Descriptions, Button, Upload, message } from 'antd'
import { UploadOutlined, PrinterOutlined } from '@ant-design/icons'
import { QRCodeSVG } from '@rc-component/qrcode'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { pointRows as initialPointRows } from '../mock/data'
import { COMMUNITIES, matchesCommunityName } from '../constants/communities'

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

import { getInspectionPointQrValue } from '../constants/inspectionPointQr'

function PointQrCode({ value, size = 48 }: { value: string; size?: number }) {
  return (
    <div style={{ display: 'inline-flex', padding: 4, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4 }}>
      <QRCodeSVG value={value} size={size} />
    </div>
  )
}

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
      <Form.Item name="plot" label="小区名称" rules={[{ required: true, message: '请选择小区名称' }]}>
        <Select
          placeholder="请选择小区名称"
          options={PLOT_OPTIONS.map((v) => ({ value: v, label: v }))}
          onChange={(v) => {
            onPlotChange(v)
            form.setFieldValue('location', undefined)
          }}
        />
      </Form.Item>
      <Form.Item name="location" label="空间位置" rules={[{ required: true, message: '请选择空间位置' }]}>
        <Select
          placeholder={plot ? '请选择空间位置' : '请先选择小区'}
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
  const [communityFilter, setCommunityFilter] = useState<string>()
  const [nameFilter, setNameFilter] = useState('')
  const [printOpen, setPrintOpen] = useState(false)
  const [printRows, setPrintRows] = useState<PointRow[]>([])
  const printRef = useRef<HTMLDivElement>(null)
  const [form] = Form.useForm()

  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        if (communityFilter && !matchesCommunityName(row.plot, communityFilter)) return false
        if (nameFilter.trim() && !row.name.includes(nameFilter.trim())) return false
        return true
      }),
    [data, communityFilter, nameFilter],
  )

  const openModal = (type: 'add' | 'view' | 'edit', record?: PointRow) => {
    setModal(type)
    if (type === 'add') {
      form.resetFields()
      form.setFieldsValue({ tag: '二维码' })
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
        setData((prev) => [...prev, { ...values, id, tag: values.tag || '二维码' }])
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

  const handleBatchPrintQr = () => {
    if (!selected.length) {
      message.warning('请先勾选需要打印的点位')
      return
    }
    const rows = data.filter((r) => selected.includes(r.id))
    setPrintRows(rows)
    setPrintOpen(true)
  }

  const handlePrint = () => {
    if (!printRef.current) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      message.error('无法打开打印窗口，请检查浏览器弹窗设置')
      return
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>批量打印二维码</title>
          <style>
            body { font-family: sans-serif; padding: 24px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
            .item { text-align: center; page-break-inside: avoid; border: 1px solid #eee; padding: 16px; border-radius: 8px; }
            .name { font-size: 14px; font-weight: 600; margin-top: 12px; }
            .meta { font-size: 12px; color: #666; margin-top: 4px; }
            .id { font-size: 11px; color: #999; margin-top: 4px; }
          </style>
        </head>
        <body>${printRef.current.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '点位编号', dataIndex: 'id' },
    { title: '点位名称', dataIndex: 'name' },
    { title: '点位描述', dataIndex: 'desc' },
    { title: '小区名称', dataIndex: 'plot' },
    { title: '空间位置', dataIndex: 'location' },
    { title: '标签名称', dataIndex: 'tag', width: 90 },
    {
      title: '二维码',
      width: 88,
      align: 'center' as const,
      render: (_: unknown, record: PointRow) => <PointQrCode value={getInspectionPointQrValue(record)} size={56} />,
    },
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
      <SearchBar
        onSearch={() => {}}
        onClear={() => {
          setCommunityFilter(undefined)
          setNameFilter('')
        }}
      >
        <Space wrap>
          <Form.Item label="小区名称" style={{ marginBottom: 0 }}>
            <Select
              placeholder="请选择小区名称"
              style={{ width: 200 }}
              allowClear
              value={communityFilter}
              onChange={setCommunityFilter}
              options={COMMUNITIES.map((v) => ({ value: v, label: v }))}
            />
          </Form.Item>
          <Form.Item label="点位名称" style={{ marginBottom: 0 }}>
            <Input
              placeholder="请输入点位名称"
              style={{ width: 200 }}
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              allowClear
            />
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
        showBatchPrintQr
        onBatchPrintQr={handleBatchPrintQr}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
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
            <Descriptions.Item label="小区名称">{form.getFieldValue('plot')}</Descriptions.Item>
            <Descriptions.Item label="空间位置">{form.getFieldValue('location')}</Descriptions.Item>
            <Descriptions.Item label="标签名称">{form.getFieldValue('tag') || '-'}</Descriptions.Item>
            <Descriptions.Item label="二维码">
              {form.getFieldValue('id') ? (
                <PointQrCode
                  value={getInspectionPointQrValue({
                    id: form.getFieldValue('id'),
                    name: form.getFieldValue('name'),
                    plot: form.getFieldValue('plot'),
                  })}
                  size={72}
                />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="点位标记">{form.getFieldValue('drawing') || '未选择任何图纸'}</Descriptions.Item>
          </Descriptions>
        ) : (
          <PointForm form={form} plot={selectedPlot} onPlotChange={setSelectedPlot} />
        )}
      </Modal>
      <Modal
        title={`批量打印二维码（${printRows.length} 项）`}
        open={printOpen}
        onCancel={() => setPrintOpen(false)}
        width={720}
        footer={
          <>
            <Button onClick={() => setPrintOpen(false)}>关闭</Button>
            <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
          </>
        }
        destroyOnClose
      >
        <div
          ref={printRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            maxHeight: 480,
            overflowY: 'auto',
          }}
        >
          {printRows.map((row) => (
            <div
              key={row.id}
              style={{
                textAlign: 'center',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 16,
              }}
            >
              <PointQrCode value={getInspectionPointQrValue(row)} size={120} />
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>{row.name}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{row.plot}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{row.location}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{row.id}</div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
