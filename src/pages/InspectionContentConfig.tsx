import { useState } from 'react'
import { Table, Input, Space, Modal, Form, Select, Row, Col, Descriptions, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SearchBar from '../components/SearchBar'
import TableToolbar from '../components/TableToolbar'
import { contentConfigTree, safetyLevelOptions } from '../mock/data'

interface ConfigRow {
  key: string
  item: string
  category: string
  safetyLevel: string
  sort: number
  remark: string
  updater: string
  updateTime: string
  children?: ConfigRow[]
}

export default function InspectionContentConfig() {
  const [data, setData] = useState<ConfigRow[]>(contentConfigTree as ConfigRow[])
  const [selected, setSelected] = useState<React.Key[]>([])
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null)
  const [form] = Form.useForm()

  const columns: ColumnsType<ConfigRow> = [
    { title: '#', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '检查项目', dataIndex: 'item', ellipsis: true },
    { title: '安全类别', dataIndex: 'category', width: 110 },
    { title: '安全等级', dataIndex: 'safetyLevel', width: 90 },
    { title: '排序', dataIndex: 'sort', width: 70 },
    { title: '备注', dataIndex: 'remark', width: 80 },
    { title: '更新人', dataIndex: 'updater', width: 80 },
    { title: '更新时间', dataIndex: 'updateTime', width: 160 },
    {
      title: '操作',
      width: 150,
      render: (_: unknown, record: ConfigRow) => (
        <Space>
          <a
            onClick={() => {
              form.setFieldsValue(record)
              setModal('view')
            }}
          >
            查看
          </a>
          <a
            onClick={() => {
              form.setFieldsValue(record)
              setModal('edit')
            }}
          >
            编辑
          </a>
          <a style={{ color: '#ff4d4f' }}>删除</a>
        </Space>
      ),
    },
  ]

  const formFields = (
    <Form form={form} layout="vertical" disabled={modal === 'view'}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="parent" label="上级科目">
            <Select placeholder="请选择 上级科目" allowClear options={[{ value: '现场安全检查表' }]} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="item" label="检查科目" rules={[{ required: true, message: '请输入 检查科目' }]}>
            <Input placeholder="请输入 检查科目" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="category" label="安全类别">
            <Select placeholder="请选择 安全类别" options={[{ value: '消防设施' }]} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="safetyLevel" label="安全等级" rules={[{ required: true, message: '请选择 安全等级' }]}>
            <Select placeholder="请选择 安全等级" options={safetyLevelOptions.map((v) => ({ value: v, label: v }))} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="sort" label="排序" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入 排序" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="remark" label="备注">
            <Input placeholder="请输入 备注" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )

  return (
    <>
      <SearchBar onSearch={() => {}} onClear={() => {}}>
        <span>检查项目：</span>
        <Input placeholder="请输入 检查项目" style={{ width: 240 }} />
      </SearchBar>
      <TableToolbar
        showBatchDelete={false}
        showExport
        selectedCount={selected.length}
        onAdd={() => {
          form.resetFields()
          form.setFieldsValue({ sort: 0 })
          setModal('add')
        }}
        onClearSelection={() => setSelected([])}
      />
      <Table<ConfigRow>
        rowKey="key"
        columns={columns}
        dataSource={data}
        defaultExpandAllRows
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        pagination={false}
        style={{ padding: '0 16px 16px' }}
      />
      <Modal
        title={modal === 'add' ? '新增' : modal === 'edit' ? '编辑' : '查看'}
        open={!!modal}
        onCancel={() => setModal(null)}
        onOk={() => {
          if (modal !== 'view') setModal(null)
        }}
        okText="保存"
        cancelText="取消"
        footer={
          modal === 'view' ? (
            <Button onClick={() => setModal(null)}>关闭</Button>
          ) : undefined
        }
        width={720}
      >
        {modal === 'view' ? (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="检查项目">{form.getFieldValue('item')}</Descriptions.Item>
            <Descriptions.Item label="安全类别">{form.getFieldValue('category')}</Descriptions.Item>
            <Descriptions.Item label="安全等级">{form.getFieldValue('safetyLevel')}</Descriptions.Item>
            <Descriptions.Item label="排序">{form.getFieldValue('sort')}</Descriptions.Item>
            <Descriptions.Item label="备注">{form.getFieldValue('remark')}</Descriptions.Item>
            <Descriptions.Item label="更新人">{form.getFieldValue('updater')}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{form.getFieldValue('updateTime')}</Descriptions.Item>
          </Descriptions>
        ) : (
          formFields
        )}
      </Modal>
    </>
  )
}
