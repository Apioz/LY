import { Space, Button } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  SearchOutlined,
  FullscreenOutlined,
  ExportOutlined,
} from '@ant-design/icons'

interface TableToolbarProps {
  showAdd?: boolean
  showBatchDelete?: boolean
  showExport?: boolean
  deleteLabel?: string
  onAdd?: () => void
  onBatchDelete?: () => void
  selectedCount?: number
  onClearSelection?: () => void
}

export default function TableToolbar({
  showAdd = true,
  showBatchDelete = true,
  showExport = false,
  deleteLabel = '批量删除',
  onAdd,
  onBatchDelete,
  selectedCount = 0,
  onClearSelection,
}: TableToolbarProps) {
  return (
    <>
      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          {showAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              新增
            </Button>
          )}
          {showBatchDelete && (
            <Button danger icon={<DeleteOutlined />} onClick={onBatchDelete} disabled={selectedCount === 0}>
              {deleteLabel}
            </Button>
          )}
          {showExport && (
            <Button style={{ color: '#fa8c16', borderColor: '#fa8c16' }} icon={<ExportOutlined />}>
              导出
            </Button>
          )}
        </Space>
        <Space>
          <Button type="text" icon={<ReloadOutlined />} />
          <Button type="text" icon={<ColumnHeightOutlined />} />
          <Button type="text" icon={<SearchOutlined />} />
          <Button type="text" icon={<FullscreenOutlined />} />
        </Space>
      </div>
      {selectedCount >= 0 && showBatchDelete && (
        <div
          style={{
            margin: '0 16px 8px',
            padding: '4px 12px',
            background: '#e6f7ff',
            fontSize: 13,
          }}
        >
          当前表格已选择 {selectedCount} 项{' '}
          <a onClick={onClearSelection} style={{ marginLeft: 8 }}>
            清空
          </a>
        </div>
      )}
    </>
  )
}
