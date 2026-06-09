import { useEffect, useState } from 'react'
import { Modal, Checkbox, Divider, Typography, Alert, message } from 'antd'
import {
  ALARM_FACILITY_SYNC_DEVICE_CATEGORIES,
  ALARM_LEVELS,
  LEVEL_COLORS,
} from './constants'
import {
  getAlarmFacilitySyncSettings,
  updateAlarmFacilitySyncSettings,
  type AlarmFacilitySyncSettings,
} from '../../store/alarmSync'

const { Text } = Typography

interface AlarmFacilitySyncSettingsProps {
  open: boolean
  onClose: () => void
  onSaved?: (settings: AlarmFacilitySyncSettings) => void
}

export default function AlarmFacilitySyncSettingsModal({
  open,
  onClose,
  onSaved,
}: AlarmFacilitySyncSettingsProps) {
  const [levels, setLevels] = useState<string[]>([])
  const [devices, setDevices] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    const current = getAlarmFacilitySyncSettings()
    setLevels([...current.levels])
    setDevices([...current.devices])
  }, [open])

  const handleSave = () => {
    if (!levels.length) {
      message.warning('请至少选择一个告警等级')
      return
    }
    if (!devices.length) {
      message.warning('请至少选择一个告警设备')
      return
    }
    const next: AlarmFacilitySyncSettings = {
      levels: levels as AlarmFacilitySyncSettings['levels'],
      devices: [...devices],
    }
    updateAlarmFacilitySyncSettings(next)
    message.success('告警信息设置已保存')
    onSaved?.(next)
    onClose()
  }

  const toggleCategoryDevices = (categoryDevices: readonly string[], checked: boolean) => {
    setDevices((prev) => {
      const set = new Set(prev)
      categoryDevices.forEach((d) => (checked ? set.add(d) : set.delete(d)))
      return [...set]
    })
  }

  const isCategoryAllChecked = (categoryDevices: readonly string[]) =>
    categoryDevices.every((d) => devices.includes(d))

  const isCategoryIndeterminate = (categoryDevices: readonly string[]) => {
    const hit = categoryDevices.filter((d) => devices.includes(d)).length
    return hit > 0 && hit < categoryDevices.length
  }

  return (
    <Modal
      title="告警信息设置"
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      okText="保存"
      cancelText="取消"
      width={640}
      destroyOnClose
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="告警列表展示全部告警；仅符合以下等级与设备配置的「待处理」告警会自动生成设施工单。"
      />
      <div style={{ marginBottom: 8, fontWeight: 600 }}>可生成设施工单的告警等级</div>
      <Checkbox.Group
        value={levels}
        onChange={(v) => setLevels(v as string[])}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
      >
        {ALARM_LEVELS.map((level) => (
          <Checkbox key={level} value={level}>
            <span style={{ color: LEVEL_COLORS[level] }}>{level}</span>
          </Checkbox>
        ))}
      </Checkbox.Group>

      <Divider style={{ margin: '16px 0' }} />

      <div style={{ marginBottom: 8, fontWeight: 600 }}>可生成设施工单的告警设备</div>
      {Object.entries(ALARM_FACILITY_SYNC_DEVICE_CATEGORIES).map(([category, categoryDevices]) => (
        <div key={category} style={{ marginBottom: 12 }}>
          <Checkbox
            indeterminate={isCategoryIndeterminate(categoryDevices)}
            checked={isCategoryAllChecked(categoryDevices)}
            onChange={(e) => toggleCategoryDevices(categoryDevices, e.target.checked)}
          >
            <Text strong>{category}</Text>
          </Checkbox>
          <div style={{ marginLeft: 24, marginTop: 6 }}>
            <Checkbox.Group
              value={devices}
              onChange={(v) => setDevices(v as string[])}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
            >
              {categoryDevices.map((device) => (
                <Checkbox key={device} value={device}>
                  {device}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </div>
        </div>
      ))}
    </Modal>
  )
}
