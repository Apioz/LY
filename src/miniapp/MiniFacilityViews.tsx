import { useMemo, useState } from 'react'
import {
  acceptFacilityOrder,
  cancelAcceptedFacilityOrder,
  completeFacilityOrder,
  damageFacilityOrder,
  dispatchFacilityOrder,
  getFacilityOrderById,
  revokeFacilityOrder,
  urgeFacilityOrder,
} from '../store/alarmSync'
import { MINI_CURRENT_USER } from '../store/miniProgramUser'
import {
  addHandledRecord,
  FACILITY_WORK_GROUPS,
  FACILITY_WORKERS,
  type MiniWorkOrder,
} from '../mock/miniProgramData'
import { EmptyDocIcon } from './MiniIcons'

export type FacilityFormType = 'dispatch' | 'urge' | 'revoke' | 'cancel' | 'complete' | 'damage'

const STATUS_BADGE_CLASS: Record<string, string> = {
  待派单: 'mini-status-pending',
  待接单: 'mini-status-wait',
  处理中: 'mini-status-processing',
  已完成: 'mini-status-done',
  已取消: 'mini-status-cancel',
  损坏: 'mini-status-damage',
}

function FacilityFieldRows({ order }: { order: MiniWorkOrder }) {
  const extra = order.extra ?? {}
  const rows: { label: string; value: string }[] = [
    { label: '工单编号', value: extra['工单编号'] ?? order.id },
    { label: '告警设备', value: extra['告警设备'] ?? order.title },
    { label: '安装位置', value: extra['安装位置'] ?? '—' },
    { label: '告警等级', value: extra['告警等级'] ?? '—' },
    { label: '告警描述', value: extra['告警描述'] ?? '—' },
    { label: '告警时间', value: extra['告警时间'] ?? order.createTime },
    { label: '来源', value: extra['来源'] ?? '—' },
    { label: '发起人', value: order.initiator },
    { label: '接单人', value: order.receiver === '-' ? '—' : order.receiver },
    { label: '中台状态', value: extra['中台状态'] ?? '—' },
  ]
  if (extra['派单工作组']) rows.push({ label: '派单工作组', value: extra['派单工作组'] })
  if (extra['派单说明']) rows.push({ label: '派单说明', value: extra['派单说明'] })
  if (extra['损坏说明']) rows.push({ label: '损坏说明', value: extra['损坏说明'] })

  return (
    <>
      {rows.map((r) => (
        <div key={r.label} className="mini-detail-kv">
          <span className="mini-detail-kv-label">{r.label}</span>
          <span className="mini-detail-kv-value">{r.value}</span>
        </div>
      ))}
    </>
  )
}

function FlowTimeline({ records }: { records: MiniWorkOrder['flowRecords'] }) {
  if (!records.length) {
    return (
      <div className="mini-flow-empty">
        <div className="mini-flow-empty-icon">
          <EmptyDocIcon size={44} />
        </div>
        <div>暂无流程信息</div>
      </div>
    )
  }
  return (
    <div className="mini-timeline">
      {records.map((f, i) => (
        <div key={i} className="mini-timeline-item">
          <div className="mini-timeline-dot" />
          <div className="mini-timeline-body">
            <div className="mini-timeline-head">
              <span>
                {f.operator} {f.action}
              </span>
              <span className="mini-timeline-time">{f.time}</span>
            </div>
            {f.detail && <div className="mini-timeline-detail">{f.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function MiniFacilityDetail({
  order,
  onOpenForm,
  onRefresh,
}: {
  order: MiniWorkOrder
  onOpenForm: (form: FacilityFormType) => void
  onRefresh: () => void
}) {
  const statusClass = STATUS_BADGE_CLASS[order.status] ?? 'mini-status-wait'
  const isMine = order.receiver === MINI_CURRENT_USER

  const actions = useMemo(() => {
    const s = order.status
    if (s === '待派单') {
      return [
        { key: 'revoke', label: '撤销', form: 'revoke' as const },
        { key: 'urge', label: '催单', form: 'urge' as const },
        { key: 'dispatch', label: '派单', form: 'dispatch' as const, primary: true },
      ]
    }
    if (s === '待接单' || s === '损坏') {
      return [{ key: 'accept', label: '接单', primary: true }]
    }
    if (s === '处理中' && isMine) {
      return [
        { key: 'cancel', label: '取消接单', form: 'cancel' as const },
        { key: 'damage', label: '提交损坏', form: 'damage' as const },
        { key: 'complete', label: '提交完成', form: 'complete' as const, primary: true },
      ]
    }
    return []
  }, [order.status, isMine])

  const handleAccept = () => {
    acceptFacilityOrder(order.id, MINI_CURRENT_USER)
    onRefresh()
  }

  return (
    <div className="mini-facility-detail">
      <div className="mini-detail-card">
        <div className="mini-detail-card-head">
          <span className="mini-detail-card-bar" />
          <span className="mini-detail-card-title">申请详情</span>
          <span className={`mini-status-badge ${statusClass}`}>{order.status}</span>
        </div>
        <div className="mini-detail-section-title">基础信息</div>
        <FacilityFieldRows order={order} />
      </div>
      <div className="mini-detail-card">
        <div className="mini-detail-section-title">流程记录</div>
        <FlowTimeline records={order.flowRecords} />
      </div>
      {actions.length > 0 && (
        <div className="mini-detail-footer">
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={a.primary ? 'mini-footer-btn primary' : 'mini-footer-btn'}
              onClick={() => {
                if (a.key === 'accept') handleAccept()
                else if ('form' in a && a.form) onOpenForm(a.form)
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function MiniFacilityForm({
  form,
  orderId,
  onDone,
  onCancel,
}: {
  form: FacilityFormType
  orderId: string
  onDone: () => void
  onCancel: () => void
}) {
  const facility = getFacilityOrderById(orderId)
  const [group, setGroup] = useState<string>(FACILITY_WORK_GROUPS[0])
  const [worker, setWorker] = useState<string>(FACILITY_WORKERS[FACILITY_WORK_GROUPS[0]][0])
  const [note, setNote] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')

  const titleMap: Record<FacilityFormType, string> = {
    dispatch: '派单',
    urge: '催单',
    revoke: '撤销',
    cancel: '取消接单',
    complete: '完成',
    damage: '提交损坏',
  }

  const sectionMap: Record<FacilityFormType, string> = {
    dispatch: '派单处理',
    urge: '催单提醒',
    revoke: '撤销审批',
    cancel: '取消接单',
    complete: '完成工单',
    damage: '损坏说明',
  }

  const workers = FACILITY_WORKERS[group] ?? []

  const handleConfirm = () => {
    if (!facility) return
    const op = MINI_CURRENT_USER

    if (form === 'dispatch') {
      if (!group || !worker) return alert('请选择工作组和处理人员')
      dispatchFacilityOrder(orderId, group, worker, note, op)
    } else if (form === 'urge') {
      if (!note.trim()) return alert('请输入催单说明')
      urgeFacilityOrder(orderId, note, op)
    } else if (form === 'revoke') {
      if (!note.trim()) return alert('请输入撤销说明')
      revokeFacilityOrder(orderId, note, op)
    } else if (form === 'cancel') {
      if (!note.trim()) return alert('请输入取消说明')
      cancelAcceptedFacilityOrder(orderId, op, note)
      addHandledRecord({
        orderId,
        type: 'facility',
        action: '取消接单',
        title: facility.alarmDevices.join('、') + ' - ' + facility.desc,
        time: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: '已取消接单',
        detail: note.trim(),
        operator: op,
      })
    } else if (form === 'complete') {
      if (!arrivalTime.trim()) return alert('请选择到达现场时间')
      completeFacilityOrder(orderId, op, { arrivalTime: arrivalTime.trim(), note })
    } else if (form === 'damage') {
      if (!note.trim()) return alert('请输入损坏说明')
      damageFacilityOrder(orderId, op, note)
      addHandledRecord({
        orderId,
        type: 'facility',
        action: '提交损坏',
        title: facility.alarmDevices.join('、') + ' - ' + facility.desc,
        time: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: '已提交损坏',
        detail: note.trim(),
        operator: op,
      })
    }
    onDone()
  }

  return (
    <div className="mini-form-page">
      <div className="mini-detail-card">
        <div className="mini-detail-card-head">
          <span className="mini-detail-card-bar" />
          <span className="mini-detail-card-title">{sectionMap[form]}</span>
        </div>
      </div>
      <div className="mini-detail-card mini-form-body">
        {form === 'dispatch' && (
          <>
            <div className="mini-form-label required">处理人员</div>
            <div className="mini-form-picker-row">
              <select
                className="mini-form-select"
                value={group}
                onChange={(e) => {
                  setGroup(e.target.value)
                  setWorker(FACILITY_WORKERS[e.target.value]?.[0] ?? '')
                }}
              >
                {FACILITY_WORK_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select className="mini-form-select" value={worker} onChange={(e) => setWorker(e.target.value)}>
                {workers.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div className="mini-form-label">派单说明</div>
            <textarea
              className="mini-form-textarea"
              placeholder="请输入派单说明（选填）"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mini-form-count">{note.length}/500</div>
          </>
        )}
        {(form === 'urge' || form === 'revoke' || form === 'cancel' || form === 'damage') && (
          <>
            <div className="mini-form-label required">
              {form === 'urge' ? '催单说明' : form === 'revoke' ? '撤销说明' : form === 'cancel' ? '取消说明' : '损坏说明'}
            </div>
            <textarea
              className="mini-form-textarea"
              placeholder={`请输入${titleMap[form]}说明`}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mini-form-count">{note.length}/500</div>
          </>
        )}
        {form === 'complete' && (
          <>
            <div className="mini-form-label required">到达现场时间</div>
            <input
              className="mini-form-input"
              type="datetime-local"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
            />
            <div className="mini-form-label">维修描述</div>
            <textarea
              className="mini-form-textarea"
              placeholder="维修描述"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mini-form-count">{note.length}/500</div>
          </>
        )}
      </div>
      <div className="mini-detail-footer">
        <button type="button" className="mini-footer-btn" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="mini-footer-btn primary" onClick={handleConfirm}>
          确定
        </button>
      </div>
    </div>
  )
}
