/** 设施工单-工单设置 编辑权限码 */
export const FACILITY_WORK_ORDER_SETTINGS_PERMISSION = 'facility:work-order:settings'

export type PlatformRole = 'admin' | 'operator'

export interface PlatformUser {
  id: string
  name: string
  role: PlatformRole
  permissions: string[]
}

/** 原型：当前登录用户（接入后端后由登录态注入） */
let currentPlatformUser: PlatformUser = {
  id: 'admin-001',
  name: '管理员',
  role: 'admin',
  permissions: [FACILITY_WORK_ORDER_SETTINGS_PERMISSION],
}

export function getPlatformUser(): PlatformUser {
  return { ...currentPlatformUser }
}

/** 管理员或已授予「设施工单-工单设置」权限的用户可编辑 */
export function canEditFacilityWorkOrderSettings(user: PlatformUser = getPlatformUser()): boolean {
  return user.role === 'admin' || user.permissions.includes(FACILITY_WORK_ORDER_SETTINGS_PERMISSION)
}

/** 原型调试：切换当前用户角色/权限 */
export function setPlatformUserMock(patch: Partial<PlatformUser>) {
  currentPlatformUser = { ...currentPlatformUser, ...patch }
}
