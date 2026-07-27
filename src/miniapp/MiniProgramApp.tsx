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
  getOrderCommunity,
  isInspectionWorkOrderType,
  getListTabsForType,
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
  ScanHomeIcon,
  ServiceWorkOrderIcon,
} from './MiniIcons'
import MiniCommunityFilter, { matchesCommunityFilter } from './MiniCommunityFilter'
import MiniDataPage from './MiniDataPage'
import { MiniScanPage, MiniQrResultPage, MiniSafetyProcessingPage } from './MiniScanViews'
import './miniapp.css'

type MiniRoute =
  | { page: 'home' }
  | { page: 'scan' }
  | { page: 'qr-result'; qrValue: string; sessionId: string }
  | { page: 'safety-processing'; id: string; sessionId?: string }
  | { page: 'list'; type: MiniWorkOrderType }
  | { page: 'detail'; id: string; readOnly?: boolean }
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
  const [routeStack, setRouteStack] = useState<MiniRoute[]>([{ page: 'home' }])
  const route = routeStack[routeStack.length - 1]
  const [activeScanSession, setActiveScanSession] = useState<{ sessionId: string; qrValue: string } | null>(null)
  const [facilityOrders, setFacilityOrders] = useState(getFacilityOrders())
  const [, tick] = useState(0)
  const [, handledTick] = useState(0)
  const [slaTick, setSlaTick] = useState(0)

  const navigate = (next: MiniRoute) => {
    setRouteStack((stack) => [...stack, next])
  }

  const goBack = () => {
    setRouteStack((stack) => {
      if (stack.length <= 1) return stack
      const leaving = stack[stack.length - 1]
      if (leaving.page === 'qr-result') {
        setActiveScanSession(null)
      }
      return stack.slice(0, -1)
    })
  }

  const resetToHome = () => {
    setActiveScanSession(null)
    setRouteStack([{ page: 'home' }])
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
    if (route.page === 'scan') return '扫一扫'
    if (route.page === 'qr-result') return '扫描结果'
    if (route.page === 'safety-processing') return '处理中'
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

  const openSafetyProcessing = (id: string, sessionId?: string) => {
    navigate({ page: 'safety-processing', id, sessionId })
  }

  const openOrderDetail = (id: string) => {
    const order = getMiniOrderById(id, facilityOrders)
    if (order?.type === 'safety') {
      if (order.status === '处理中' && order.receiver === MINI_CURRENT_USER) {
        openSafetyProcessing(id)
        return
      }
      navigate({ page: 'detail', id, readOnly: true })
      return
    }
    navigate({ page: 'detail', id })
  }

  const handleScanSuccess = (qrValue: string, sessionId: string) => {
    setActiveScanSession({ qrValue, sessionId })
    navigate({ page: 'qr-result', qrValue, sessionId })
  }

  const processingOrder =
    route.page === 'safety-processing' ? getMiniOrderById(route.id, facilityOrders) : undefined

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
                onOpenScan={() => navigate({ page: 'scan' })}
              />
            )}
            {route.page === 'scan' && (
              <MiniScanPage onScanSuccess={handleScanSuccess} />
            )}
            {route.page === 'qr-result' &&
              (activeScanSession?.sessionId === route.sessionId &&
              activeScanSession.qrValue === route.qrValue ? (
                <MiniQrResultPage
                  qrValue={route.qrValue}
                  orders={allOrders}
                  onOpenProcessing={(id) => openSafetyProcessing(id, route.sessionId)}
                />
              ) : (
                <div className="mini-empty">请重新扫码进入</div>
              ))}
            {route.page === 'safety-processing' && processingOrder && processingOrder.type === 'safety' && (
              <MiniSafetyProcessingPage
                order={processingOrder}
                onSaved={goBack}
              />
            )}
            {route.page === 'safety-processing' && (!processingOrder || processingOrder.type !== 'safety') && (
              <div className="mini-empty">工单不存在</div>
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
                counts={counts}
                facilityOrders={facilityOrders}
                orders={allOrders}
                onTypeChange={(type) => navigate({ page: 'list', type })}
                onOpenDetail={openOrderDetail}
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
              <MiniWorkOrderDetail order={detailOrder} readOnly={route.readOnly} />
            )}
            {route.page === 'detail' && !detailOrder && <div className="mini-empty">工单不存在</div>}
            {route.page === 'facility-form' && route.form === 'repairing' && (
              <MiniFacilityRepairingForm
                orderId={route.id}
                onHold={() => {
                  refreshFacility()
                  setRouteStack((stack) => [...stack.slice(0, -1), { page: 'detail', id: route.id }])
                }}
                onNext={() => {
                  refreshFacility()
                  navigate({ page: 'facility-form', form: 'complete', id: route.id })
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
                  setRouteStack((stack) => [...stack.slice(0, -1), { page: 'detail', id: route.id }])
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
                onOpenDetail={openOrderDetail}
              />
            )}
          </div>
          <div className="mini-tabbar">
            <div
              className={`mini-tabbar-item ${route.page === 'home' ? 'active' : ''}`}
              onClick={() => resetToHome()}
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
  onOpenScan,
}: {
  counts: ReturnType<typeof countByType>
  onOpenList: (t: MiniWorkOrderType) => void
  onOpenMy: () => void
  onOpenScan: () => void
}) {
  const workOrderItems: { type: MiniWorkOrderType | 'my' | 'scan'; label: string; count: number }[] = [
    { type: 'scan', label: '扫一扫', count: 0 },
    { type: 'safety', label: '安全检查', count: counts.safety },
    { type: 'construction', label: '施工检查', count: counts.construction },
    { type: 'rectification', label: '整改工单', count: counts.rectification },
    { type: 'newInspection', label: '新增检查', count: counts.newInspection },
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
          {workOrderItems.map((item) => (
            <div
              key={item.label}
              className="mini-wo-item"
              onClick={() => {
                if (item.type === 'my') onOpenMy()
                else if (item.type === 'scan') onOpenScan()
                else onOpenList(item.type)
              }}
            >
              <div className="mini-wo-icon">
                {item.type === 'scan' ? (
                  <ScanHomeIcon size={36} />
                ) : (
                  <WorkOrderIcon type={item.type} size={36} />
                )}
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
  counts,
  facilityOrders,
  orders,
  onTypeChange,
  onOpenDetail,
}: {
  type: MiniWorkOrderType
  counts: ReturnType<typeof countByType>
  facilityOrders: ReturnType<typeof getFacilityOrders>
  orders: MiniWorkOrder[]
  onTypeChange: (t: MiniWorkOrderType) => void
  onOpenDetail: (id: string) => void
}) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [communityFilter, setCommunityFilter] = useState<string[]>([])

  const tabs = getListTabsForType(type)

  const listOrders = useMemo(() => {
    let rows =
      type === 'facility'
        ? getFacilityListOrders(facilityOrders)
        : getWorkOrderListByType(orders, type)
    if (statusFilter) rows = rows.filter((o) => o.status === statusFilter)
    if (communityFilter.length) {
      rows = rows.filter((o) => matchesCommunityFilter(getOrderCommunity(o), communityFilter))
    }
    return rows
  }, [orders, type, statusFilter, communityFilter, facilityOrders])

  const statuses = MINI_LIST_FILTER_STATUS[type]
  const tabCounts: Record<MiniWorkOrderType, number> = {
    safety: counts.safety,
    construction: counts.construction,
    rectification: counts.rectification,
    newInspection: counts.newInspection,
    repair: counts.repair,
    facility: counts.facility,
    maintenance: counts.maintenance,
    inspection: counts.inspection,
  }

  return (
    <div className="mini-work-list-page">
      <div className="mini-tabs mini-tabs-work">
        {tabs.map((t) => (
          <div
            key={t}
            className={`mini-tab ${t === type ? 'active' : ''}`}
            onClick={() => {
              onTypeChange(t)
              setStatusFilter(null)
              setCommunityFilter([])
            }}
          >
            {MINI_TYPE_LABELS[t]}({tabCounts[t]})
          </div>
        ))}
      </div>
      <div className="mini-list-toolbar">
        <div className="mini-filter-row mini-filter-fixed mini-filter-status">
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
        <MiniCommunityFilter appliedCommunities={communityFilter} onApply={setCommunityFilter} />
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
  const [communityFilter, setCommunityFilter] = useState<string[]>([])

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
    if (communityFilter.length) {
      rows = rows.filter((o) => matchesCommunityFilter(getOrderCommunity(o), communityFilter))
    }
    return rows
  }, [orders, tab, typeFilter, communityFilter, myHandled])

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
      <div className="mini-list-toolbar">
        <div className="mini-filter-row mini-filter-scroll mini-filter-status">
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
        <MiniCommunityFilter appliedCommunities={communityFilter} onApply={setCommunityFilter} />
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
  if (isInspectionWorkOrderType(order.type)) {
    return order.extra?.['隐患类别'] ?? MINI_TYPE_LABELS[order.type]
  }
  if (order.type === 'facility') return '设施工单'
  return order.extra?.['问题类型'] ?? MINI_TYPE_LABELS[order.type]
}

function getProblemDesc(order: MiniWorkOrder) {
  if (isInspectionWorkOrderType(order.type)) {
    return order.extra?.['隐患问题'] ?? order.title
  }
  if (order.type === 'facility') return order.extra?.['告警设备'] ?? order.title
  return order.extra?.['问题描述'] ?? order.description ?? order.title
}

function getProblemDetail(order: MiniWorkOrder) {
  if (isInspectionWorkOrderType(order.type)) {
    return order.extra?.['问题描述'] ?? order.description ?? '—'
  }
  return getProblemDesc(order)
}

function getCategoryTagClass(category?: string) {
  if (category === '消防') return 'mini-category-fire'
  if (category === '电气') return 'mini-category-electric'
  if (category === '施工作业') return 'mini-category-construction'
  return ''
}

function OrderCard({ order, onClick }: { order: MiniWorkOrder; onClick: () => void }) {
  const archiveTag = order.archiveOnly ? order.extra?.['操作类型'] : null
  const community = getOrderCommunity(order)
  const isInspection = isInspectionWorkOrderType(order.type)
  const category = order.extra?.['隐患类别']

  if (isInspection) {
    return (
      <div className="mini-order-card mini-order-card-inspection" onClick={onClick}>
        <div className="mini-order-head">
          <span className={`mini-category-tag ${getCategoryTagClass(category)}`}>{category ?? '其他'}</span>
          <span className="mini-order-time">{order.createTime}</span>
          <RightOutlined className="mini-order-chevron" />
        </div>
        <div className="mini-order-field">
          <span className="mini-order-label mini-order-label-strong">隐患问题：</span>
          <span className="mini-order-value">{getProblemDesc(order)}</span>
        </div>
        <div className="mini-order-field">
          <span className="mini-order-label mini-order-label-strong">问题描述：</span>
          <span className="mini-order-value">{getProblemDetail(order)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mini-order-card" onClick={onClick}>
      <div className="mini-order-head">
        <span className="mini-type-tag">{MINI_TYPE_LABELS[order.type]}</span>
        <span className="mini-order-time">{order.createTime}</span>
        <span className="mini-order-status">{archiveTag ?? order.status}</span>
      </div>
      {community !== '—' && (
        <div className="mini-order-field">
          <span className="mini-order-label">小区名称：</span>
          <span className="mini-order-value">{community}</span>
        </div>
      )}
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

function MiniWorkOrderDetail({ order, readOnly }: { order: MiniWorkOrder; readOnly?: boolean }) {
  const community = getOrderCommunity(order)
  const isSafetyReadOnly = readOnly && order.type === 'safety'
  return (
    <>
      {isSafetyReadOnly && (
        <div className="mini-safety-readonly-tip">
          安全检查工单需扫描点位二维码后方可处理。请使用「扫一扫」扫描对应点位二维码。
        </div>
      )}
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
        {community !== '—' && (
          <div className="mini-detail-row">
            <span className="mini-detail-label">小区名称</span>
            <span>{community}</span>
          </div>
        )}
        {isInspectionWorkOrderType(order.type) ? (
          <>
            <div className="mini-detail-row">
              <span className="mini-detail-label">隐患类别</span>
              <span>{getProblemType(order)}</span>
            </div>
            <div className="mini-detail-row">
              <span className="mini-detail-label">隐患问题</span>
              <span>{getProblemDesc(order)}</span>
            </div>
            <div className="mini-detail-row">
              <span className="mini-detail-label">问题描述</span>
              <span>{getProblemDetail(order)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="mini-detail-row">
              <span className="mini-detail-label">问题类型</span>
              <span>{getProblemType(order)}</span>
            </div>
            <div className="mini-detail-row">
              <span className="mini-detail-label">问题描述</span>
              <span>{getProblemDesc(order)}</span>
            </div>
          </>
        )}
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
