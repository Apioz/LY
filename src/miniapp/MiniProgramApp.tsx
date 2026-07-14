import { useEffect, useMemo, useState } from 'react'
import { Dropdown, Button, Space } from 'antd'
import { DesktopOutlined, MobileOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import {
  getFacilityOrders,
  subscribeFacility,
  subscribeFacilityWorkOrderSettings,
} from '../store/alarmSync'
import { MINI_CURRENT_USER, MINI_USER_ORG } from '../store/miniProgramUser'
import {
  getAllMiniOrders,
  getFacilityListOrders,
  getHandledRecords,
  getMiniOrderById,
  countByType,
  miniNotices,
  miniUpdates,
  MINI_TYPE_LABELS,
  MINI_LIST_FILTER_STATUS,
  MINI_LIST_TABS,
  MINI_DONE_STATUSES,
  MINI_CANCELLED_STATUS,
  getWorkOrderListByType,
  subscribeMiniOrders,
  subscribeHandledRecords,
  handledToMiniOrder,
  type MiniWorkOrder,
  type MiniWorkOrderType,
} from '../mock/miniProgramData'
import {
  MiniFacilityDetail,
  MiniFacilityForm,
  MiniFacilityRepairingForm,
  type FacilityFormType,
} from './MiniFacilityViews'
import {
  TabDataIcon,
  TabHomeIcon,
  TabTeamIcon,
  TabUserIcon,
  ProfileAvatarIcon,
  WorkOrderIcon,
  ServiceWorkOrderIcon,
} from './MiniIcons'
import MiniDataPage from './MiniDataPage'
import './miniapp.css'

type MiniRoute =
  | { page: 'home' }
  | { page: 'list'; type: MiniWorkOrderType }
  | { page: 'detail'; id: string }
  | { page: 'profile' }
  | { page: 'collab' }
  | { page: 'data' }
  | { page: 'my-orders' }
  | { page: 'facility-form'; form: FacilityFormType; id: string }

interface MiniProgramAppProps {
  onSwitchToAdmin: () => void
}

const ROOT_PAGES: MiniRoute['page'][] = ['home', 'profile', 'collab', 'data']
const TAB_ACTIVE = '#1890ff'
const TAB_INACTIVE = '#999999'

export default function MiniProgramApp({ onSwitchToAdmin }: MiniProgramAppProps) {
  const [route, setRoute] = useState<MiniRoute>({ page: 'home' })
  const [prevRoute, setPrevRoute] = useState<MiniRoute | null>(null)
  const [facilityOrders, setFacilityOrders] = useState(getFacilityOrders())
  const [, tick] = useState(0)
  const [, handledTick] = useState(0)
  const [slaTick, setSlaTick] = useState(0)

  const navigate = (next: MiniRoute) => {
    setPrevRoute(route)
    setRoute(next)
  }

  const refreshFacility = () => setFacilityOrders([...getFacilityOrders()])

  useEffect(() => subscribeFacility(refreshFacility), [])
  useEffect(() => subscribeMiniOrders(() => tick((n) => n + 1)), [])
  useEffect(() => subscribeHandledRecords(() => handledTick((n) => n + 1)), [])
  useEffect(() => subscribeFacilityWorkOrderSettings(() => setSlaTick((n) => n + 1)), [])
  useEffect(() => {
    const timer = window.setInterval(() => setSlaTick((n) => n + 1), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const allOrders = useMemo(
    () => getAllMiniOrders(facilityOrders),
    [facilityOrders, tick, handledTick, slaTick],
  )
  const counts = useMemo(() => countByType(allOrders, facilityOrders), [allOrders, facilityOrders])

  const navTitle = useMemo(() => {
    if (route.page === 'list') return '工单列表'
    if (route.page === 'detail') return '工单详情'
    if (route.page === 'my-orders') return '我的工单'
    if (route.page === 'facility-form') {
      const titles: Record<FacilityFormType, string> = {
        cancel: '取消接单',
        repairing: '维修中',
        complete: '完成',
      }
      return titles[route.form]
    }
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

  const detailOrder = route.page === 'detail' ? getMiniOrderById(route.id, facilityOrders) : undefined

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
            {route.page === 'collab' && (
              <MiniCollabPage
                myCount={counts.my}
                onOpenMyOrders={() => navigate({ page: 'my-orders' })}
              />
            )}
            {route.page === 'list' && (
              <MiniWorkOrderList
                type={route.type}
                facilityOrders={facilityOrders}
                orders={allOrders}
                onTypeChange={(type) => navigate({ page: 'list', type })}
                onOpenDetail={(id) => navigate({ page: 'detail', id })}
              />
            )}
            {route.page === 'detail' && detailOrder && detailOrder.type === 'facility' && (
              <MiniFacilityDetail
                order={detailOrder}
                onOpenForm={(form) => navigate({ page: 'facility-form', form, id: detailOrder.id })}
                onRefresh={refreshFacility}
              />
            )}
            {route.page === 'detail' && detailOrder && detailOrder.type !== 'facility' && (
              <MiniWorkOrderDetail order={detailOrder} />
            )}
            {route.page === 'detail' && !detailOrder && <div className="mini-empty">工单不存在</div>}
            {route.page === 'facility-form' && route.form === 'repairing' && (
              <MiniFacilityRepairingForm
                orderId={route.id}
                onHold={() => {
                  refreshFacility()
                  setRoute({ page: 'detail', id: route.id })
                  setPrevRoute({ page: 'list', type: 'facility' })
                }}
                onNext={() => {
                  refreshFacility()
                  setRoute({ page: 'facility-form', form: 'complete', id: route.id })
                  setPrevRoute({ page: 'facility-form', form: 'repairing', id: route.id })
                }}
                onCancel={goBack}
              />
            )}
            {route.page === 'facility-form' && route.form !== 'repairing' && (
              <MiniFacilityForm
                form={route.form}
                orderId={route.id}
                onDone={() => {
                  refreshFacility()
                  setRoute({ page: 'detail', id: route.id })
                  setPrevRoute({ page: 'list', type: 'facility' })
                }}
                onCancel={goBack}
              />
            )}
            {route.page === 'profile' && <MiniProfile />}
            {route.page === 'data' && <MiniDataPage />}
            {route.page === 'my-orders' && (
              <MiniMyWorkOrders
                orders={allOrders}
                handledRecords={getHandledRecords()}
                onOpenDetail={(id) => navigate({ page: 'detail', id })}
              />
            )}
          </div>
          <div className="mini-tabbar">
            <div
              className={`mini-tabbar-item ${route.page === 'home' ? 'active' : ''}`}
              onClick={() => navigate({ page: 'home' })}
            >
              <span className="mini-tabbar-icon">
                <TabHomeIcon size={22} color={route.page === 'home' ? TAB_ACTIVE : TAB_INACTIVE} />
              </span>
              <span className="mini-tabbar-label">首页</span>
            </div>
            <div
              className={`mini-tabbar-item ${route.page === 'collab' || route.page === 'my-orders' ? 'active' : ''}`}
              onClick={() => navigate({ page: 'collab' })}
            >
              <span className="mini-tabbar-icon">
                <TabTeamIcon
                  size={22}
                  color={route.page === 'collab' || route.page === 'my-orders' ? TAB_ACTIVE : TAB_INACTIVE}
                />
              </span>
              <span className="mini-tabbar-label">协作</span>
            </div>
            <div
              className={`mini-tabbar-item ${route.page === 'data' ? 'active' : ''}`}
              onClick={() => navigate({ page: 'data' })}
            >
              <span className="mini-tabbar-icon">
                <TabDataIcon size={22} color={route.page === 'data' ? TAB_ACTIVE : TAB_INACTIVE} />
              </span>
              <span className="mini-tabbar-label">数据</span>
            </div>
            <div
              className={`mini-tabbar-item ${route.page === 'profile' ? 'active' : ''}`}
              onClick={() => navigate({ page: 'profile' })}
            >
              <span className="mini-tabbar-icon">
                <TabUserIcon size={22} color={route.page === 'profile' ? TAB_ACTIVE : TAB_INACTIVE} />
              </span>
              <span className="mini-tabbar-label">我的</span>
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
              <div className="mini-wo-icon">
                <WorkOrderIcon type={item.type} size={36} />
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
  facilityOrders,
  orders,
  onTypeChange,
  onOpenDetail,
}: {
  type: MiniWorkOrderType
  facilityOrders: ReturnType<typeof getFacilityOrders>
  orders: MiniWorkOrder[]
  onTypeChange: (t: MiniWorkOrderType) => void
  onOpenDetail: (id: string) => void
}) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const listOrders = useMemo(() => {
    let rows =
      type === 'facility'
        ? getFacilityListOrders(facilityOrders)
        : getWorkOrderListByType(orders, type)
    if (statusFilter) rows = rows.filter((o) => o.status === statusFilter)
    return rows
  }, [orders, type, statusFilter, facilityOrders])

  const statuses = MINI_LIST_FILTER_STATUS[type]

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

function MiniCollabPage({
  myCount,
  onOpenMyOrders,
}: {
  myCount: number
  onOpenMyOrders: () => void
}) {
  return (
    <div className="mini-collab-page">
      <div className="mini-collab-topbar">
        <span className="mini-nav-actions">
          <span className="mini-nav-dot">···</span>
          <span className="mini-nav-circle">◎</span>
        </span>
      </div>
      <div className="mini-collab-body">
        <div className="mini-collab-section-title">我的服务</div>
        <div className="mini-collab-grid">
          <div className="mini-collab-item" onClick={onOpenMyOrders}>
            <div className="mini-collab-icon">
              <ServiceWorkOrderIcon size={44} />
              {myCount > 0 && (
                <span className="mini-wo-badge">{myCount > 99 ? '99+' : myCount}</span>
              )}
            </div>
            <div className="mini-collab-label">我的工单</div>
          </div>
        </div>
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
        <div className="mini-profile-avatar">
          <ProfileAvatarIcon size={56} />
        </div>
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
  handledRecords,
  onOpenDetail,
}: {
  orders: MiniWorkOrder[]
  handledRecords: ReturnType<typeof getHandledRecords>
  onOpenDetail: (id: string) => void
}) {
  const [tab, setTab] = useState<'initiated' | 'todo' | 'done'>('initiated')
  const [typeFilter, setTypeFilter] = useState<MiniWorkOrderType | null>(null)

  const myHandled = useMemo(
    () => handledRecords.filter((r) => r.operator === MINI_CURRENT_USER).map(handledToMiniOrder),
    [handledRecords],
  )

  const filtered = useMemo(() => {
    let rows: MiniWorkOrder[] = []
    if (tab === 'initiated') {
      rows = orders.filter(
        (o) =>
          o.initiator === MINI_CURRENT_USER &&
          !o.archiveOnly &&
          o.status !== MINI_CANCELLED_STATUS,
      )
    } else if (tab === 'todo') {
      rows = orders.filter(
        (o) =>
          !o.archiveOnly &&
          o.receiver === MINI_CURRENT_USER &&
          ![...MINI_DONE_STATUSES, MINI_CANCELLED_STATUS].includes(o.status),
      )
    } else {
      const doneOrders = orders.filter(
        (o) =>
          !o.archiveOnly &&
          o.receiver === MINI_CURRENT_USER &&
          MINI_DONE_STATUSES.includes(o.status as (typeof MINI_DONE_STATUSES)[number]),
      )
      const cancelledOrders = orders.filter(
        (o) =>
          !o.archiveOnly &&
          o.status === MINI_CANCELLED_STATUS &&
          (o.initiator === MINI_CURRENT_USER || o.receiver === MINI_CURRENT_USER),
      )
      rows = [...myHandled, ...doneOrders, ...cancelledOrders]
    }
    if (typeFilter) rows = rows.filter((o) => o.type === typeFilter)
    return rows
  }, [orders, tab, typeFilter, myHandled])

  const initiatedCount = orders.filter(
    (o) =>
      o.initiator === MINI_CURRENT_USER && !o.archiveOnly && o.status !== MINI_CANCELLED_STATUS,
  ).length
  const todoCount = orders.filter(
    (o) =>
      !o.archiveOnly &&
      o.receiver === MINI_CURRENT_USER &&
      ![...MINI_DONE_STATUSES, MINI_CANCELLED_STATUS].includes(o.status),
  ).length
  const doneCount =
    orders.filter(
      (o) =>
        !o.archiveOnly &&
        ((o.receiver === MINI_CURRENT_USER &&
          MINI_DONE_STATUSES.includes(o.status as (typeof MINI_DONE_STATUSES)[number])) ||
          (o.status === MINI_CANCELLED_STATUS &&
            (o.initiator === MINI_CURRENT_USER || o.receiver === MINI_CURRENT_USER))),
    ).length + myHandled.length

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
  if (order.type === 'facility') return '设施工单'
  return order.extra?.['问题类型'] ?? MINI_TYPE_LABELS[order.type]
}

function getProblemDesc(order: MiniWorkOrder) {
  if (order.type === 'facility') return order.extra?.['告警设备'] ?? order.title
  return order.extra?.['问题描述'] ?? order.description ?? order.title
}

function OrderCard({ order, onClick }: { order: MiniWorkOrder; onClick: () => void }) {
  const archiveTag = order.archiveOnly ? order.extra?.['操作类型'] : null
  return (
    <div className="mini-order-card" onClick={onClick}>
      <div className="mini-order-head">
        <span className="mini-type-tag">{MINI_TYPE_LABELS[order.type]}</span>
        <span className="mini-order-time">{order.createTime}</span>
        <span className="mini-order-status">{archiveTag ?? order.status}</span>
      </div>
      <div className="mini-order-field">
        <span className="mini-order-label">问题类型：</span>
        <span className="mini-order-value">{getProblemType(order)}</span>
      </div>
      <div className="mini-order-field">
        <span className="mini-order-label">问题描述：</span>
        <span className="mini-order-value">{getProblemDesc(order)}</span>
      </div>
      {order.type === 'facility' && order.extra?.['安装位置'] && (
        <div className="mini-order-field">
          <span className="mini-order-label">安装位置：</span>
          <span className="mini-order-value">{order.extra['安装位置']}</span>
        </div>
      )}
      {order.type === 'facility' && order.extra?.['时效状态'] && (
        <div className="mini-order-field">
          <span className="mini-order-label">时效状态：</span>
          <span
            className="mini-order-value"
            style={{ color: order.extra['时效颜色'] ?? '#52c41a', fontWeight: 600 }}
          >
            {order.extra['时效状态']}
          </span>
        </div>
      )}
    </div>
  )
}

function MiniWorkOrderDetail({ order }: { order: MiniWorkOrder }) {
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
    </>
  )
}
