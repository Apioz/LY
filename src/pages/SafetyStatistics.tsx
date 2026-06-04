import { useMemo, useState } from 'react'
import { Row, Col, Card, Radio, DatePicker, Button, Table, Space, Select } from 'antd'
import ReactECharts from 'echarts-for-react'
import dayjs, { Dayjs } from 'dayjs'
import {
  categoryPieData,
  rectificationPieData,
  safetyLevelPieData,
  SAFETY_LEVEL_COLORS,
  getLineDataByMonth,
} from '../mock/data'

const QUARTER_OPTIONS = [
  { value: 1, label: '第一季度' },
  { value: 2, label: '第二季度' },
  { value: 3, label: '第三季度' },
  { value: 4, label: '第四季度' },
]

export default function SafetyStatistics() {
  const currentYear = dayjs().year()
  const [scope, setScope] = useState<'lease' | 'property'>('lease')
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('quarter')
  const [date, setDate] = useState<Dayjs>(dayjs('2023-06'))
  const [quarter, setQuarter] = useState(2)

  const lineChart = useMemo(() => {
    const y = period === 'year' ? date.year() : currentYear
    const m =
      period === 'month'
        ? date.month() + 1
        : period === 'quarter'
          ? quarter * 3
          : 6
    const { days, data } = getLineDataByMonth(y, m)
    const xLabels = Array.from({ length: days }, (_, i) => `${i + 1}日`)
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['工单'], bottom: 0 },
      grid: { left: 48, right: 24, top: 32, bottom: 48 },
      xAxis: { type: 'category', data: xLabels, name: '日期' },
      yAxis: { type: 'value', name: '工单数量', max: 18 },
      series: [{ name: '工单', type: 'line', data, smooth: true, itemStyle: { color: '#1890ff' } }],
    }
  }, [date, period, quarter, currentYear])

  const categoryPie = useMemo(
    () => ({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left', top: 'middle', textStyle: { fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['35%', '65%'],
          center: ['60%', '50%'],
          data: categoryPieData,
        },
      ],
    }),
    [],
  )

  const rectPie = useMemo(
    () => ({
      tooltip: { trigger: 'item' },
      color: ['#faad14', '#52c41a', '#1890ff'],
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: rectificationPieData,
        },
      ],
    }),
    [],
  )

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
          data: safetyLevelPieData.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: SAFETY_LEVEL_COLORS[d.name] },
          })),
        },
      ],
    }),
    [],
  )

  const safetyLevelTable = useMemo(
    () =>
      safetyLevelPieData.map((d) => ({
        key: d.name,
        level: d.name,
        count: d.value,
        percent: `${((d.value / safetyLevelPieData.reduce((s, x) => s + x.value, 0)) * 100).toFixed(1)}%`,
      })),
    [],
  )

  const timeControl =
    period === 'quarter' ? (
      <Select
        value={quarter}
        onChange={setQuarter}
        style={{ width: 140 }}
        options={QUARTER_OPTIONS}
      />
    ) : (
      <DatePicker
        picker={period === 'month' ? 'month' : 'year'}
        value={date}
        onChange={(d) => d && setDate(d)}
        allowClear={false}
      />
    )

  return (
    <div style={{ padding: 16 }}>
      <Space wrap size="middle" style={{ marginBottom: 16 }}>
        <span>筛选条件：</span>
        <Radio.Group value={scope} onChange={(e) => setScope(e.target.value)}>
          <Radio.Button value="lease">租赁</Radio.Button>
          <Radio.Button value="property">物业</Radio.Button>
        </Radio.Group>
        <span style={{ marginLeft: 16 }}>时间选择：</span>
        <Radio.Group value={period} onChange={(e) => setPeriod(e.target.value)}>
          <Radio.Button value="month">月</Radio.Button>
          <Radio.Button value="quarter">季</Radio.Button>
          <Radio.Button value="year">年</Radio.Button>
        </Radio.Group>
        {timeControl}
        <Button type="primary">查询</Button>
      </Space>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="按安全类别统计" size="small">
            <ReactECharts option={categoryPie} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="按时间维度统计安全情况" size="small">
            <ReactECharts option={lineChart} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="按整改工单统计" size="small">
            <ReactECharts option={rectPie} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="按安全等级统计" size="small">
            <Row gutter={16}>
              <Col span={14}>
                <ReactECharts option={safetyLevelPie} style={{ height: 320 }} />
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
              dataSource={[]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
