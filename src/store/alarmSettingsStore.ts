import {
  initialAlarmDeviceRules2,
  type AlarmDeviceRule2,
} from '../mock/alarmSettings2Data'

let alarmDeviceRules: AlarmDeviceRule2[] = [...initialAlarmDeviceRules2]
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function getAlarmDeviceRules(): AlarmDeviceRule2[] {
  return alarmDeviceRules
}

export function setAlarmDeviceRules(rules: AlarmDeviceRule2[]) {
  alarmDeviceRules = rules
  notify()
}

export function updateAlarmDeviceRules(updater: (prev: AlarmDeviceRule2[]) => AlarmDeviceRule2[]) {
  alarmDeviceRules = updater(alarmDeviceRules)
  notify()
}

export function subscribeAlarmDeviceRules(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
