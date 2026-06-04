import { useMemo, useState } from 'react'
import { Layout, Menu, Tabs, Dropdown, Avatar, Space, Button } from 'antd'
import {
  SafetyCertificateOutlined,
  AlertOutlined,
  ToolOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  MoreOutlined,
  AppstoreOutlined,
  FireOutlined,
  VideoCameraOutlined,
  FileProtectOutlined,
  ReadOutlined,
  ThunderboltOutlined,
  FolderOpenOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { menuItems, pageTitles, type MenuKey } from '../menu'

const { Header, Sider, Content } = Layout

const groupIcons: Record<string, React.ReactNode> = {
  'group-safety': <SafetyCertificateOutlined />,
  'safety-norm': <FileProtectOutlined />,
  'group-education': <ReadOutlined />,
  'group-drill': <ThunderboltOutlined />,
  'group-archive': <FolderOpenOutlined />,
  'group-project-archive': <FolderOpenOutlined />,
  'group-alarm': <AlertOutlined />,
  'facility-work-order': <ToolOutlined />,
  'group-device-mgmt': <AppstoreOutlined />,
  'group-fire-device': <FireOutlined />,
  'group-monitor-device': <VideoCameraOutlined />,
  'group-basic': <DatabaseOutlined />,
  'group-equip-archive': <AppstoreOutlined />,
  'group-system': <SettingOutlined />,
}

function buildAntMenuItems(items: typeof menuItems, onNavigate: (k: MenuKey) => void): MenuProps['items'] {
  const mapItem = (item: (typeof menuItems)[0]): NonNullable<MenuProps['items']>[number] => {
    if (item.children?.length) {
      return {
        key: item.key,
        icon: groupIcons[item.key],
        label: item.label,
        children: item.children.map(mapItem),
      }
    }
    return {
      key: item.key,
      icon: groupIcons[item.key],
      label: item.label,
      onClick: () => item.route && onNavigate(item.route),
    }
  }
  return items.map(mapItem)
}

interface MainLayoutProps {
  activeKey: MenuKey
  onNavigate: (key: MenuKey) => void
  children: React.ReactNode
}

export default function MainLayout({ activeKey, onNavigate, children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [openTabs, setOpenTabs] = useState<{ key: MenuKey; label: string }[]>([
    { key: 'home', label: '首页' },
    { key: 'safety-stats', label: '安全检查统计' },
  ])

  const handleNavigate = (key: MenuKey) => {
    onNavigate(key)
    if (key !== 'home') {
      setOpenTabs((prev) => {
        if (prev.some((t) => t.key === key)) return prev
        return [...prev, { key, label: pageTitles[key] }]
      })
    }
  }

  const menuData = useMemo(() => buildAntMenuItems(menuItems, handleNavigate), [])

  const defaultOpenKeys = useMemo(() => {
    const keys: string[] = []
    if (
      [
        'safety-stats',
        'inspection-calendar',
        'inspection-content-entry',
        'inspection-point-setting',
        'inspection-project-setting',
        'inspection-plan-setting',
        'inspection-work-order',
        'all-inspections',
        'rectification-work-order',
        'inspection-report',
      ].includes(activeKey)
    ) {
      keys.push('group-safety', 'group-inspection-mgmt')
    }
    if (['training-materials', 'personnel-qualification'].includes(activeKey)) keys.push('group-education')
    if (['drill-plan', 'drill-implement'].includes(activeKey)) keys.push('group-drill')
    if (
      ['archive-all-projects', 'archive-maintenance', 'archive-renovation', 'archive-lease'].includes(activeKey)
    ) {
      keys.push('group-archive', 'group-project-archive')
    }
    if (['alarm-stats', 'alarm-list', 'alarm-settings'].includes(activeKey)) keys.push('group-alarm')
    if (['fire-device-mgmt', 'fire-event-alarm'].includes(activeKey)) {
      keys.push('group-device-mgmt', 'group-fire-device')
    }
    if (['monitor-device-mgmt', 'resource-monitor-view'].includes(activeKey)) {
      keys.push('group-device-mgmt', 'group-monitor-device')
    }
    if (['personnel-grid', 'plot-org-structure'].includes(activeKey)) keys.push('group-basic')
    if (['special-equipment', 'gas-equipment', 'charging-pile'].includes(activeKey)) {
      keys.push('group-basic', 'group-equip-archive')
    }
    if (['inspection-content-config', 'system-dictionary'].includes(activeKey)) keys.push('group-system')
    return keys
  }, [activeKey])

  const tabItems = openTabs.map((t) => ({
    key: t.key,
    label: t.label,
    closable: t.key !== 'home',
  }))

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        theme="light"
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            color: '#1890ff',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {collapsed ? '中台' : '中台管理系统'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          defaultOpenKeys={defaultOpenKeys}
          items={menuData}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            height: 48,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>匿名</span>
          </Space>
        </Header>
        <div style={{ background: '#f5f5f5', padding: '8px 12px 0' }}>
          <Tabs
            type="editable-card"
            hideAdd
            activeKey={activeKey}
            onChange={(k) => handleNavigate(k as MenuKey)}
            onEdit={(targetKey, action) => {
              if (action === 'remove') {
                const key = targetKey as MenuKey
                setOpenTabs((prev) => {
                  const next = prev.filter((t) => t.key !== key)
                  if (activeKey === key) {
                    const last = next[next.length - 1]
                    handleNavigate(last?.key ?? 'home')
                  }
                  return next
                })
              }
            }}
            items={tabItems}
            tabBarExtraContent={
              <Dropdown menu={{ items: [{ key: 'more', label: '关闭其他' }] }}>
                <Button type="link" icon={<MoreOutlined />}>
                  更多
                </Button>
              </Dropdown>
            }
            style={{ marginBottom: 0 }}
          />
        </div>
        <Content style={{ margin: 12, background: '#fff', minHeight: 360 }}>{children}</Content>
      </Layout>
    </Layout>
  )
}

export function HomePage() {
  return (
    <div style={{ padding: 48, textAlign: 'center', color: '#999' }}>
      <HomeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
      <div>欢迎使用中台管理系统</div>
    </div>
  )
}
