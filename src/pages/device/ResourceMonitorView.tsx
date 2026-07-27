import { useMemo, useState } from 'react'
import { Input, Button, Space, Tree, Radio, Row, Col, Card, Tag } from 'antd'
import { PlayCircleOutlined, SearchOutlined } from '@ant-design/icons'
import {
  getMonitorTreeSummary,
  monitorTreeData,
  resolveMonitorTreePath,
} from '../../mock/deviceData'

export default function ResourceMonitorView() {
  const [mode, setMode] = useState<'live' | 'history'>('live')
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const summary = useMemo(() => getMonitorTreeSummary(), [])

  const selectedPath = useMemo(() => {
    const key = selectedKeys[0]
    if (!key) return null
    return resolveMonitorTreePath(key)
  }, [selectedKeys])

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      <Card size="small" style={{ marginBottom: 12 }}>
        <Row justify="space-between" align="middle">
          <Space wrap>
            <span>
              全部监控：<strong>{summary.total}</strong>
            </span>
            <Input placeholder="搜索设备 / 小区 / 楼栋" style={{ width: 220 }} />
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>清空</Button>
            <span style={{ color: '#52c41a' }}>在线：{summary.online}</span>
            <span style={{ color: '#ff4d4f' }}>离线：{summary.offline}</span>
          </Space>
          <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
            <Radio.Button value="live">实时监控</Radio.Button>
            <Radio.Button value="history">历史回放</Radio.Button>
          </Radio.Group>
        </Row>
      </Card>
      <Row gutter={12} style={{ flex: 1, minHeight: 0 }}>
        <Col span={6}>
          <Card size="small" title="设备树（小区 / 楼栋）" style={{ height: '100%', overflow: 'auto' }}>
            <Tree
              showLine
              defaultExpandAll
              treeData={monitorTreeData}
              selectedKeys={selectedKeys}
              onSelect={(keys) => setSelectedKeys(keys as string[])}
            />
          </Card>
        </Col>
        <Col span={18}>
          <Card
            size="small"
            style={{
              height: '100%',
              background: '#000',
              display: 'flex',
              flexDirection: 'column',
            }}
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            {selectedKeys.length > 0 ? (
              <div style={{ textAlign: 'center', color: '#fff', padding: 16 }}>
                {selectedPath && (
                  <div style={{ marginBottom: 16 }}>
                    {selectedPath.community && (
                      <Tag color="blue" style={{ marginBottom: 8 }}>
                        小区名称：{selectedPath.community}
                      </Tag>
                    )}
                    {selectedPath.building && (
                      <Tag color="geekblue" style={{ marginBottom: 8, marginLeft: selectedPath.community ? 8 : 0 }}>
                        楼栋：{selectedPath.building}
                      </Tag>
                    )}
                    <div style={{ color: '#ccc', fontSize: 13, marginTop: 4 }}>{selectedPath.path}</div>
                  </div>
                )}
                <PlayCircleOutlined style={{ fontSize: 64, cursor: 'pointer' }} />
                <div style={{ marginTop: 12 }}>{mode === 'live' ? '实时监控播放中' : '历史回放'}</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#666' }}>
                <PlayCircleOutlined style={{ fontSize: 64 }} />
                <div style={{ marginTop: 12, color: '#999' }}>请从左侧选择监控设备（先选小区，再选楼栋）</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
