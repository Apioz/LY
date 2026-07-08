import type { AlarmListItem } from '../mock/alarmData'
import { alarmListData } from '../mock/alarmData'
import {
  processAlarmAutoResolve,
  type AlarmAutoResolveSignal,
} from './alarmSync'

let alarmList: AlarmListItem[] = alarmListData.map((item) => ({ ...item }))
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function getAlarmList(): AlarmListItem[] {
  return alarmList.map((item) => ({ ...item }))
}

export function subscribeAlarmList(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** 按告警编号更新单条（原型用） */
export function patchAlarmListItem(alarmId: string, patch: Partial<AlarmListItem>) {
  alarmList = alarmList.map((item) => (item.id === alarmId ? { ...item, ...patch } : item))
  notify()
}

/**
 * 接收设备在线/接口解除信号并执行自动解除告警 + 关联工单强制关单
 * （生产环境由设备网关或消息队列回调触发）
 */
export function ingestAlarmAutoResolveSignal(signal: AlarmAutoResolveSignal) {
  const target = alarmList.find((item) => item.id === signal.alarmId)
  if (!target) return false
  const resolved = processAlarmAutoResolve(target, signal)
  if (!resolved) return false
  alarmList = alarmList.map((item) => (item.id === signal.alarmId ? resolved : item))
  notify()
  return true
}

/** 批量处理自动解除信号（原型定时任务） */
export function scanAlarmListAutoResolve(signals: AlarmAutoResolveSignal[]) {
  let count = 0
  signals.forEach((signal) => {
    if (ingestAlarmAutoResolveSignal(signal)) count += 1
  })
  return count
}

/**
 * 原型演示：手动触发待处理告警的自动解除流程
 * @example demoTriggerAutoResolve('AL20260601003', 'timeout') // 设备超时恢复在线
 * @example demoTriggerAutoResolve('AL20260601001', 'external') // 非超时接口解除
 */
export function demoTriggerAutoResolve(
  alarmId: string,
  mode: 'timeout' | 'external',
) {
  return ingestAlarmAutoResolveSignal(
    mode === 'timeout'
      ? { alarmId, deviceBackOnline: true }
      : { alarmId, externalClearReceived: true },
  )
}
