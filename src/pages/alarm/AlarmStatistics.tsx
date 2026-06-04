import { useMemo, useState } from 'react'
import { Radio, DatePicker, Row, Col, Card, Modal, message, Space, Button, Statistic, List, Tag } from 'antd'
import { RightOutlined, WarningOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs, { Dayjs } from 'dayjs'
import {
  realtimeHumanAlarms,
  realtimeTechAlarms,
  getKpiCards,
  getLevelDistributionFour,
  getTrendData,
} from '../../mock/alarmData'
import { LEVEL_COLORS } from './constants'

const LEVEL_WARN_COLORS: Record<number, string> = {
  1: '#ff4d4f',
  2: '#fa8c16',
  3: '#fadb14',
  4: '#1890ff',
}

export default function AlarmStatistics() {
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month')
  const [date, setDate] = useState<Dayjs>(dayjs('2025-01'))
  const [defense, setDefense] = useState<'人防数据' | '技防数据'>('技防数据')
  const [trendRange, setTrendRange] = useState<'today' | 'month' | 'year'>('month')
  const [detailId, setDetailId] = useState<string | null>(null)

  const kpiCards = useMemo(() => getKpiCards(period), [period])
  const realtimeList = defense === '人防数据' ? realtimeHumanAlarms : realtimeTechAlarms
  const detailItem = realtimeList.find((a) => a.id === detailId)

  const levelChart = useMemo(() => {
    const data = getLevelDistributionFour()
    return {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: 20, top: 'center' },
      series: [
        {
          type: 'pie',
          radius: ['50%', '72%'],
          center: ['40%', '50%'],
          label: { formatter: '{b}\n{d}%' },
          data: data.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: LEVEL_COLORS[d.name] },
          })),
        },
      ],
    }
  }, [])

  const trendChart = useMemo(() => {
    const { x, data } = getTrendData(trendRange)
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 24, top: 24, bottom: trendRange === 'month' ? 48 : 32 },
      xAxis: {
        type: 'category',
        data: x,
        axisLabel: { interval: trendRange === 'month' ? 2 : 0, rotate: trendRange === 'month' ? 0 : 0 },
      },
      yAxis: { type: 'value', max: trendRange === 'month' ? undefined : 500 },
      series: [
        {
          type: 'line',
          smooth: true,
          data,
          areaStyle: { color: 'rgba(24,144,255,0.15)' },
          lineStyle: { color: '#1890ff', width: 2 },
          itemStyle: { color: '#1890ff' },
        },
      ],
    }
  }, [trendRange])

  const pickerMode = period === 'day' ? 'date' : period === 'month' ? 'month' : 'year'
  const dateFormat = period === 'day' ? 'YYYY-MM-DD' : period === 'month' ? 'YYYY.MM' : 'YYYY'

  return (
    <div style={{ padding: 16, background: '#f5f5f5', minHeight: '100%' }}>
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>告警统计</span>
          <Space wrap>
            <Radio.Group value={defense} onChange={(e) => setDefense(e.target.value)}>
              <Radio.Button value="人防数据">人防数据</Radio.Button>
              <Radio.Button value="技防数据">技防数据</Radio.Button>
            </Radio.Group>
            <Radio.Group value={period} onChange={(e) => setPeriod(e.target.value)}>
              <Radio.Button value="day">日</Radio.Button>
              <Radio.Button value="month">月</Radio.Button>
              <Radio.Button value="year">年</Radio.Button>
            </Radio.Group>
            <DatePicker picker={pickerMode} value={date} onChange={(d) => d && setDate(d)} format={dateFormat} allowClear={false} />
            <Button type="primary" onClick={() => message.success('查询成功')}>
              查询
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {kpiCards.map((k) => (
          <Col span={6} key={k.label}>
            <Card size="small">
              <Statistic title={k.label} value={k.value} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="告警等级分布" size="small" style={{ marginBottom: 16 }}>
            <ReactECharts option={levelChart} style={{ height: 260 }} />
          </Card>
          <Card
            title="告警趋势图"
            size="small"
            extra={
              <Radio.Group value={trendRange} onChange={(e) => setTrendRange(e.target.value)} size="small">
                <Radio.Button value="today">今日</Radio.Button>
                <Radio.Button value="month">本月</Radio.Button>
                <Radio.Button value="year">全年</Radio.Button>
              </Radio.Group>
            }
          >
            <ReactECharts option={trendChart} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="实时告警" size="small" style={{ minHeight: 580 }}>
            <List
              dataSource={realtimeList}
              renderItem={(item) => {
                const color = LEVEL_WARN_COLORS[item.level]
                return (
                  <List.Item
                    style={{
                      borderLeft: `3px solid ${color}`,
                      paddingLeft: 12,
                      marginBottom: 8,
                      background: '#fafafa',
                      borderRadius: 4,
                    }}
                    actions={[
                      <a key="d" onClick={() => setDetailId(item.id)}>
                        详情 <RightOutlined />
                      </a>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<WarningOutlined style={{ color, fontSize: 20 }} />}
                      title={
                        <Space>
                          {item.name}
                          <Tag color={color}>{item.levelLabel}</Tag>
                        </Space>
                      }
                      description={item.time}
                    />
                  </List.Item>
                )
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal title="告警详情" open={!!detailId} onCancel={() => setDetailId(null)} footer={null} width={480}>
        {detailItem && (
          <div>
            <p>
              <strong>告警名称：</strong>
              {detailItem.name}
            </p>
            <p>
              <strong>告警等级：</strong>
              {detailItem.levelLabel}
            </p>
            <p>
              <strong>数据类型：</strong>
              {defense}
            </p>
            <p>
              <strong>告警时间：</strong>
              {detailItem.time}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
