import { useEffect } from 'react'
import { Modal, Form, InputNumber, message, Alert, Descriptions, Tag, Button } from 'antd'
import {
  getFacilityWorkOrderSettings,
  updateFacilityWorkOrderSettings,
} from '../store/alarmSync'
import { canEditFacilityWorkOrderSettings } from '../store/platformUser'

interface FacilityWorkOrderSettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function FacilityWorkOrderSettingsModal({
  open,
  onClose,
}: FacilityWorkOrderSettingsModalProps) {
  const [form] = Form.useForm()
  const canEdit = canEditFacilityWorkOrderSettings()
  const settings = getFacilityWorkOrderSettings()

  useEffect(() => {
    if (open) {
      form.setFieldsValue(getFacilityWorkOrderSettings())
    }
  }, [open, form])

  const handleOk = async () => {
    if (!canEdit) {
      onClose()
      return
    }
    try {
      const values = await form.validateFields()
      updateFacilityWorkOrderSettings(values)
      message.success('工单设置已保存')
      onClose()
    } catch (e) {
      if (e instanceof Error && e.message.includes('权限')) {
        message.error('无工单设置编辑权限')
      }
    }
  }

  return (
    <Modal
      title={canEdit ? '工单设置' : '查看工单设置'}
      open={open}
      onCancel={onClose}
      onOk={canEdit ? handleOk : undefined}
      footer={
        canEdit ? undefined : (
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={onClose}>
              关闭
            </Button>
          </div>
        )
      }
      okText="确认"
      cancelText="取消"
      destroyOnClose
      width={520}
    >
      <Alert
        type={canEdit ? 'info' : 'warning'}
        showIcon
        style={{ marginBottom: 16 }}
        message={
          canEdit
            ? '自定义工单超时与逾期规则，保存后同步作用于中台列表与小程序工单展示。损坏工单不参与「未处理超时」监控；接单后的「完成逾期」规则与其他工单一致。'
            : '您仅有查看权限，如需修改请联系管理员或申请「设施工单-工单设置」权限。'
        }
      />
      {!canEdit && (
        <div style={{ marginBottom: 12 }}>
          <Tag color="default">只读</Tag>
        </div>
      )}
      {canEdit ? (
        <Form form={form} layout="vertical">
          <Form.Item
            name="unhandledTimeoutDays"
            label="未处理超时（天）"
            rules={[{ required: true, message: '请填写未处理超时天数' }]}
            extra="工单生成后超过该天数仍未接单，处理状态为「超时待处理」；损坏工单在工单池等待接单时不参与此项监控。"
          >
            <InputNumber min={1} max={365} precision={0} style={{ width: '100%' }} addonAfter="天" />
          </Form.Item>
          <Form.Item
            name="completionOverdueDays"
            label="完成逾期（天）"
            rules={[{ required: true, message: '请填写完成逾期天数' }]}
            extra="接单后超过该天数仍未完成，处理状态为「逾期处理中」；损坏工单被再次接单后同样适用。"
          >
            <InputNumber min={1} max={365} precision={0} style={{ width: '100%' }} addonAfter="天" />
          </Form.Item>
        </Form>
      ) : (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="未处理超时（天）">{settings.unhandledTimeoutDays} 天</Descriptions.Item>
          <Descriptions.Item label="完成逾期（天）">{settings.completionOverdueDays} 天</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  )
}
