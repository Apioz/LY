import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { getKpiCardsByRange, getLevelDistributionFour, type AlarmKpiRange } from '../mock/alarmData'
import { LEVEL_COLORS } from '../pages/alarm/constants'

const KPI_CIRCLE_COLORS = ['#1890ff', '#fa8c16', '#95de64', '#bfbfbf']

const RANGE_LABELS: { key: AlarmKpiRange; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
]

export default function MiniDataPage() {
  const [range, setRange] = useState<AlarmKpiRange>('today')

  const kpiCards = useMemo(() => getKpiCardsByRange(range), [range])

  const levelChart = useMemo(() => {
    const data = getLevelDistributionFour()
    return {
      tooltip: { trigger: 'item', confine: true },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 12, color: '#666' },
      },
      series: [
        {
          type: 'pie',
          radius: '62%',
          center: ['50%', '44%'],
          label: {
            formatter: '{d}%',
            fontSize: 12,
            color: '#333',
          },
          labelLine: { length: 8, length2: 6 },
          data: data.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: LEVEL_COLORS[d.name] },
          })),
        },
      ],
    }
  }, [])

  return (
    <div className="mini-data-page">
      <div className="mini-data-topbar">
        <span className="mini-data-topbar-title">数据</span>
        <span className="mini-nav-actions">
          <span className="mini-nav-dot">···</span>
          <span className="mini-nav-circle">◎</span>
        </span>
      </div>

      <div className="mini-data-body">
        <div className="mini-data-type-tab">告警统计</div>

        <div className="mini-data-kpi-row">
          {kpiCards.map((item, index) => (
            <div key={item.label} className="mini-data-kpi-item">
              <div
                className="mini-data-kpi-circle"
                style={{ background: KPI_CIRCLE_COLORS[index] }}
              >
                {item.value}
              </div>
              <div className="mini-data-kpi-label">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mini-data-period-tabs">
          {RANGE_LABELS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`mini-data-period-tab ${range === item.key ? 'active' : ''}`}
              onClick={() => setRange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mini-data-chart-card">
          <div className="mini-data-chart-title">告警等级分布</div>
          <ReactECharts option={levelChart} style={{ height: 300, width: '100%' }} notMerge />
        </div>
      </div>
    </div>
  )
}
