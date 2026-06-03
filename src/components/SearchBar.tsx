import { ReactNode } from 'react'
import { Row, Col, Space, Button } from 'antd'
import { SearchOutlined, ReloadOutlined, ClearOutlined } from '@ant-design/icons'

interface SearchBarProps {
  children: ReactNode
  onSearch?: () => void
  onReset?: () => void
  onClear?: () => void
  resetLabel?: string
  clearLabel?: string
}

export default function SearchBar({
  children,
  onSearch,
  onReset,
  onClear,
  resetLabel = '重置',
  clearLabel = '清空',
}: SearchBarProps) {
  return (
    <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid #f0f0f0' }}>
      <Row gutter={16} align="middle">
        <Col flex="auto">{children}</Col>
        <Col>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
              搜索
            </Button>
            {onClear ? (
              <Button icon={<ClearOutlined />} onClick={onClear}>
                {clearLabel}
              </Button>
            ) : (
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                {resetLabel}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  )
}
