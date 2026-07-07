import { useEffect } from 'react'
import { Modal, Form, Input, Select, Cascader, Row, Col, Button, message } from 'antd'
import {
  FIRE_DEVICE_ASSET_CATEGORIES,
  MONITOR_DEVICE_ASSET_CATEGORIES,
  fireLocationCascaderOptions,
  monitorLocationCascaderOptions,
  type FireDeviceRow,
  type MonitorDeviceRow,
} from '../../mock/deviceData'
import './deviceDetailModal.css'

export type DeviceDetailKind = 'fire' | 'monitor'
export type DeviceDetailMode = 'edit' | 'view'

type DeviceRecord = FireDeviceRow | MonitorDeviceRow

interface DeviceDetailModalProps {
  kind: DeviceDetailKind
  open: boolean
  mode: DeviceDetailMode
  record: DeviceRecord | null
  onClose: () => void
  onSave?: (values: DeviceRecord) => void
}

const AUTO_READ_STYLE: React.CSSProperties = {
  background: '#f5f5f5',
  color: 'rgba(0,0,0,0.65)',
}

function locationToPath(location: string) {
  return location
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
}

function pathToLocation(path: string[]) {
  return path.join(' / ')
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="device-detail-section">
      <div className="device-detail-section-head">
        <span className="device-detail-section-bar" />
        <span className="device-detail-section-title">{title}</span>
      </div>
      {children}
    </div>
  )
}

export default function DeviceDetailModal({
  kind,
  open,
  mode,
  record,
  onClose,
  onSave,
}: DeviceDetailModalProps) {
  const [form] = Form.useForm()
  const readonly = mode === 'view'
  const isFire = kind === 'fire'
  const assetOptions = (isFire ? FIRE_DEVICE_ASSET_CATEGORIES : MONITOR_DEVICE_ASSET_CATEGORIES).map(
    (v) => ({ value: v, label: v }),
  )
  const locationOptions = isFire ? fireLocationCascaderOptions : monitorLocationCascaderOptions

  useEffect(() => {
    if (!open || !record) return
    form.setFieldsValue({
      locationPath: locationToPath(record.location),
      locationText: record.location,
      ID_设备类型: record.ID_设备类型 ?? '',
      dockAddress: record.dockAddress ?? ('networkAddress' in record ? record.networkAddress : '') ?? '',
      deviceName: record.deviceName,
      deviceNo: record.deviceNo,
      serialNo: record.serialNo ?? '',
      channelNo: record.channelNo,
      ipAddress: record.ipAddress ?? '',
      brand: record.brand ?? '',
      bindStatus: record.bindStatus,
      model: record.model ?? '',
      ID_资产分类: record.ID_资产分类,
      monitorStatus: record.monitorStatus,
      account: 'account' in record ? (record.account ?? '') : '',
      password: '',
    })
  }, [open, record, form])

  const handleConfirm = async () => {
    if (readonly || !record) {
      onClose()
      return
    }
    const values = await form.validateFields()
    const location = isFire
      ? record.location
      : pathToLocation((values.locationPath as string[]) ?? locationToPath(record.location))

    const next: DeviceRecord = {
      ...record,
      location,
      ID_设备类型: values.ID_设备类型?.trim() || undefined,
      dockAddress: values.dockAddress?.trim() || undefined,
      deviceName: values.deviceName?.trim() ?? record.deviceName,
      deviceNo: values.deviceNo?.trim() ?? record.deviceNo,
      serialNo: values.serialNo?.trim() || undefined,
      channelNo: values.channelNo?.trim() ?? record.channelNo,
      ipAddress: values.ipAddress?.trim() || undefined,
      brand: values.brand?.trim() || undefined,
      model: values.model?.trim() || undefined,
      ID_资产分类: values.ID_资产分类,
    }

    if (!isFire) {
      const monitor = next as MonitorDeviceRow
      monitor.account = values.account?.trim() || undefined
      if (values.password?.trim()) monitor.password = values.password.trim()
    }

    onSave?.(next)
    message.success('保存成功')
    onClose()
  }

  const inputProps = (autoRead = false) => {
    if (readonly || autoRead) {
      return { readOnly: true, disabled: true, style: AUTO_READ_STYLE }
    }
    return {}
  }

  return (
    <Modal
      className="device-detail-modal"
      title={readonly ? '查看' : '编辑'}
      open={open}
      onCancel={onClose}
      width={920}
      destroyOnClose
      footer={
        <div className="device-detail-footer">
          {!readonly && <Button onClick={onClose}>取消</Button>}
          <Button type="primary" onClick={handleConfirm}>
            {readonly ? '关闭' : '确认'}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="device-detail-form">
        <SectionCard title="台账基础信息">
          <Row gutter={20}>
            <Col span={8}>
              {isFire || readonly ? (
                <Form.Item label="安装位置" name="locationText">
                  <Input placeholder="自动读取" {...inputProps(true)} />
                </Form.Item>
              ) : (
                <Form.Item
                  label="安装位置"
                  name="locationPath"
                  rules={[{ required: true, message: '请选择安装位置' }]}
                >
                  <Cascader
                    options={locationOptions}
                    placeholder="请选择安装位置"
                    displayRender={(labels) => labels.join(' / ')}
                  />
                </Form.Item>
              )}
            </Col>
            <Col span={8}>
              <Form.Item label="设备类型" name="ID_设备类型">
                <Input placeholder={readonly ? '自动读取' : '自动读取，可编辑'} {...inputProps(readonly)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="对接地址" name="dockAddress">
                <Input placeholder={readonly ? '自动读取' : '自动读取，可编辑'} {...inputProps(readonly)} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item label="设备名称" name="deviceName">
                <Input placeholder="请输入" {...inputProps(readonly)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="设备编号" name="deviceNo">
                <Input placeholder="请输入" {...inputProps(readonly)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="序列号/SN" name="serialNo">
                <Input placeholder="请输入" {...inputProps(readonly)} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item label="通道号" name="channelNo">
                <Input placeholder="请输入" {...inputProps(readonly)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="IP地址" name="ipAddress">
                <Input placeholder="请输入" {...inputProps(readonly)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="绑定状态" name="bindStatus">
                <Select
                  disabled
                  placeholder="自动读取"
                  options={[
                    { value: '已绑定', label: '已绑定' },
                    { value: '未绑定', label: '未绑定' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item label="品牌" name="brand">
                <Input placeholder="请输入" {...inputProps(readonly)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="型号" name="model">
                <Input placeholder="请输入" {...inputProps(readonly)} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="资产类型" name="ID_资产分类">
                {readonly ? (
                  <Input {...inputProps(true)} />
                ) : (
                  <Select placeholder="请选择资产类型" options={assetOptions} />
                )}
              </Form.Item>
            </Col>
          </Row>
        </SectionCard>

        <SectionCard title="平台编辑信息">
          <Row gutter={20}>
            {!isFire && (
              <>
                <Col span={8}>
                  {readonly ? (
                    <Form.Item label="密码">
                      <Input
                        value={
                          record && 'password' in record && record.password ? '******' : '—'
                        }
                        disabled
                        style={AUTO_READ_STYLE}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item label="密码" name="password">
                      <Input.Password placeholder="请输入密码" />
                    </Form.Item>
                  )}
                </Col>
                <Col span={8}>
                  <Form.Item label="账号" name="account">
                    <Input placeholder="请输入账号" {...inputProps(readonly)} />
                  </Form.Item>
                </Col>
              </>
            )}
            <Col span={8}>
              <Form.Item label="监测状态" name="monitorStatus">
                <Select
                  disabled
                  placeholder="自动读取"
                  options={
                    isFire
                      ? [
                          { value: '在线', label: '在线' },
                          { value: '离线', label: '离线' },
                        ]
                      : [
                          { value: '正常', label: '正常' },
                          { value: '异常', label: '异常' },
                        ]
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </SectionCard>
      </Form>
    </Modal>
  )
}
