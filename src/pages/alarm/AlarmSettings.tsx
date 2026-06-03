import { useState } from 'react'
import { Table, Input, Space, Modal, Form, Select, message, Button, Descriptions } from 'antd'
import SearchBar from '../../components/SearchBar'
import TableToolbar from '../../components/TableToolbar'
import { alarmRulesData, type AlarmRuleItem } from '../../mock/alarmData'
import { ALARM_LEVELS, ALARM_TYPES } from './constants'

export default function AlarmSettings() {
  const [data, setData] = useState<AlarmRuleItem[]>(alarmRulesData)
  const [selected, setSelected] = useState<React.Key[]>([])
  const [modal, setModal] = useState<'add' | 'view' | 'edit' | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [form] = Form.useForm()

  const openModal = (type: 'add' | 'view' | 'edit', record?: AlarmRuleItem) => {
    setModal(type)
    if (type === 'add') {
      form.resetFields()
      setEditingKey(null)
    } else if (record) {
      form.setFieldsValue(record)
      setEditingKey(record.key)
    }
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      if (modal === 'add') {
        const key = String(Date.now())
        setData((prev) => [{ key, ...values, createTime: now }, ...prev])
        message.success('保存成功')
      } else if (modal === 'edit' && editingKey) {
        setData((prev) => prev.map((r) => (r.key === editingKey ? { ...r, ...values } : r)))
        message.success('保存成功')
      }
      setModal(null)
    })
  }

  const handleDelete = (record: AlarmRuleItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除规则「${record.name}」吗？`,
      okType: 'danger',
      onOk: () => {
        setData((prev) => prev.filter((r) => r.key !== record.key))
        message.success('删除成功')
      },
    })
  }

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '规则名称', dataIndex: 'name', ellipsis: true },
    { title: '告警等级', dataIndex: 'level', width: 100 },
    { title: '告警类型', dataIndex: 'type', width: 100 },
    { title: '阈值', dataIndex: 'threshold', ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      width: 180,
      render: (_: unknown, record: AlarmRuleItem) => (
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

  const ruleForm = (
    <Form form={form} layout="vertical" disabled={modal === 'view'}>
      <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
        <Input placeholder="请输入" />
      </Form.Item>
      <Form.Item name="level" label="告警等级" rules={[{ required: true, message: '请选择告警等级' }]}>
        <Select placeholder="请选择" options={ALARM_LEVELS.map((v) => ({ value: v, label: v }))} />
      </Form.Item>
      <Form.Item name="type" label="告警类型" rules={[{ required: true, message: '请选择告警类型' }]}>
        <Select placeholder="请选择资产分类" options={ALARM_TYPES.map((v) => ({ value: v, label: v }))} />
      </Form.Item>
      <Form.Item name="threshold" label="告警阈值" rules={[{ required: true, message: '请输入告警阈值' }]}>
        <Input.TextArea rows={4} placeholder="请输入告警阈值条件" />
      </Form.Item>
    </Form>
  )

  return (
    <>
      <SearchBar onSearch={() => message.success('搜索完成')} onReset={() => {}}>
        <span>规则名称：</span>
        <Input placeholder="请输入规则名称" style={{ width: 240 }} />
      </SearchBar>
      <TableToolbar selectedCount={selected.length} onAdd={() => openModal('add')} onClearSelection={() => setSelected([])} />
      <Table
        rowKey="key"
        columns={columns}
        dataSource={data}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{ showTotal: (t) => `共 ${t} 条`, pageSize: 10 }}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal
        title={modal === 'add' ? '新增告警规则' : modal === 'edit' ? '编辑告警规则' : '查看告警规则'}
        open={!!modal}
        onCancel={() => setModal(null)}
        width={520}
        destroyOnClose
        footer={
          modal === 'view' ? (
            <Button onClick={() => setModal(null)}>关闭</Button>
          ) : (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <Button onClick={() => setModal(null)} style={{ marginRight: 16 }}>
                取消
              </Button>
              <Button type="primary" onClick={handleSave}>
                保存
              </Button>
            </div>
          )
        }
      >
        {modal === 'view' ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="规则名称">{form.getFieldValue('name')}</Descriptions.Item>
            <Descriptions.Item label="告警等级">{form.getFieldValue('level')}</Descriptions.Item>
            <Descriptions.Item label="告警类型">{form.getFieldValue('type')}</Descriptions.Item>
            <Descriptions.Item label="告警阈值">{form.getFieldValue('threshold')}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{form.getFieldValue('createTime')}</Descriptions.Item>
          </Descriptions>
        ) : (
          ruleForm
        )}
      </Modal>
    </>
  )
}
