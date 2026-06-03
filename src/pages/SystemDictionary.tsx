import { useState } from 'react'
import { Table, Input, Space, Modal, Form, Switch, Row, Col } from 'antd'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { dictRows } from '../mock/data'

export default function SystemDictionary() {
  const [selected, setSelected] = useState<React.Key[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const columns = [
    { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
    {
      title: '字典编号',
      dataIndex: 'code',
      render: (v: string) => <a>{v}</a>,
    },
    { title: '字典名称', dataIndex: 'name' },
    { title: '字典排序', dataIndex: 'sort', width: 100 },
    {
      title: '封存',
      dataIndex: 'archived',
      width: 80,
      render: (v: string) => <span style={{ color: '#1890ff', background: '#e6f7ff', padding: '2px 8px' }}>{v}</span>,
    },
    {
      title: '操作',
      width: 200,
      render: () => (
        <Space>
          <a>编辑</a>
          <a style={{ color: '#ff4d4f' }}>删除</a>
          <a>字典配置</a>
        </Space>
      ),
    },
  ]

  return (
    <>
      <SearchBar onSearch={() => {}} onClear={() => {}}>
        <Space wrap>
          <span>字典编号：</span>
          <Input placeholder="请输入 字典编号" style={{ width: 200 }} />
          <span>字典名称：</span>
          <Input placeholder="请输入 字典名称" style={{ width: 200 }} />
        </Space>
      </SearchBar>
      <TableToolbar showBatchDelete={false} onAdd={() => setModalOpen(true)} />
      <Table
        rowKey="code"
        columns={columns}
        dataSource={dictRows}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={{
          total: 192,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          pageSize: 10,
          showQuickJumper: true,
        }}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal title="新增" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => setModalOpen(false)} okText="保存" cancelText="取消" width={560}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="字典编号" rules={[{ required: true }]}>
            <Input placeholder="请输入 字典编号" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="字典名称" rules={[{ required: true }]}>
                <Input placeholder="请输入 字典名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sort" label="字典排序" rules={[{ required: true }]}>
                <Input type="number" placeholder="请输入 字典排序" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="archived" label="封存" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
          <Form.Item name="remark" label="字典备注">
            <Input placeholder="请输入 字典备注" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
