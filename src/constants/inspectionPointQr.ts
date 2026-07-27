import { pointRows } from '../mock/data'

export type InspectionPointInfo = {
  id: string
  name: string
  plot: string
  location: string
}

export function getInspectionPointQrValue(point: Pick<InspectionPointInfo, 'id' | 'name' | 'plot'>) {
  return `INSPECTION-POINT:${point.id}:${point.plot}:${point.name}`
}

export function parseInspectionPointQrValue(qrValue: string) {
  const match = qrValue.match(/^INSPECTION-POINT:([^:]+):([^:]+):(.+)$/)
  if (!match) return null
  return { pointId: match[1], plot: match[2], name: match[3] }
}

export function findPointByQrValue(qrValue: string): InspectionPointInfo | undefined {
  const parsed = parseInspectionPointQrValue(qrValue)
  if (!parsed) return undefined
  const row = pointRows.find((p) => p.id === parsed.pointId)
  if (!row) return undefined
  return { id: row.id, name: row.name, plot: row.plot, location: row.location }
}

export const scannableInspectionPoints = pointRows.map((p) => ({
  ...p,
  qrValue: getInspectionPointQrValue(p),
}))
