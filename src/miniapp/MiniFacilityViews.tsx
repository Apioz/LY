import { useEffect, useMemo, useRef, useState } from 'react'
import {
  acceptFacilityOrder,
  cancelAcceptedFacilityOrder,
  dispatchFacilityOrder,
  getFacilityOrderById,
  holdOnSiteFacilityRepair,
  proceedFacilityRepairNextStep,
  revokeFacilityOrder,
  startFacilityRepair,
  saveFacilityRepairDraft,
  submitDamageFacilityOrder,
  submitFalseAlarmFacilityOrder,
  submitRepairFacilityOrder,
  urgeFacilityOrder,
  type IncidentJudgment,
} from '../store/alarmSync'
import { MINI_CURRENT_USER } from '../store/miniProgramUser'
import {
  addHandledRecord,
  FACILITY_WORK_GROUPS,
  FACILITY_WORKERS,
  facilityToMiniOrder,
  type MiniWorkOrder,
} from '../mock/miniProgramData'
import { EmptyDocIcon } from './MiniIcons'

export type FacilityFormType = 'dispatch' | 'urge' | 'revoke' | 'cancel' | 'repairing' | 'complete'

const JUDGMENT_OPTIONS: IncidentJudgment[] = ['误报', '维修', '损坏']

const STATUS_BADGE_CLASS: Record<string, string> = {
  待派单: 'mini-status-pending',
  待接单: 'mini-status-wait',
  待完成: 'mini-status-processing',
  已完成: 'mini-status-done',
  已取消: 'mini-status-cancel',
  损坏: 'mini-status-damage',
}

type PhotoItem = { id: string; name: string; preview: string }

function FacilityFieldRows({ order }: { order: MiniWorkOrder }) {
  const extra = order.extra ?? {}
  const rows: { label: string; value: string }[] = [
    { label: '工单编号', value: extra['工单编号'] ?? order.id },
    { label: '告警设备', value: extra['告警设备'] ?? order.title },
    { label: '安装位置', value: extra['安装位置'] ?? '—' },
    { label: '告警等级', value: extra['告警等级'] ?? '—' },
    { label: '告警描述', value: extra['告警描述'] ?? '—' },
    { label: '告警时间', value: extra['告警时间'] ?? order.createTime },
    { label: '发起人', value: order.initiator },
    { label: '接单人', value: order.receiver === '-' ? '—' : order.receiver },
  ]
  if (extra['派单工作组']) rows.push({ label: '派单工作组', value: extra['派单工作组'] })
  if (extra['派单说明']) rows.push({ label: '派单说明', value: extra['派单说明'] })
  if (extra['到达现场时间']) rows.push({ label: '到达现场时间', value: extra['到达现场时间'] })
  if (extra['故障原因']) rows.push({ label: '故障原因', value: extra['故障原因'] })
  if (extra['误报说明']) rows.push({ label: '误报说明', value: extra['误报说明'] })
  if (extra['维修描述']) rows.push({ label: '维修描述', value: extra['维修描述'] })
  if (extra['损坏描述']) rows.push({ label: '损坏描述', value: extra['损坏描述'] })
  if (extra['时效状态']) {
    rows.push({
      label: '时效状态',
      value: extra['时效状态'],
    })
  }

  return (
    <>
      {rows.map((r) => (
        <div key={r.label} className="mini-detail-kv">
          <span className="mini-detail-kv-label">{r.label}</span>
          <span
            className="mini-detail-kv-value"
            style={
              r.label === '时效状态'
                ? { color: extra['时效颜色'] ?? '#52c41a', fontWeight: 600 }
                : undefined
            }
          >
            {r.value}
          </span>
        </div>
      ))}
    </>
  )
}

function FlowImageGrid({ images }: { images: string[] }) {
  if (!images.length) return null
  return (
    <div className="mini-flow-images">
      {images.map((src, i) => (
        <div key={i} className="mini-flow-image-item">
          <img src={src} alt={`维修图片${i + 1}`} />
        </div>
      ))}
    </div>
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
            {f.fields?.length ? (
              <div className="mini-timeline-fields">
                {f.fields.map((field) => (
                  <div key={field.label} className="mini-timeline-field">
                    <span className="mini-timeline-field-label">{field.label}</span>
                    <span className="mini-timeline-field-value">{field.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              f.detail && <div className="mini-timeline-detail">{f.detail}</div>
            )}
            {f.images && f.images.length > 0 && <FlowImageGrid images={f.images} />}
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
    if (s === '待完成' && isMine && order.repairStarted) {
      return [
        {
          key: 'repairing',
          label: '继续处理',
          form: 'repairing' as const,
          primary: true,
        },
      ]
    }
    if (s === '待完成' && isMine) {
      return [
        { key: 'cancel', label: '取消接单', form: 'cancel' as const },
        { key: 'start', label: '开始维修', primary: true },
      ]
    }
    return []
  }, [order.status, isMine, order.repairStarted])

  const handleAccept = () => {
    acceptFacilityOrder(order.id, MINI_CURRENT_USER)
    onRefresh()
  }

  const handleStartRepair = () => {
    startFacilityRepair(order.id, MINI_CURRENT_USER)
    onRefresh()
    onOpenForm('repairing')
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
                else if (a.key === 'start') handleStartRepair()
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

function PhotoUpload({
  label,
  photos,
  onChange,
  required,
  hint,
}: {
  label: string
  photos: PhotoItem[]
  onChange: (photos: PhotoItem[]) => void
  required?: boolean
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return
    const next = [...photos]
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      next.push({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        preview: URL.createObjectURL(file),
      })
    })
    onChange(next.slice(0, 9))
  }

  const removePhoto = (id: string) => {
    const target = photos.find((p) => p.id === id)
    if (target) URL.revokeObjectURL(target.preview)
    onChange(photos.filter((p) => p.id !== id))
  }

  return (
    <div className="mini-photo-upload">
      <div className={`mini-form-label ${required ? 'required' : ''}`}>{label}</div>
      <div className="mini-photo-grid">
        {photos.map((p) => (
          <div key={p.id} className="mini-photo-item">
            <img src={p.preview} alt={p.name} />
            <button type="button" className="mini-photo-remove" onClick={() => removePhoto(p.id)}>
              ×
            </button>
          </div>
        ))}
        {photos.length < 9 && (
          <button type="button" className="mini-photo-add" onClick={() => inputRef.current?.click()}>
            <span className="mini-photo-add-icon">+</span>
            <span>上传图片</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="mini-photo-input"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      {hint && <div className="mini-form-hint">{hint}</div>}
    </div>
  )
}

export function MiniFacilityRepairingForm({
  orderId,
  onHold,
  onNext,
  onCancel,
}: {
  orderId: string
  onHold: () => void
  onNext: () => void
  onCancel: () => void
}) {
  const facility = getFacilityOrderById(orderId)
  const [arrivalTime, setArrivalTime] = useState('')
  const [faultReason, setFaultReason] = useState('')

  useEffect(() => {
    const info = facility?.onSiteInfo
    if (!info) return
    setArrivalTime(info.arrivalTime)
    setFaultReason(info.faultReason ?? '')
  }, [facility?.onSiteInfo])

  const handleHold = () => {
    if (!facility) return
    holdOnSiteFacilityRepair(orderId, MINI_CURRENT_USER, {
      arrivalTime: arrivalTime.trim(),
      faultReason: faultReason.trim() || undefined,
    })
    alert('已暂存，工单状态为待完成')
    onHold()
  }

  const handleNext = () => {
    if (!facility) return
    if (!arrivalTime.trim()) return alert('请选择到达现场时间')
    proceedFacilityRepairNextStep(orderId, MINI_CURRENT_USER, {
      arrivalTime: arrivalTime.trim(),
      faultReason: faultReason.trim() || undefined,
    })
    onNext()
  }

  return (
    <div className="mini-form-page">
      <div className="mini-detail-card">
        <div className="mini-detail-card-head">
          <span className="mini-detail-card-bar" />
          <span className="mini-detail-card-title">维修中</span>
        </div>
      </div>
      <div className="mini-detail-card mini-form-body">
        <div className="mini-form-label required">到达现场时间</div>
        <input
          className="mini-form-input"
          type="datetime-local"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
        />
        <div className="mini-form-label">故障原因</div>
        <textarea
          className="mini-form-textarea"
          placeholder="请填写故障原因（选填）"
          maxLength={500}
          value={faultReason}
          onChange={(e) => setFaultReason(e.target.value)}
        />
        <div className="mini-form-count">{faultReason.length}/500</div>
      </div>
      <div className="mini-detail-footer mini-detail-footer-triple">
        <button type="button" className="mini-footer-btn" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="mini-footer-btn" onClick={handleHold}>
          暂存
        </button>
        <button type="button" className="mini-footer-btn primary" onClick={handleNext}>
          下一步
        </button>
      </div>
    </div>
  )
}

function draftToPhotos(draft?: { photos: string[]; photoNames: string[] }): PhotoItem[] {
  if (!draft?.photos.length) return []
  return draft.photos.map((preview, i) => ({
    id: `draft-${i}`,
    name: draft.photoNames[i] ?? `图片${i + 1}`,
    preview,
  }))
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
  const [faultReason, setFaultReason] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [judgment, setJudgment] = useState<IncidentJudgment | ''>('')
  const [photos, setPhotos] = useState<PhotoItem[]>([])

  useEffect(() => {
    if (form !== 'complete' || !facility) return
    const draft = facility.repairDraft
    const onSite = facility.onSiteInfo
    if (draft) {
      setArrivalTime(draft.arrivalTime)
      setFaultReason(draft.faultReason ?? onSite?.faultReason ?? '')
      setJudgment(draft.judgment || '维修')
      setNote(draft.note)
      setPhotos(draftToPhotos(draft))
      return
    }
    if (onSite) {
      setArrivalTime(onSite.arrivalTime)
      setFaultReason(onSite.faultReason ?? '')
      setJudgment('维修')
    }
  }, [facility, form])

  const titleMap: Record<FacilityFormType, string> = {
    dispatch: '派单',
    urge: '催单',
    revoke: '撤销',
    cancel: '取消接单',
    repairing: '维修中',
    complete: '完成',
  }

  const sectionMap: Record<FacilityFormType, string> = {
    dispatch: '派单处理',
    urge: '催单提醒',
    revoke: '撤销审批',
    cancel: '取消接单',
    repairing: '维修中',
    complete: '完成工单',
  }

  const workers = FACILITY_WORKERS[group] ?? []
  const showJudgment = form === 'complete' && !!arrivalTime.trim()
  const fromRepairStep = !!facility?.onSiteInfo?.arrivalTime || facility?.repairDraft?.judgment === '维修'

  const noteConfig = useMemo(() => {
    if (judgment === '误报') return { label: '误报说明', required: true, placeholder: '请填写误报说明' }
    if (judgment === '维修') return { label: '维修描述', required: true, placeholder: '请填写维修描述' }
    if (judgment === '损坏') return { label: '损坏描述', required: true, placeholder: '请填写损坏描述' }
    return null
  }, [judgment])

  const photoConfig = useMemo(() => {
    if (judgment === '误报') return { label: '误报图片', required: true, hint: '必填，最多上传 9 张' }
    if (judgment === '维修') return { label: '维修图片', required: false, hint: '选填，最多上传 9 张' }
    if (judgment === '损坏') return { label: '损坏图片', required: true, hint: '必填，最多上传 9 张' }
    return null
  }, [judgment])

  const buildPayload = () => ({
    arrivalTime: arrivalTime.trim(),
    judgment: (judgment || '维修') as IncidentJudgment,
    note: note.trim(),
    faultReason: faultReason.trim() || undefined,
    photos: photos.map((p) => p.preview),
    photoNames: photos.map((p) => p.name),
  })

  const validateBase = () => {
    if (!arrivalTime.trim()) {
      alert('请选择到达现场时间')
      return false
    }
    if (!judgment) {
      alert('请选择告警事故判断')
      return false
    }
    return true
  }

  const validateSubmit = () => {
    if (!validateBase()) return false
    if (judgment === '误报') {
      if (!note.trim()) return alert('请填写误报说明'), false
      if (!photos.length) return alert('请上传误报图片'), false
    }
    if (judgment === '维修') {
      if (!note.trim()) return alert('请填写维修描述'), false
    }
    if (judgment === '损坏') {
      if (!note.trim()) return alert('请填写损坏描述'), false
      if (!photos.length) return alert('请上传损坏图片'), false
    }
    return true
  }

  const handleSaveDraft = () => {
    if (!facility || !validateBase()) return
    saveFacilityRepairDraft(orderId, MINI_CURRENT_USER, buildPayload())
    alert('已暂存，可稍后继续填写')
    onDone()
  }

  const handleSubmit = () => {
    if (!facility || !validateSubmit()) return
    const op = MINI_CURRENT_USER
    const payload = buildPayload()

    if (judgment === '误报') {
      submitFalseAlarmFacilityOrder(orderId, op, payload)
    } else if (judgment === '维修') {
      submitRepairFacilityOrder(orderId, op, payload)
    } else if (judgment === '损坏') {
      submitDamageFacilityOrder(orderId, op, payload)
      addHandledRecord({
        orderId,
        type: 'facility',
        action: '提交损坏',
        title: facility.alarmDevices.join('、') + ' - ' + facility.desc,
        time: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: '已提交损坏',
        detail: payload.note,
        operator: op,
      })
    }
    onDone()
  }

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
    } else {
      return
    }
    onDone()
  }

  const footerMode = useMemo(() => {
    if (form !== 'complete' || !showJudgment) return 'default'
    if (judgment === '维修') return 'repair'
    if (judgment === '误报' || judgment === '损坏') return 'submit'
    return 'default'
  }, [form, showJudgment, judgment])

  const reviewOrder = facility ? facilityToMiniOrder(facility) : null
  const reviewStatusClass = reviewOrder
    ? (STATUS_BADGE_CLASS[reviewOrder.status] ?? 'mini-status-wait')
    : 'mini-status-wait'

  return (
    <div className="mini-form-page">
      <div className="mini-detail-card">
        <div className="mini-detail-card-head">
          <span className="mini-detail-card-bar" />
          <span className="mini-detail-card-title">{sectionMap[form]}</span>
        </div>
      </div>
      {form === 'complete' && reviewOrder && (
        <div className="mini-detail-card">
          <div className="mini-detail-card-head">
            <span className="mini-detail-card-bar" />
            <span className="mini-detail-card-title">工单信息</span>
            <span className={`mini-status-badge ${reviewStatusClass}`}>{reviewOrder.status}</span>
          </div>
          <FacilityFieldRows order={reviewOrder} />
        </div>
      )}
      <div className="mini-detail-card mini-form-body">
        {form === 'complete' && <div className="mini-detail-section-title">维修填报</div>}
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
        {(form === 'urge' || form === 'revoke' || form === 'cancel') && (
          <>
            <div className="mini-form-label required">
              {form === 'urge' ? '催单说明' : form === 'revoke' ? '撤销说明' : '取消说明'}
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
              readOnly={fromRepairStep && !!facility?.onSiteInfo?.arrivalTime}
            />
            {showJudgment && (
              <>
                <div className="mini-form-label required">告警事故判断</div>
                <div className="mini-judgment-row">
                  {JUDGMENT_OPTIONS.map((j) => (
                    <button
                      key={j}
                      type="button"
                      className={`mini-judgment-chip ${judgment === j ? 'active' : ''}`}
                      onClick={() => setJudgment(j)}
                    >
                      {j}
                    </button>
                  ))}
                </div>
                {noteConfig && (
                  <>
                    <div className={`mini-form-label ${noteConfig.required ? 'required' : ''}`}>{noteConfig.label}</div>
                    <textarea
                      className="mini-form-textarea"
                      placeholder={noteConfig.placeholder}
                      maxLength={500}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="mini-form-count">{note.length}/500</div>
                  </>
                )}
                {photoConfig && judgment && (
                  <PhotoUpload
                    label={photoConfig.label}
                    photos={photos}
                    onChange={setPhotos}
                    required={photoConfig.required}
                    hint={photoConfig.hint}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
      <div
        className={`mini-detail-footer ${
          footerMode === 'repair' ? 'mini-detail-footer-triple' : footerMode === 'submit' ? 'mini-detail-footer-double' : ''
        }`}
      >
        <button type="button" className="mini-footer-btn" onClick={onCancel}>
          取消
        </button>
        {form === 'complete' && footerMode === 'repair' && (
          <button type="button" className="mini-footer-btn" onClick={handleSaveDraft}>
            暂存
          </button>
        )}
        {form === 'complete' && (footerMode === 'submit' || footerMode === 'repair') && (
          <button type="button" className="mini-footer-btn primary" onClick={handleSubmit}>
            提交
          </button>
        )}
        {form !== 'complete' && (
          <button type="button" className="mini-footer-btn primary" onClick={handleConfirm}>
            确定
          </button>
        )}
      </div>
    </div>
  )
}
