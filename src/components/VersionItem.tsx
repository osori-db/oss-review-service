import StatusBadge from './StatusBadge'
import type { OssVersion } from '@/lib/types'

interface VersionItemProps {
  readonly version: OssVersion
  readonly selected: boolean
  readonly onToggleSelect: (id: number) => void
  readonly onOpenReview: (version: OssVersion) => void
}

function formatLicenseList(licenses: readonly string[] | null): string {
  if (!licenses || licenses.length === 0) return '-'
  return licenses.join(', ')
}

export default function VersionItem({
  version,
  selected,
  onToggleSelect,
  onOpenReview,
}: VersionItemProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-2 py-2.5 text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(version.oss_version_id)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={`${version.version} 선택`}
        />
      </td>
      <td className="px-2 py-2.5 text-xs text-gray-400 text-center">
        {version.oss_version_id}
      </td>
      <td className="px-2 py-2.5">
        <span className="text-sm font-medium text-gray-900">
          {version.version || '(버전 없음)'}
        </span>
      </td>
      <td className="px-2 py-2.5 text-xs text-gray-600 max-w-[180px] truncate" title={formatLicenseList(version.declaredLicenseList)}>
        {formatLicenseList(version.declaredLicenseList)}
      </td>
      <td className="px-2 py-2.5 text-xs text-gray-600 max-w-[180px] truncate" title={formatLicenseList(version.detectedLicenseList)}>
        {formatLicenseList(version.detectedLicenseList)}
      </td>
      <td className="px-2 py-2.5 text-xs text-gray-600 max-w-[150px] truncate" title={version.copyright || ''}>
        {version.copyright || '-'}
      </td>
      <td className="px-2 py-2.5 text-center">
        <StatusBadge status={version.reviewed} />
      </td>
      <td className="px-2 py-2.5 text-center">
        <button
          type="button"
          onClick={() => onOpenReview(version)}
          className="text-xs font-medium px-2.5 py-1 rounded-md border transition-colors border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
        >
          리뷰 하기
        </button>
      </td>
    </tr>
  )
}
