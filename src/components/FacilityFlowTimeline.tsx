import { Empty, Image, Timeline, Typography } from 'antd'
import type { FacilityFlowRecord } from '../store/alarmSync'

interface FacilityFlowTimelineProps {
  /** 与小程序 `flowRecords` 同源，记录工单生成至闭环的完整流转 */
  records?: FacilityFlowRecord[]
}

export default function FacilityFlowTimeline({ records }: FacilityFlowTimelineProps) {
  const list = records ?? []

  if (!list.length) {
    return <Empty description="暂无流转记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <Timeline
      items={list.map((record, index) => ({
        key: `${record.time}-${index}`,
        children: (
          <div>
            <div>
              <Typography.Text strong>
                {record.operator} · {record.action}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                {record.time}
              </Typography.Text>
            </div>
            {record.fields?.length ? (
              <div style={{ marginTop: 8 }}>
                {record.fields.map((field) => (
                  <div key={field.label} style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', lineHeight: 1.6 }}>
                    <span style={{ color: 'rgba(0,0,0,0.45)' }}>{field.label}：</span>
                    {field.value}
                  </div>
                ))}
              </div>
            ) : record.detail ? (
              <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(0,0,0,0.65)', lineHeight: 1.6 }}>
                {record.detail}
              </div>
            ) : null}
            {record.images && record.images.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  上传图片（{record.images.length} 张）
                </Typography.Text>
                <Image.PreviewGroup>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {record.images.map((src, imageIndex) => (
                      <Image
                        key={imageIndex}
                        src={src}
                        width={88}
                        height={88}
                        style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0' }}
                        alt={`上传图片${imageIndex + 1}`}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}
          </div>
        ),
      }))}
    />
  )
}
