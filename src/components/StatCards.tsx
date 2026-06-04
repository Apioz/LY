import { Row, Col, Card, Statistic } from 'antd'

interface StatCardsProps {
  items: { label: string; value: number | string }[]
  colSpan?: number
}

export default function StatCards({ items, colSpan }: StatCardsProps) {
  const span = colSpan ?? Math.floor(24 / items.length)
  return (
    <Row gutter={16} style={{ padding: '16px 16px 0' }}>
      {items.map((item) => (
        <Col span={span} key={item.label}>
          <Card size="small">
            <Statistic title={item.label} value={item.value} />
          </Card>
        </Col>
      ))}
    </Row>
  )
}
