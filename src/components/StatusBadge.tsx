import type { OssReviewStatus } from '@/lib/types'
import { REVIEW_STATUS_LABELS } from '@/lib/types'

const STATUS_STYLES: Record<OssReviewStatus, string> = {
  Y: 'bg-green-100 text-green-800 border-green-300',
  N: 'bg-gray-100 text-gray-600 border-gray-300',
}

interface StatusBadgeProps {
  readonly status: OssReviewStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]}`}
    >
      {REVIEW_STATUS_LABELS[status]}
    </span>
  )
}
