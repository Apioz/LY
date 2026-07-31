import { useMemo } from 'react'
import { Table } from 'antd'
import type { TableProps } from 'antd'
import type { ColumnGroupType, ColumnType, ColumnsType } from 'antd/es/table'
import {
  ADMIN_ACTION_COL_WIDTH,
  ADMIN_ACTION_TITLES,
  ADMIN_COL_WIDTH,
  ADMIN_INDEX_COL_WIDTH,
  ADMIN_INDEX_TITLES,
  ADMIN_NARROW_COL_WIDTH,
  ADMIN_NARROW_TITLES,
} from '../constants/tableLayout'

type DataColumn<T> = ColumnType<T> | ColumnGroupType<T>

function getTitleString(title: ColumnType<unknown>['title']): string {
  if (typeof title === 'string') return title
  return ''
}

function isGroupColumn<T>(col: DataColumn<T>): col is ColumnGroupType<T> {
  return Array.isArray((col as ColumnGroupType<T>).children)
}

export function normalizeAdminColumns<T>(columns: ColumnsType<T>): ColumnsType<T> {
  return columns.map((col) => {
    if (!col) return col
    if (isGroupColumn(col)) return col

    const column = col as ColumnType<T>
    const title = getTitleString(column.title as ColumnType<unknown>['title'])

    if (ADMIN_INDEX_TITLES.has(title)) {
      return {
        ...column,
        width: ADMIN_INDEX_COL_WIDTH,
        align: column.align ?? 'center',
      }
    }

    if (ADMIN_ACTION_TITLES.has(title)) {
      return {
        ...column,
        width: ADMIN_ACTION_COL_WIDTH,
        align: column.align ?? 'center',
        fixed: column.fixed ?? 'right',
      }
    }

    if (ADMIN_NARROW_TITLES.has(title)) {
      return {
        ...column,
        width: ADMIN_NARROW_COL_WIDTH,
        align: column.align ?? 'center',
        ellipsis: column.ellipsis ?? true,
      }
    }

    return {
      ...column,
      width: ADMIN_COL_WIDTH,
      ellipsis: column.ellipsis ?? true,
    }
  })
}

export function adminTableScrollX<T>(columns: ColumnsType<T>): number {
  return columns.reduce((sum, col) => {
    if (!col || isGroupColumn(col)) return sum
    return sum + ((col as ColumnType<T>).width as number | undefined ?? ADMIN_COL_WIDTH)
  }, 0)
}

export default function AdminTable<T extends object>({ columns, scroll, ...rest }: TableProps<T>) {
  const normalizedColumns = useMemo(
    () => (columns ? normalizeAdminColumns(columns as ColumnsType<T>) : undefined),
    [columns],
  )

  const mergedScroll = useMemo(() => {
    if (!normalizedColumns) return scroll
    const x = scroll?.x ?? adminTableScrollX(normalizedColumns)
    return { ...scroll, x }
  }, [scroll, normalizedColumns])

  return (
    <Table<T>
      {...rest}
      className={['admin-data-table', rest.className].filter(Boolean).join(' ')}
      tableLayout="fixed"
      columns={normalizedColumns}
      scroll={mergedScroll}
    />
  )
}
