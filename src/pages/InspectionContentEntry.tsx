import { useState } from 'react'
import { Table, Input, Space, Modal, Form, Tree, message, Button } from 'antd'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { programRows as initialProgramRows, inspectionTree } from '../mock/data'

export type ProgramRow = {
  id: string
  name: string
  notes: string
  creator: string
  time: string
  contentKeys?: string[]
}

function ProgramForm({ form, disabled }: { form: ReturnType<typeof Form.useForm>[0]; disabled?: boolean }) {
  return (
    <Form form={form} layout="vertical" disabled={disabled}>
      <Form.Item name="name" label="程序名称" rules={[{ required: true, message: '请输入程序名称' }]}>
        <Input placeholder="请输入程序名称" />
      </Form.Item>
      <Form.Item name="contentKeys" label="检查内容" rules={[{ required: true, message: '请选择检查内容' }]}>
        <Tree checkable defaultExpandAll treeData={inspectionTree} disabled={disabled} />
      </Form.Item>
      <Form.Item name="notes" label="注意事项">
        <Input placeholder="请输入注意事项" />
      </Form.Item>
    </Form>
  )
}

export default function InspectionContentEntry() {
  const [data, setData] = useState<ProgramRow[]>(initialProgramRows)
  const [selected, setSelected] = useState<React.Key[]>([])
  const [modal, setModal] = useState<'add' | 'view' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  const openModal = (type: 'add' | 'view' | 'edit', record?: ProgramRow) => {
    setModal(type)
    if (type === 'add') {
      form.resetFields()
      setEditingId(null)
    } else if (record) {
      form.setFieldsValue({ ...record, contentKeys: record.contentKeys || ['1', '2'] })
      setEditingId(record.id)
    }
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      if (modal === 'add') {
        const id = `INPR${Date.now()}`
        setData((prev) => [
          { id, name: values.name, notes: values.notes || '', creator: '管理员1', time: now, contentKeys: values.contentKeys },
          ...prev,
        ])
        message.success('新增成功')
      } else if (modal === 'edit' && editingId) {
        setData((prev) =>
          prev.map((r) =>
            r.id === editingId ? { ...r, name: values.name, notes: values.notes || '', contentKeys: values.contentKeys } : r,
          ),
        )
        message.success('编辑成功')
      }
      setModal(null)
    })
  }

  const handleDelete = (record: ProgramRow) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除程序「${record.name}」吗？`,
      okType: 'danger',
      onOk: () => {
        setData((prev) => prev.filter((r) => r.id !== record.id))
        message.success('删除成功')
      },
    })
  }

  const handleBatchDelete = () => {
    if (selected.length === 0) {
      message.warning('请先选择要删除的记录')
      return
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定删除选中的 ${selected.length} 条记录吗？`,
      okType: 'danger',
      onOk: () => {
        setData((prev) => prev.filter((r) => !selected.includes(r.id)))
        setSelected([])
        message.success('删除成功')
      },
    })
  }

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '程序编号', dataIndex: 'id' },
    { title: '程序名称', dataIndex: 'name' },
    { title: '注意事项', dataIndex: 'notes' },
    { title: '创建人', dataIndex: 'creator' },
    { title: '创建时间', dataIndex: 'time' },
    {
      title: '操作',
      width: 160,
      render: (_: unknown, record: ProgramRow) => (
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
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <span>程序名称：</span>
        <Input placeholder="请输入程序名称" style={{ width: 240 }} />
      </SearchBar>
      <TableToolbar
        deleteLabel="删除"
        selectedCount={selected.length}
        onAdd={() => openModal('add')}
        onBatchDelete={handleBatchDelete}
        onClearSelection={() => setSelected([])}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{ total: data.length, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`, pageSize: 10 }}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal
        title={modal === 'add' ? '新增程序信息' : modal === 'edit' ? '编辑程序信息' : '查看程序信息'}
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
        width={640}
        destroyOnClose
      >
        <ProgramForm form={form} disabled={modal === 'view'} />
      </Modal>
    </>
  )
}
