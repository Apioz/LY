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
import FireDeviceManagement from './pages/device/FireDeviceManagement'
import FireEventAlarm from './pages/device/FireEventAlarm'
import MonitorDeviceManagement from './pages/device/MonitorDeviceManagement'
import ResourceMonitorView from './pages/device/ResourceMonitorView'
import {
  SafetyNormPage,
  TrainingMaterialsPage,
  PersonnelQualificationPage,
  DrillPlanPage,
  DrillImplementPage,
  ArchiveAllProjectsPage,
  ArchiveMaintenancePage,
  ArchiveRenovationPage,
  ArchiveLeasePage,
  PersonnelGridPage,
  PlotOrgStructurePage,
  SpecialEquipmentPage,
  GasEquipmentPage,
  ChargingPilePage,
} from './pages/hse/HsePages'
import MiniProgramApp from './miniapp/MiniProgramApp'

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
  'safety-norm': <SafetyNormPage />,
  'training-materials': <TrainingMaterialsPage />,
  'personnel-qualification': <PersonnelQualificationPage />,
  'drill-plan': <DrillPlanPage />,
  'drill-implement': <DrillImplementPage />,
  'archive-all-projects': <ArchiveAllProjectsPage />,
  'archive-maintenance': <ArchiveMaintenancePage />,
  'archive-renovation': <ArchiveRenovationPage />,
  'archive-lease': <ArchiveLeasePage />,
  'personnel-grid': <PersonnelGridPage />,
  'plot-org-structure': <PlotOrgStructurePage />,
  'special-equipment': <SpecialEquipmentPage />,
  'gas-equipment': <GasEquipmentPage />,
  'charging-pile': <ChargingPilePage />,
  'alarm-stats': <AlarmStatistics />,
  'alarm-list': <AlarmList />,
  'alarm-settings': <AlarmSettings />,
  'facility-work-order': <FacilityWorkOrder />,
  'fire-device-mgmt': <FireDeviceManagement />,
  'fire-event-alarm': <FireEventAlarm />,
  'monitor-device-mgmt': <MonitorDeviceManagement />,
  'resource-monitor-view': <ResourceMonitorView />,
  'inspection-content-config': <InspectionContentConfig />,
  'system-dictionary': <SystemDictionary />,
}

export type AppMode = 'admin' | 'mini'

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('admin')
  const [activeKey, setActiveKey] = useState<MenuKey>('safety-stats')

  if (appMode === 'mini') {
    return <MiniProgramApp onSwitchToAdmin={() => setAppMode('admin')} />
  }

  return (
    <MainLayout
      activeKey={activeKey}
      onNavigate={setActiveKey}
      appMode={appMode}
      onSwitchMode={setAppMode}
    >
      {pageMap[activeKey]}
    </MainLayout>
  )
}
