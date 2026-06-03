export type MenuKey =
  | 'safety-stats'
  | 'inspection-calendar'
  | 'inspection-content-entry'
  | 'inspection-point-setting'
  | 'inspection-project-setting'
  | 'inspection-plan-setting'
  | 'inspection-work-order'
  | 'all-inspections'
  | 'rectification-work-order'
  | 'inspection-report'
  | 'alarm-stats'
  | 'alarm-list'
  | 'alarm-settings'
  | 'facility-work-order'
  | 'inspection-content-config'
  | 'system-dictionary'
  | 'home'

export interface MenuItem {
  key: string
  label: string
  route?: MenuKey
  children?: MenuItem[]
}

export const menuItems: MenuItem[] = [
  {
    key: 'group-safety',
    label: '安全检查',
    children: [
      { key: 'safety-stats', label: '安全检查统计', route: 'safety-stats' },
      {
        key: 'group-inspection-mgmt',
        label: '检查管理',
        children: [
          { key: 'inspection-calendar', label: '检查日历', route: 'inspection-calendar' },
          { key: 'inspection-content-entry', label: '检查内容录入', route: 'inspection-content-entry' },
          { key: 'inspection-point-setting', label: '检查点位设定', route: 'inspection-point-setting' },
          { key: 'inspection-project-setting', label: '检查项目设定', route: 'inspection-project-setting' },
          { key: 'inspection-plan-setting', label: '检查计划设定', route: 'inspection-plan-setting' },
          { key: 'inspection-work-order', label: '检查工单管理', route: 'inspection-work-order' },
          { key: 'all-inspections', label: '全部检查', route: 'all-inspections' },
        ],
      },
      { key: 'rectification-work-order', label: '整改工单', route: 'rectification-work-order' },
      { key: 'inspection-report', label: '检查报表', route: 'inspection-report' },
    ],
  },
  {
    key: 'group-alarm',
    label: '告警中心',
    children: [
      { key: 'alarm-stats', label: '告警统计', route: 'alarm-stats' },
      { key: 'alarm-list', label: '告警列表', route: 'alarm-list' },
      { key: 'alarm-settings', label: '告警设置', route: 'alarm-settings' },
    ],
  },
  { key: 'facility-work-order', label: '设施工单', route: 'facility-work-order' },
  {
    key: 'group-system',
    label: '系统管理',
    children: [
      { key: 'inspection-content-config', label: '检查内容配置', route: 'inspection-content-config' },
      { key: 'system-dictionary', label: '系统字典', route: 'system-dictionary' },
    ],
  },
]

export const pageTitles: Record<MenuKey, string> = {
  home: '首页',
  'safety-stats': '安全检查统计',
  'inspection-calendar': '检查日历',
  'inspection-content-entry': '检查内容录入',
  'inspection-point-setting': '检查点位设定',
  'inspection-project-setting': '检查项目设定',
  'inspection-plan-setting': '检查计划设定',
  'inspection-work-order': '检查工单管理',
  'all-inspections': '全部检查',
  'rectification-work-order': '整改工单',
  'inspection-report': '检查报表',
  'alarm-stats': '告警统计',
  'alarm-list': '告警列表',
  'alarm-settings': '告警设置',
  'facility-work-order': '设施工单',
  'inspection-content-config': '检查内容配置',
  'system-dictionary': '系统字典',
}
