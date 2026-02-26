import Link from 'next/link'
import StatusBadge from './StatusBadge'
import type { OssMaster } from '@/lib/types'

interface OssListItemProps {
  readonly oss: OssMaster
}

export default function OssListItem({ oss }: OssListItemProps) {
  return (
    <Link
      href={`/oss/${oss.oss_master_id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {oss.oss_name}
          </h3>
          {oss.oss_nickname && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{oss.oss_nickname}</p>
          )}
          {oss.publisher && (
            <p className="text-xs text-gray-400 mt-0.5">by {oss.publisher}</p>
          )}
        </div>
        <StatusBadge status={oss.reviewed} />
      </div>
    </Link>
  )
}
