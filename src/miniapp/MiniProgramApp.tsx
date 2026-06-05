import { useEffect, useMemo, useState } from 'react'
import { Dropdown, Button, Space } from 'antd'
import { DesktopOutlined, MobileOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import { getFacilityOrders, subscribeFacility, acceptFacilityOrder } from '../store/alarmSync'
import { MINI_CURRENT_USER, MINI_USER_ORG } from '../store/miniProgramUser'
import {
  getAllMiniOrders,
  getMiniOrderById,
  countByType,
  miniNotices,
  miniUpdates,
  MINI_TYPE_LABELS,
  MINI_TYPE_STATUS,
  MINI_LIST_TABS,
  subscribeMiniOrders,
  type MiniWorkOrder,
  type MiniWorkOrderType,
} from '../mock/miniProgramData'
import './miniapp.css'

type MiniRoute =
  | { page: 'home' }
  | { page: 'list'; type: MiniWorkOrderType }
  | { page: 'detail'; id: string }
  | { page: 'profile' }
  | { page: 'my-orders' }

interface MiniProgramAppProps {
  onSwitchToAdmin: () => void
}

const WO_ICONS: Record<MiniWorkOrderType, string> = {
  repair: '🔧',
  facility: '🏗️',
  maintenance: '📋',
  inspection: '✅',
}

const ROOT_PAGES: MiniRoute['page'][] = ['home', 'profile']

export default function MiniProgramApp({ onSwitchToAdmin }: MiniProgramAppProps) {
  const [route, setRoute] = useState<MiniRoute>({ page: 'home' })
  const [prevRoute, setPrevRoute] = useState<MiniRoute | null>(null)
  const [facilityOrders, setFacilityOrders] = useState(getFacilityOrders())
  const [, tick] = useState(0)

  const navigate = (next: MiniRoute) => {
    setPrevRoute(route)
    setRoute(next)
  }

  useEffect(() => subscribeFacility(() => setFacilityOrders([...getFacilityOrders()])), [])
  useEffect(() => subscribeMiniOrders(() => tick((n) => n + 1)), [])

  const allOrders = useMemo(() => getAllMiniOrders(facilityOrders), [facilityOrders, tick])
  const counts = useMemo(() => countByType(allOrders), [allOrders])

  const navTitle = useMemo(() => {
    if (route.page === 'list') return '工作列表'
    if (route.page === 'detail') return '工单详情'
    if (route.page === 'my-orders') return '我的工单'
    return ''
  }, [route])

  const showNavBar = !ROOT_PAGES.includes(route.page)

  const goBack = () => {
    if (prevRoute) {
      setRoute(prevRoute)
      setPrevRoute(null)
    } else {
      setRoute({ page: 'home' })
    }
  }

  return (
    <div className="mini-shell">
      <div className="mini-shell-header">
        <Space>
          <MobileOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 600 }}>溧阳消防局 · 小程序</span>
        </Space>
        <Dropdown
          menu={{
            items: [
              { key: 'admin', label: '中台管理系统', icon: <DesktopOutlined />, onClick: onSwitchToAdmin },
              { key: 'mini', label: '小程序', icon: <MobileOutlined /> },
            ],
            selectedKeys: ['mini'],
          }}
        >
          <Button type="link">
            切换端 <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <div className="mini-phone-wrap">
        <div className="mini-phone">
          <div className="mini-status-bar">溧阳消防局智慧消防</div>
          {showNavBar && (
            <div className="mini-nav-bar">
              <span className="mini-nav-back" onClick={goBack}>
                ‹
              </span>
              <span className="mini-nav-title">{navTitle}</span>
              <span className="mini-nav-actions">
                <span className="mini-nav-dot">···</span>
                <span className="mini-nav-circle">◎</span>
              </span>
            </div>
          )}
          <div className="mini-content">
            {route.page === 'home' && (
              <MiniHome
                counts={counts}
                onOpenList={(type) => navigate({ page: 'list', type })}
                onOpenMy={() => navigate({ page: 'my-orders' })}
              />
            )}
            {route.page === 'list' && (
              <MiniWorkOrderList
                type={route.type}
                orders={allOrders}
                onTypeChange={(type) => navigate({ page: 'list', type })}
                onOpenDetail={(id) => navigate({ page: 'detail', id })}
              />
            )}
            {route.page === 'detail' && (
              <MiniWorkOrderDetail
                order={getMiniOrderById(route.id, facilityOrders)}
                onAccept={(id) => {
                  acceptFacilityOrder(id, MINI_CURRENT_USER)
                  setFacilityOrders([...getFacilityOrders()])
                }}
              />
            )}
            {route.page === 'profile' && <MiniProfile />}
            {route.page === 'my-orders' && (
              <MiniMyWorkOrders
                orders={allOrders}
                onOpenDetail={(id) => navigate({ page: 'detail', id })}
              />
            )}
          </div>
          <div className="mini-tabbar">
            <div
              className={`mini-tabbar-item ${route.page === 'home' ? 'active' : ''}`}
              onClick={() => navigate({ page: 'home' })}
            >
              <span className="mini-tabbar-icon">🏠</span>
              首页
            </div>
            <div className="mini-tabbar-item">
              <span className="mini-tabbar-icon">👥</span>
              协作
            </div>
            <div className="mini-tabbar-item">
              <span className="mini-tabbar-icon">📊</span>
              数据
            </div>
            <div
              className={`mini-tabbar-item ${route.page === 'profile' ? 'active' : ''}`}
              onClick={() => navigate({ page: 'profile' })}
            >
              <span className={`mini-tabbar-icon ${route.page === 'profile' ? 'mini-tabbar-icon-active' : ''}`}>
                😊
              </span>
              我的
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniHome({
  counts,
  onOpenList,
  onOpenMy,
}: {
  counts: ReturnType<typeof countByType>
  onOpenList: (t: MiniWorkOrderType) => void
  onOpenMy: () => void
}) {
  const items: { type: MiniWorkOrderType | 'my'; label: string; count: number }[] = [
    { type: 'repair', label: '报修工单', count: counts.repair },
    { type: 'facility', label: '设施工单', count: counts.facility },
    { type: 'maintenance', label: '维保工单', count: counts.maintenance },
    { type: 'inspection', label: '巡检任务', count: counts.inspection },
    { type: 'my', label: '我的工单', count: counts.my },
  ]

  return (
    <>
      <div className="mini-home-banner">
        <h2>溧阳消防局</h2>
        <p>智慧消防管理平台 · 工单受理中心</p>
      </div>
      <div className="mini-section">
        <div className="mini-section-title">工单受理</div>
        <div className="mini-wo-grid">
          {items.map((item) => (
            <div
              key={item.label}
              className="mini-wo-item"
              onClick={() => (item.type === 'my' ? onOpenMy() : onOpenList(item.type))}
            >
              <div
                className="mini-wo-icon"
                style={{ background: item.type === 'my' ? '#f0f0ff' : '#e6f7ff' }}
              >
                {item.type === 'my' ? '📂' : WO_ICONS[item.type]}
                {item.count > 0 && <span className="mini-wo-badge">{item.count > 99 ? '99+' : item.count}</span>}
              </div>
              <div className="mini-wo-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mini-section">
        <div className="mini-section-title">
          通知公告 <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>查看更多 ›</span>
        </div>
        {miniNotices.map((n) => (
          <div key={n.id} className="mini-list-item">
            <div style={{ fontSize: 14 }}>{n.title}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{n.time}</div>
          </div>
        ))}
      </div>
      <div className="mini-section">
        <div className="mini-section-title">
          最新动态 <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>查看更多 ›</span>
        </div>
        {miniUpdates.map((n) => (
          <div key={n.id} className="mini-list-item">
            <div style={{ fontSize: 14 }}>{n.title}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{n.time}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function MiniWorkOrderList({
  type,
  orders,
  onTypeChange,
  onOpenDetail,
}: {
  type: MiniWorkOrderType
  orders: MiniWorkOrder[]
  onTypeChange: (t: MiniWorkOrderType) => void
  onOpenDetail: (id: string) => void
}) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const listOrders = useMemo(() => {
    let rows = orders.filter((o) => o.type === type)
    if (statusFilter) rows = rows.filter((o) => o.status === statusFilter)
    return rows
  }, [orders, type, statusFilter])

  const statuses = MINI_TYPE_STATUS[type]

  return (
    <div className="mini-work-list-page">
      <div className="mini-tabs mini-tabs-work">
        {MINI_LIST_TABS.map((t) => (
          <div
            key={t}
            className={`mini-tab ${t === type ? 'active' : ''}`}
            onClick={() => {
              onTypeChange(t)
              setStatusFilter(null)
            }}
          >
            {MINI_TYPE_LABELS[t]}
          </div>
        ))}
      </div>
      <div className="mini-filter-row mini-filter-fixed">
        <span
          className={`mini-filter-chip ${!statusFilter ? 'active' : ''}`}
          onClick={() => setStatusFilter(null)}
        >
          全部
        </span>
        {statuses.map((s) => (
          <span
            key={s}
            className={`mini-filter-chip ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === s ? null : s)}
          >
            {s}
          </span>
        ))}
      </div>
      <div className="mini-order-list">
        {listOrders.length === 0 ? (
          <div className="mini-empty">暂无工单</div>
        ) : (
          listOrders.map((o) => <OrderCard key={o.id} order={o} onClick={() => onOpenDetail(o.id)} />)
        )}
      </div>
    </div>
  )
}

function MiniProfile() {
  const menuItems = ['通讯录', '编辑资料', '修改密码']

  return (
    <div className="mini-profile-page">
      <div className="mini-profile-topbar">
        <span className="mini-profile-topbar-title">个人中心</span>
        <span className="mini-nav-actions">
          <span className="mini-nav-dot">···</span>
          <span className="mini-nav-circle">◎</span>
        </span>
      </div>
      <div className="mini-profile-user">
        <div className="mini-profile-avatar">🛡️</div>
        <div className="mini-profile-info">
          <div className="mini-profile-name">{MINI_CURRENT_USER}</div>
          <div className="mini-profile-org">{MINI_USER_ORG}</div>
        </div>
      </div>
      <div className="mini-profile-menu">
        {menuItems.map((item) => (
          <div key={item} className="mini-profile-menu-item">
            <span>{item}</span>
            <RightOutlined className="mini-profile-arrow" />
          </div>
        ))}
      </div>
      <button type="button" className="mini-profile-logout">
        退出登录
      </button>
    </div>
  )
}

function MiniMyWorkOrders({
  orders,
  onOpenDetail,
}: {
  orders: MiniWorkOrder[]
  onOpenDetail: (id: string) => void
}) {
  const [tab, setTab] = useState<'initiated' | 'todo' | 'done'>('initiated')
  const [typeFilter, setTypeFilter] = useState<MiniWorkOrderType | null>(null)

  const filtered = useMemo(() => {
    let rows = orders
    if (tab === 'initiated') rows = rows.filter((o) => o.initiator === MINI_CURRENT_USER)
    else if (tab === 'todo')
      rows = rows.filter(
        (o) =>
          o.receiver === MINI_CURRENT_USER &&
          !['已完成', '已处理', '已关单', '已取消'].includes(o.status),
      )
    else
      rows = rows.filter(
        (o) =>
          o.receiver === MINI_CURRENT_USER &&
          ['已完成', '已处理', '已关单'].includes(o.status),
      )
    if (typeFilter) rows = rows.filter((o) => o.type === typeFilter)
    return rows
  }, [orders, tab, typeFilter])

  const initiatedCount = orders.filter((o) => o.initiator === MINI_CURRENT_USER).length
  const todoCount = orders.filter(
    (o) =>
      o.receiver === MINI_CURRENT_USER &&
      !['已完成', '已处理', '已关单', '已取消'].includes(o.status),
  ).length
  const doneCount = orders.filter(
    (o) =>
      o.receiver === MINI_CURRENT_USER && ['已完成', '已处理', '已关单'].includes(o.status),
  ).length

  return (
    <div className="mini-work-list-page">
      <div className="mini-tabs">
        <div className={`mini-tab ${tab === 'initiated' ? 'active' : ''}`} onClick={() => setTab('initiated')}>
          我发起的({initiatedCount})
        </div>
        <div className={`mini-tab ${tab === 'todo' ? 'active' : ''}`} onClick={() => setTab('todo')}>
          我的待办({todoCount})
        </div>
        <div className={`mini-tab ${tab === 'done' ? 'active' : ''}`} onClick={() => setTab('done')}>
          我的已办({doneCount})
        </div>
      </div>
      <div className="mini-filter-row mini-filter-scroll">
        <span
          className={`mini-filter-chip ${!typeFilter ? 'active' : ''}`}
          onClick={() => setTypeFilter(null)}
        >
          全部
        </span>
        {(Object.keys(MINI_TYPE_LABELS) as MiniWorkOrderType[]).map((t) => (
          <span
            key={t}
            className={`mini-filter-chip ${typeFilter === t ? 'active' : ''}`}
            onClick={() => setTypeFilter(typeFilter === t ? null : t)}
          >
            {MINI_TYPE_LABELS[t]}
          </span>
        ))}
      </div>
      <div className="mini-order-list">
        {filtered.map((o) => (
          <OrderCard key={o.id} order={o} onClick={() => onOpenDetail(o.id)} />
        ))}
        {filtered.length === 0 && <div className="mini-empty">暂无工单</div>}
      </div>
    </div>
  )
}

function getProblemType(order: MiniWorkOrder) {
  return order.extra?.['问题类型'] ?? MINI_TYPE_LABELS[order.type]
}

function getProblemDesc(order: MiniWorkOrder) {
  return order.extra?.['问题描述'] ?? order.description ?? order.title
}

function OrderCard({ order, onClick }: { order: MiniWorkOrder; onClick: () => void }) {
  return (
    <div className="mini-order-card" onClick={onClick}>
      <div className="mini-order-head">
        <span className="mini-type-tag">{MINI_TYPE_LABELS[order.type]}</span>
        <span className="mini-order-time">{order.createTime}</span>
        <span className="mini-order-status">{order.status}</span>
      </div>
      <div className="mini-order-field">
        <span className="mini-order-label">问题类型：</span>
        <span className="mini-order-value">{getProblemType(order)}</span>
      </div>
      <div className="mini-order-field">
        <span className="mini-order-label">问题描述：</span>
        <span className="mini-order-value">{getProblemDesc(order)}</span>
      </div>
    </div>
  )
}

function MiniWorkOrderDetail({
  order,
  onAccept,
}: {
  order: MiniWorkOrder | undefined
  onAccept: (id: string) => void
}) {
  if (!order) return <div className="mini-empty">工单不存在</div>

  const canAccept = order.type === 'facility' && order.status === '待处理'

  return (
    <>
      <div className="mini-detail-block">
        <div className="mini-detail-title">基础信息</div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">工单编号</span>
          <span>{order.id}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">工单类型</span>
          <span>{MINI_TYPE_LABELS[order.type]}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">问题类型</span>
          <span>{getProblemType(order)}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">问题描述</span>
          <span>{getProblemDesc(order)}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">当前状态</span>
          <span style={{ color: '#1890ff', fontWeight: 600 }}>{order.status}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">发起人</span>
          <span>{order.initiator}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">接单人</span>
          <span>{order.receiver === '-' ? '—' : order.receiver}</span>
        </div>
        {order.location && (
          <div className="mini-detail-row">
            <span className="mini-detail-label">位置</span>
            <span>{order.location}</span>
          </div>
        )}
      </div>
      <div className="mini-detail-block">
        <div className="mini-detail-title">流转记录</div>
        {order.flowRecords.map((f, i) => (
          <div key={i} className="mini-flow-item">
            <div className="mini-flow-time">{f.time}</div>
            <div className="mini-flow-action">{f.action}</div>
            <div style={{ fontSize: 12, color: '#999' }}>操作人：{f.operator}</div>
          </div>
        ))}
      </div>
      {canAccept && (
        <button type="button" className="mini-btn-primary" onClick={() => onAccept(order.id)}>
          接单维修
        </button>
      )}
    </>
  )
}
