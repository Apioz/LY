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
  | 'safety-norm'
  | 'training-materials'
  | 'personnel-qualification'
  | 'drill-plan'
  | 'drill-implement'
  | 'archive-all-projects'
  | 'archive-maintenance'
  | 'archive-renovation'
  | 'archive-lease'
  | 'personnel-grid'
  | 'plot-org-structure'
  | 'special-equipment'
  | 'gas-equipment'
  | 'charging-pile'
  | 'alarm-stats'
  | 'alarm-list'
  | 'alarm-settings'
  | 'facility-work-order'
  | 'fire-device-mgmt'
  | 'fire-event-alarm'
  | 'monitor-device-mgmt'
  | 'resource-monitor-view'
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
  { key: 'safety-norm', label: '安全规范', route: 'safety-norm' },
  {
    key: 'group-education',
    label: '教育培训',
    children: [
      { key: 'training-materials', label: '培训资料', route: 'training-materials' },
      { key: 'personnel-qualification', label: '人员资质', route: 'personnel-qualification' },
    ],
  },
  {
    key: 'group-drill',
    label: '应急演练',
    children: [
      { key: 'drill-plan', label: '演练计划', route: 'drill-plan' },
      { key: 'drill-implement', label: '演练实施', route: 'drill-implement' },
    ],
  },
  {
    key: 'group-archive',
    label: '档案管理',
    children: [
      {
        key: 'group-project-archive',
        label: '项目档案',
        children: [
          { key: 'archive-all-projects', label: '全部项目档案', route: 'archive-all-projects' },
          { key: 'archive-maintenance', label: '项目检维修', route: 'archive-maintenance' },
          { key: 'archive-renovation', label: '二次装修', route: 'archive-renovation' },
          { key: 'archive-lease', label: '租赁档案', route: 'archive-lease' },
        ],
      },
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
    key: 'group-device-mgmt',
    label: '设备管理',
    children: [
      {
        key: 'group-fire-device',
        label: '消防设备',
        children: [
          { key: 'fire-device-mgmt', label: '设备管理', route: 'fire-device-mgmt' },
          { key: 'fire-event-alarm', label: '事件告警', route: 'fire-event-alarm' },
        ],
      },
      {
        key: 'group-monitor-device',
        label: '监控设备',
        children: [
          { key: 'monitor-device-mgmt', label: '设备管理', route: 'monitor-device-mgmt' },
          { key: 'resource-monitor-view', label: '资源监控视图', route: 'resource-monitor-view' },
        ],
      },
    ],
  },
  {
    key: 'group-basic',
    label: '基础管理',
    children: [
      { key: 'personnel-grid', label: '安全人员网格', route: 'personnel-grid' },
      { key: 'plot-org-structure', label: '地块组织架构', route: 'plot-org-structure' },
      {
        key: 'group-equip-archive',
        label: '设备档案',
        children: [
          { key: 'special-equipment', label: '特种设备', route: 'special-equipment' },
          { key: 'gas-equipment', label: '燃气设备', route: 'gas-equipment' },
          { key: 'charging-pile', label: '充电桩设备', route: 'charging-pile' },
        ],
      },
    ],
  },
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
  'safety-norm': '安全规范',
  'training-materials': '培训资料',
  'personnel-qualification': '人员资质',
  'drill-plan': '演练计划',
  'drill-implement': '演练实施',
  'archive-all-projects': '全部项目档案',
  'archive-maintenance': '项目检维修',
  'archive-renovation': '二次装修',
  'archive-lease': '租赁档案',
  'personnel-grid': '安全人员网格',
  'plot-org-structure': '地块组织架构',
  'special-equipment': '特种设备',
  'gas-equipment': '燃气设备',
  'charging-pile': '充电桩设备',
  'alarm-stats': '告警统计',
  'alarm-list': '告警列表',
  'alarm-settings': '告警设置',
  'facility-work-order': '设施工单',
  'fire-device-mgmt': '消防设备-设备管理',
  'fire-event-alarm': '事件告警',
  'monitor-device-mgmt': '监控设备-设备管理',
  'resource-monitor-view': '资源监控视图',
  'inspection-content-config': '检查内容配置',
  'system-dictionary': '系统字典',
}
