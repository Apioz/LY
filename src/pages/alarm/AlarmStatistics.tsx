import { useMemo, useState } from 'react'
import { Radio, DatePicker, Row, Col, Modal, message } from 'antd'
import { RightOutlined, WarningFilled } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs, { Dayjs } from 'dayjs'
import {
  equipmentHealthData,
  personnelMetrics,
  realtimeHumanAlarms,
  realtimeTechAlarms,
  getKpiByDefense,
  getLevelDistribution,
  getTrendData,
} from '../../mock/alarmData'
import { LEVEL_COLORS } from './constants'
import './AlarmStatistics.css'

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

  const kpiCards = useMemo(() => getKpiByDefense(defense, period), [defense, period])
  const realtimeList = defense === '人防数据' ? realtimeHumanAlarms : realtimeTechAlarms
  const detailItem = realtimeList.find((a) => a.id === detailId)

  const equipmentChart = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#8ec8f8', fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['38%', '50%'],
          label: { color: '#e8f4ff', fontSize: 11 },
          data: equipmentHealthData.map((d, i) => ({
            name: d.name,
            value: d.value,
            itemStyle: {
              color: ['#13c2c2', '#1890ff', '#36cfc9', '#5cdbd3', '#87e8de', '#fa8c16', '#ffc53d'][i % 7],
            },
          })),
        },
      ],
    }),
    [],
  )

  const levelChart = useMemo(() => {
    const data = getLevelDistribution()
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: 20, top: 'center', textStyle: { color: '#8ec8f8' } },
      series: [
        {
          type: 'pie',
          radius: ['50%', '72%'],
          center: ['35%', '50%'],
          label: { show: false },
          data: data.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: LEVEL_COLORS[d.name] },
          })),
        },
      ],
      graphic: [
        {
          type: 'text',
          left: '28%',
          top: '44%',
          style: { text: '100%', fill: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
        },
      ],
    }
  }, [])

  const trendChart = useMemo(() => {
    const { x, data } = getTrendData(trendRange)
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 24, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: x, axisLine: { lineStyle: { color: '#3d6a9f' } }, axisLabel: { color: '#8ec8f8' } },
      yAxis: {
        type: 'value',
        max: 500,
        splitLine: { lineStyle: { color: 'rgba(64,169,255,0.15)' } },
        axisLabel: { color: '#8ec8f8' },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24,144,255,0.5)' },
                { offset: 1, color: 'rgba(24,144,255,0.05)' },
              ],
            },
          },
          lineStyle: { color: '#40a9ff', width: 2 },
          itemStyle: { color: '#40a9ff' },
        },
      ],
    }
  }, [trendRange])

  const pickerMode = period === 'day' ? 'date' : period === 'month' ? 'month' : 'year'
  const dateFormat = period === 'day' ? 'YYYY-MM-DD' : period === 'month' ? 'YYYY.MM' : 'YYYY'

  return (
    <div className="alarm-dashboard">
      <div className="alarm-dashboard-header">
        <h1 className="alarm-dashboard-title">告警统计</h1>
        <div className="alarm-filter-bar" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Radio.Group value={defense} onChange={(e) => setDefense(e.target.value)}>
            <Radio.Button value="人防数据">人防数据</Radio.Button>
            <Radio.Button value="技防数据">技防数据</Radio.Button>
          </Radio.Group>
          <Radio.Group value={period} onChange={(e) => setPeriod(e.target.value)}>
            <Radio.Button value="day">日</Radio.Button>
            <Radio.Button value="month">月</Radio.Button>
            <Radio.Button value="year">年</Radio.Button>
          </Radio.Group>
          <DatePicker
            picker={pickerMode}
            value={date}
            onChange={(d) => d && setDate(d)}
            format={dateFormat}
            allowClear={false}
          />
          <button
            type="button"
            onClick={() => message.success('查询成功')}
            style={{
              padding: '4px 15px',
              background: '#1890ff',
              border: '1px solid #1890ff',
              borderRadius: 2,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            查询
          </button>
        </div>
      </div>

      <div className="alarm-kpi-row">
        {kpiCards.map((k) => (
          <div key={k.label} className="alarm-kpi-card">
            <div className="alarm-kpi-value">{k.value}</div>
            <div className="alarm-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <Row gutter={16}>
        <Col span={16}>
          {defense === '技防数据' ? (
            <div className="alarm-panel">
              <div className="alarm-panel-title">消防设备健康度</div>
              <ReactECharts option={equipmentChart} style={{ height: 260 }} />
            </div>
          ) : (
            <div className="alarm-panel">
              <div className="alarm-panel-title">人员与问题管控</div>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: 36, fontWeight: 700, color: '#40a9ff' }}>≥90</div>
                    <div style={{ color: '#8ec8f8', marginTop: 8 }}>月度隐患总数</div>
                  </div>
                </Col>
                <Col span={16}>
                  {personnelMetrics.slice(1).map((m) => (
                    <div key={m.label} className="alarm-personnel-metric">
                      <span>{m.label}</span>
                      <span style={{ color: '#40a9ff', fontWeight: 600 }}>{m.value}</span>
                    </div>
                  ))}
                </Col>
              </Row>
            </div>
          )}

          <div className="alarm-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="alarm-panel-title" style={{ marginBottom: 0, border: 'none', padding: 0 }}>
                告警等级分布
              </div>
            </div>
            <ReactECharts option={levelChart} style={{ height: 220 }} />
          </div>

          <div className="alarm-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="alarm-panel-title" style={{ marginBottom: 0, border: 'none', padding: 0 }}>
                告警趋势图
              </div>
              <Radio.Group
                className="alarm-trend-tabs"
                value={trendRange}
                onChange={(e) => setTrendRange(e.target.value)}
                size="small"
              >
                <Radio.Button value="today">今日</Radio.Button>
                <Radio.Button value="month">本月</Radio.Button>
                <Radio.Button value="year">全年</Radio.Button>
              </Radio.Group>
            </div>
            <ReactECharts option={trendChart} style={{ height: 240 }} />
          </div>
        </Col>

        <Col span={8}>
          <div className="alarm-panel" style={{ minHeight: 480 }}>
            <div className="alarm-panel-title">实时告警</div>
            <div className="alarm-realtime-list">
              {realtimeList.map((item) => {
                const color = LEVEL_WARN_COLORS[item.level]
                return (
                  <div
                    key={item.id}
                    className="alarm-realtime-item"
                    style={{ borderLeftColor: color, background: `${color}15` }}
                  >
                    <div className="alarm-level-icon" style={{ color }}>
                      <div className="alarm-level-icon-inner" style={{ color: '#fff' }}>
                        <WarningFilled />
                      </div>
                    </div>
                    <div className="alarm-realtime-body">
                      <div className="alarm-realtime-name">
                        <span>{item.name}</span>
                        <span className="alarm-level-badge" style={{ background: color }}>
                          {item.levelLabel}
                        </span>
                      </div>
                      <div className="alarm-realtime-time">{item.time}</div>
                    </div>
                    <span className="alarm-detail-link" onClick={() => setDetailId(item.id)}>
                      详情 <RightOutlined />
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Col>
      </Row>

      <Modal
        title="告警详情"
        open={!!detailId}
        onCancel={() => setDetailId(null)}
        footer={null}
        width={480}
      >
        {detailItem && (
          <div>
            <p>
              <strong>告警名称：</strong>
              {detailItem.name}
            </p>
            <p>
              <strong>告警等级：</strong>
              {itemLevelToAlarm(detailItem.levelLabel)}
            </p>
            <p>
              <strong>数据类型：</strong>
              {defense}
            </p>
            <p>
              <strong>告警时间：</strong>
              {detailItem.time}
            </p>
            <p>
              <strong>描述：</strong>
              {detailItem.name}，请及时处置。
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

function itemLevelToAlarm(label: string) {
  const map: Record<string, string> = {
    一级预警: '一级告警',
    二级预警: '二级告警',
    三级预警: '三级告警',
    四级预警: '四级告警',
  }
  return map[label] || label
}
