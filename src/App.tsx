import { useState, type ReactNode } from 'react'
import MainLayout, { HomePage } from './layout/MainLayout'
import type { MenuKey } from './menu'
import SafetyStatistics from './pages/SafetyStatistics'
import InspectionPointSetting from './pages/InspectionPointSetting'
import InspectionContentEntry from './pages/InspectionContentEntry'
import InspectionProjectSetting from './pages/InspectionProjectSetting'
import InspectionPlanSetting from './pages/InspectionPlanSetting'
import InspectionWorkOrder from './pages/InspectionWorkOrder'
import AllInspections from './pages/AllInspections'
import RectificationWorkOrder from './pages/RectificationWorkOrder'
import InspectionReport from './pages/InspectionReport'
import InspectionContentConfig from './pages/InspectionContentConfig'
import SystemDictionary from './pages/SystemDictionary'
import FacilityWorkOrder from './pages/FacilityWorkOrder'
import { AlarmStatistics, AlarmList, AlarmSettings } from './pages/AlarmPages'
import { InspectionCalendar } from './pages/PlaceholderPages'

const pageMap: Record<MenuKey, ReactNode> = {
  home: <HomePage />,
  'safety-stats': <SafetyStatistics />,
  'inspection-calendar': <InspectionCalendar />,
  'inspection-content-entry': <InspectionContentEntry />,
  'inspection-point-setting': <InspectionPointSetting />,
  'inspection-project-setting': <InspectionProjectSetting />,
  'inspection-plan-setting': <InspectionPlanSetting />,
  'inspection-work-order': <InspectionWorkOrder />,
  'all-inspections': <AllInspections />,
  'rectification-work-order': <RectificationWorkOrder />,
  'inspection-report': <InspectionReport />,
  'alarm-stats': <AlarmStatistics />,
  'alarm-list': <AlarmList />,
  'alarm-settings': <AlarmSettings />,
  'facility-work-order': <FacilityWorkOrder />,
  'inspection-content-config': <InspectionContentConfig />,
  'system-dictionary': <SystemDictionary />,
}

export default function App() {
  const [activeKey, setActiveKey] = useState<MenuKey>('safety-stats')

  return (
    <MainLayout activeKey={activeKey} onNavigate={setActiveKey}>
      {pageMap[activeKey]}
    </MainLayout>
  )
}
