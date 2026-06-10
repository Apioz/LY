import { useEffect } from 'react'
import { Modal, Form, InputNumber, message, Alert } from 'antd'
import {
  getFacilityWorkOrderSettings,
  updateFacilityWorkOrderSettings,
} from '../store/alarmSync'

interface FacilityWorkOrderSettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function FacilityWorkOrderSettingsModal({
  open,
  onClose,
}: FacilityWorkOrderSettingsModalProps) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      form.setFieldsValue(getFacilityWorkOrderSettings())
    }
  }, [open, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    updateFacilityWorkOrderSettings(values)
    message.success('工单设置已保存')
    onClose()
  }

  return (
    <Modal title="工单设置" open={open} onCancel={onClose} onOk={handleOk} destroyOnClose>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="自定义工单超时与逾期规则，保存后同步作用于中台列表与小程序工单展示；损坏状态工单不参与时效监控。"
      />
      <Form form={form} layout="vertical">
        <Form.Item
          name="unhandledTimeoutDays"
          label="未处理超时（天）"
          rules={[{ required: true, message: '请填写未处理超时天数' }]}
          extra="工单生成后超过该天数仍未接单处理，标记为「超时待处理」；损坏状态工单不计入。"
        >
          <InputNumber min={1} max={365} precision={0} style={{ width: '100%' }} addonAfter="天" />
        </Form.Item>
        <Form.Item
          name="completionOverdueDays"
          label="完成逾期（天）"
          rules={[{ required: true, message: '请填写完成逾期天数' }]}
          extra="接单后超过该天数仍未完成，标记为「逾期处理中」。"
        >
          <InputNumber min={1} max={365} precision={0} style={{ width: '100%' }} addonAfter="天" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
