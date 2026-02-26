import StatusBadge from './StatusBadge'
import type { OssVersion, OssReviewStatus } from '@/lib/types'

interface VersionItemProps {
  readonly version: OssVersion
  readonly selected: boolean
  readonly updating: boolean
  readonly onToggleSelect: (id: number) => void
  readonly onUpdateReview: (id: number, reviewed: OssReviewStatus) => void
}

export default function VersionItem({
  version,
  selected,
  updating,
  onToggleSelect,
  onUpdateReview,
}: VersionItemProps) {
  const nextStatus: OssReviewStatus = version.reviewed === 'Y' ? 'N' : 'Y'
  const buttonLabel = version.reviewed === 'Y' ? '리뷰 취소' : '리뷰 완료'

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(version.oss_version_id)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={`${version.version} 선택`}
      />

      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-900">
          {version.version || '(버전 없음)'}
        </span>
        {version.release_date && (
          <span className="ml-2 text-xs text-gray-400">
            {version.release_date}
          </span>
        )}
      </div>

      <StatusBadge status={version.reviewed} />

      <button
        type="button"
        onClick={() => onUpdateReview(version.oss_version_id, nextStatus)}
        disabled={updating}
        className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          version.reviewed === 'Y'
            ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
            : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
