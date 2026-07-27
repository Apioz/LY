import { useMemo, useState } from 'react'
import { Button, Input, message } from 'antd'
import { ScanOutlined } from '@ant-design/icons'
import {
  findPointByQrValue,
  getInspectionPointQrValue,
  scannableInspectionPoints,
} from '../constants/inspectionPointQr'
import {
  getSafetyOrdersByPointId,
  startSafetyOrderProcessing,
  submitSafetyOrderProcessing,
  MINI_TYPE_LABELS,
  type MiniWorkOrder,
} from '../mock/miniProgramData'
import { MINI_CURRENT_USER } from '../store/miniProgramUser'

export function createScanSessionId() {
  return `scan-${Date.now()}`
}

function getProblemDesc(order: MiniWorkOrder) {
  return order.extra?.['隐患问题'] ?? order.title
}

function getProblemDetail(order: MiniWorkOrder) {
  return order.extra?.['问题描述'] ?? order.description ?? '—'
}

function getCategoryTagClass(category?: string) {
  if (category === '消防') return 'mini-category-fire'
  if (category === '电气') return 'mini-category-electric'
  if (category === '施工作业') return 'mini-category-construction'
  return ''
}

function SafetyOrderCard({
  order,
  onClick,
}: {
  order: MiniWorkOrder
  onClick: () => void
}) {
  const category = order.extra?.['隐患类别']
  return (
    <div className="mini-order-card mini-order-card-inspection" onClick={onClick}>
      <div className="mini-order-head">
        <span className={`mini-category-tag ${getCategoryTagClass(category)}`}>{category ?? '其他'}</span>
        <span className="mini-order-time">{order.createTime}</span>
        <span className="mini-order-status">{order.status}</span>
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

/** 模拟扫一扫页面（原型可选择点位二维码） */
export function MiniScanPage({ onScanSuccess }: { onScanSuccess: (qrValue: string, sessionId: string) => void }) {
  const [selectedQr, setSelectedQr] = useState(scannableInspectionPoints[0]?.qrValue ?? '')

  const handleScan = () => {
    if (!selectedQr || !findPointByQrValue(selectedQr)) {
      message.warning('请选择有效的点位二维码')
      return
    }
    onScanSuccess(selectedQr, createScanSessionId())
  }

  return (
    <div className="mini-scan-page">
      <div className="mini-scan-frame">
        <div className="mini-scan-corner tl" />
        <div className="mini-scan-corner tr" />
        <div className="mini-scan-corner bl" />
        <div className="mini-scan-corner br" />
        <ScanOutlined className="mini-scan-icon" />
        <p className="mini-scan-tip">将二维码放入框内，即可自动扫描</p>
      </div>
      <div className="mini-scan-demo-panel">
        <div className="mini-scan-demo-title">原型演示：选择点位二维码</div>
        <select
          className="mini-scan-select"
          value={selectedQr}
          onChange={(e) => setSelectedQr(e.target.value)}
        >
          {scannableInspectionPoints.map((p) => (
            <option key={p.id} value={p.qrValue}>
              {p.plot} · {p.name}
            </option>
          ))}
        </select>
        <Button type="primary" block icon={<ScanOutlined />} onClick={handleScan}>
          模拟扫描
        </Button>
      </div>
    </div>
  )
}

/** 扫码结果页：展示该点位下全部安全检查工单 */
export function MiniQrResultPage({
  qrValue,
  orders,
  onOpenProcessing,
}: {
  qrValue: string
  orders: MiniWorkOrder[]
  onOpenProcessing: (orderId: string) => void
}) {
  const point = findPointByQrValue(qrValue)
  const list = useMemo(() => {
    if (!point) return []
    return orders.filter(
      (o) =>
        o.type === 'safety' &&
        o.extra?.['点位编号'] === point.id &&
        o.status !== '已完成' &&
        o.status !== '已取消',
    )
  }, [orders, point])

  if (!point) {
    return <div className="mini-empty">无效的二维码</div>
  }

  return (
    <div className="mini-qr-result-page">
      <div className="mini-qr-result-head">
        <div className="mini-qr-result-title">{point.name}</div>
        <div className="mini-qr-result-meta">{point.plot}</div>
        <div className="mini-qr-result-meta">{point.location}</div>
        <div className="mini-qr-result-meta">点位编号：{point.id}</div>
      </div>
      <div className="mini-qr-result-section-title">关联安全检查工单（{list.length}）</div>
      <div className="mini-order-list">
        {list.length === 0 ? (
          <div className="mini-empty">该点位暂无待处理的安全检查工单</div>
        ) : (
          list.map((order) => (
            <SafetyOrderCard
              key={order.id}
              order={order}
              onClick={() => {
                if (order.status === '待处理') {
                  startSafetyOrderProcessing(order.id)
                }
                onOpenProcessing(order.id)
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

/** 安全检查工单处理中页面 */
export function MiniSafetyProcessingPage({
  order,
  onSaved,
}: {
  order: MiniWorkOrder
  onSaved: () => void
}) {
  const [note, setNote] = useState(order.extra?.['处理说明'] ?? '')

  const handleSave = (complete: boolean) => {
    if (!note.trim()) {
      message.warning('请填写处理说明')
      return
    }
    submitSafetyOrderProcessing(order.id, note.trim(), complete)
    message.success(complete ? '已提交处理结果' : '已暂存')
    onSaved()
  }

  return (
    <div className="mini-safety-processing-page">
      <div className="mini-detail-block">
        <div className="mini-detail-title">处理中 · {MINI_TYPE_LABELS.safety}</div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">工单编号</span>
          <span>{order.id}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">隐患问题</span>
          <span>{getProblemDesc(order)}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">问题描述</span>
          <span>{getProblemDetail(order)}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">空间位置</span>
          <span>{order.extra?.['空间位置'] ?? order.location ?? '—'}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">处理人</span>
          <span>{MINI_CURRENT_USER}</span>
        </div>
        <div className="mini-detail-row">
          <span className="mini-detail-label">当前状态</span>
          <span style={{ color: '#1890ff', fontWeight: 600 }}>{order.status}</span>
        </div>
      </div>
      <div className="mini-detail-block">
        <div className="mini-detail-title">处理说明</div>
        <Input.TextArea
          rows={5}
          placeholder="请输入现场处理情况"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="mini-safety-processing-actions">
        <Button block onClick={() => handleSave(false)}>
          暂存
        </Button>
        <Button type="primary" block onClick={() => handleSave(true)}>
          提交完成
        </Button>
      </div>
    </div>
  )
}

export function getSafetyOrdersForQr(qrValue: string): MiniWorkOrder[] {
  const point = findPointByQrValue(qrValue)
  if (!point) return []
  return getSafetyOrdersByPointId(point.id)
}

export { getInspectionPointQrValue }
