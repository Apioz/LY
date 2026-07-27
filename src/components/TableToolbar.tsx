import { Space, Button } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  SearchOutlined,
  FullscreenOutlined,
  ExportOutlined,
} from '@ant-design/icons'

interface TableToolbarProps {
  showAdd?: boolean
  showBatchDelete?: boolean
  showBatchPrintQr?: boolean
  showExport?: boolean
  deleteLabel?: string
  batchPrintQrLabel?: string
  onAdd?: () => void
  onBatchDelete?: () => void
  onBatchPrintQr?: () => void
  selectedCount?: number
  onClearSelection?: () => void
}

export default function TableToolbar({
  showAdd = true,
  showBatchDelete = true,
  showBatchPrintQr = false,
  showExport = false,
  deleteLabel = '批量删除',
  batchPrintQrLabel = '批量打印二维码',
  onAdd,
  onBatchDelete,
  onBatchPrintQr,
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
          {showBatchPrintQr && (
            <Button icon={<PrinterOutlined />} onClick={onBatchPrintQr} disabled={selectedCount === 0}>
              {batchPrintQrLabel}
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
      {selectedCount >= 0 && (showBatchDelete || showBatchPrintQr) && (
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
