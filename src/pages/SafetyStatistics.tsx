import { useMemo, useState, useCallback } from 'react'
import { Row, Col, Card, Radio, DatePicker, Button, Table, Space, Select } from 'antd'
import ReactECharts from 'echarts-for-react'
import dayjs, { Dayjs } from 'dayjs'
import {
  SAFETY_LEVEL_COLORS,
  getSafetyLineChart,
  getCategoryPieByTime,
  getRectificationPieByTime,
  getSafetyLevelPieByTime,
  getHazardTop5ByTime,
  type SafetyStatsTimeFilter,
} from '../mock/data'

const QUARTER_OPTIONS = [
  { value: 1, label: '第一季度' },
  { value: 2, label: '第二季度' },
  { value: 3, label: '第三季度' },
  { value: 4, label: '第四季度' },
]

function buildTimeFilter(
  period: SafetyStatsTimeFilter['period'],
  date: Dayjs,
  quarter: number,
): SafetyStatsTimeFilter {
  const year = period === 'year' ? date.year() : date.year()
  return {
    period,
    year,
    month: period === 'month' ? date.month() + 1 : date.month() + 1,
    quarter,
  }
}

export default function SafetyStatistics() {
  const [period, setPeriod] = useState<SafetyStatsTimeFilter['period']>('quarter')
  const [date, setDate] = useState<Dayjs>(dayjs('2023-06'))
  const [quarter, setQuarter] = useState(2)
  const [timeFilter, setTimeFilter] = useState<SafetyStatsTimeFilter>(() =>
    buildTimeFilter('quarter', dayjs('2023-06'), 2),
  )

  const applyFilter = useCallback(() => {
    setTimeFilter(buildTimeFilter(period, date, quarter))
  }, [period, date, quarter])

  const lineSource = useMemo(() => getSafetyLineChart(timeFilter), [timeFilter])

  const lineChart = useMemo(() => {
    const maxVal = Math.max(...lineSource.data, 1)
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['工单'], bottom: 0 },
      grid: { left: 48, right: 24, top: 32, bottom: 48 },
      xAxis: { type: 'category', data: lineSource.xLabels, name: lineSource.xAxisName },
      yAxis: { type: 'value', name: '工单数量', max: Math.ceil(maxVal * 1.2) },
      series: [{ name: '工单', type: 'line', data: lineSource.data, smooth: true, itemStyle: { color: '#1890ff' } }],
    }
  }, [lineSource])

  const categoryPie = useMemo(() => {
    const pieData = getCategoryPieByTime(timeFilter)
    return {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left', top: 'middle', textStyle: { fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['35%', '65%'],
          center: ['60%', '50%'],
          data: pieData,
        },
      ],
    }
  }, [timeFilter])

  const rectPie = useMemo(() => {
    const pieData = getRectificationPieByTime(timeFilter)
    return {
      tooltip: { trigger: 'item' },
      color: ['#faad14', '#52c41a', '#1890ff'],
      legend: { bottom: 0 },
      series: [{ type: 'pie', radius: '60%', data: pieData }],
    }
  }, [timeFilter])

  const safetyLevelData = useMemo(() => getSafetyLevelPieByTime(timeFilter), [timeFilter])

  const safetyLevelPie = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}：{c} 项 ({d}%)',
      },
      legend: { orient: 'vertical', left: 'left', top: 'middle' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '68%'],
          center: ['58%', '50%'],
          label: { formatter: '{b}\n{c}项' },
          data: safetyLevelData.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: SAFETY_LEVEL_COLORS[d.name] },
          })),
        },
      ],
    }),
    [safetyLevelData],
  )

  const safetyLevelTable = useMemo(() => {
    const total = safetyLevelData.reduce((s, x) => s + x.value, 0)
    return safetyLevelData.map((d) => ({
      key: d.name,
      level: d.name,
      count: d.value,
      percent: total ? `${((d.value / total) * 100).toFixed(1)}%` : '0%',
    }))
  }, [safetyLevelData])

  const hazardTop5 = useMemo(() => getHazardTop5ByTime(timeFilter), [timeFilter])

  const handlePeriodChange = (next: SafetyStatsTimeFilter['period']) => {
    setPeriod(next)
    setTimeFilter(buildTimeFilter(next, date, quarter))
  }

  const timeControl =
    period === 'quarter' ? (
      <Select
        value={quarter}
        onChange={(q) => {
          setQuarter(q)
          setTimeFilter(buildTimeFilter(period, date, q))
        }}
        style={{ width: 140 }}
        options={QUARTER_OPTIONS}
      />
    ) : (
      <DatePicker
        picker={period === 'month' ? 'month' : 'year'}
        value={date}
        onChange={(d) => {
          if (!d) return
          setDate(d)
          setTimeFilter(buildTimeFilter(period, d, quarter))
        }}
        allowClear={false}
      />
    )

  return (
    <div style={{ padding: 16 }}>
      <Space wrap size="middle" style={{ marginBottom: 16 }}>
        <span>时间选择：</span>
        <Radio.Group value={period} onChange={(e) => handlePeriodChange(e.target.value)}>
          <Radio.Button value="month">月</Radio.Button>
          <Radio.Button value="quarter">季</Radio.Button>
          <Radio.Button value="year">年</Radio.Button>
        </Radio.Group>
        {timeControl}
        <Button type="primary" onClick={applyFilter}>
          查询
        </Button>
      </Space>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="按安全类别统计" size="small">
            <ReactECharts option={categoryPie} style={{ height: 320 }} notMerge />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="按时间维度统计安全情况" size="small">
            <ReactECharts option={lineChart} style={{ height: 320 }} notMerge />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="按整改工单统计" size="small">
            <ReactECharts option={rectPie} style={{ height: 320 }} notMerge />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="按安全等级统计" size="small">
            <Row gutter={16}>
              <Col span={14}>
                <ReactECharts option={safetyLevelPie} style={{ height: 320 }} notMerge />
              </Col>
              <Col span={10}>
                <Table
                  size="small"
                  pagination={false}
                  style={{ marginTop: 24 }}
                  columns={[
                    { title: '安全等级', dataIndex: 'level', width: 80 },
                    { title: '检查项数', dataIndex: 'count', width: 80, align: 'right' },
                    { title: '占比', dataIndex: 'percent', width: 72, align: 'right' },
                  ]}
                  dataSource={safetyLevelTable}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          <Card title="按隐患及复出问题TOP5" size="small">
            <Table
              size="small"
              pagination={false}
              locale={{ emptyText: '暂无数据' }}
              columns={[
                { title: '序号', width: 60, render: (_, __, i) => i + 1 },
                { title: '隐患名称', dataIndex: 'name' },
                { title: '问题出现次数', dataIndex: 'count', width: 120 },
              ]}
              dataSource={hazardTop5}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
