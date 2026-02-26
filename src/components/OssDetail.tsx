import StatusBadge from './StatusBadge'
import type { OssMaster } from '@/lib/types'

interface OssDetailProps {
  readonly oss: OssMaster
}

export default function OssDetail({ oss }: OssDetailProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{oss.oss_name}</h2>
          {oss.oss_nickname && (
            <p className="text-sm text-gray-500 mt-1">{oss.oss_nickname}</p>
          )}
        </div>
        <StatusBadge status={oss.reviewed} />
      </div>

      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {oss.publisher && (
          <div>
            <dt className="text-gray-500">Publisher</dt>
            <dd className="text-gray-900 font-medium">{oss.publisher}</dd>
          </div>
        )}
        {oss.homepage && (
          <div>
            <dt className="text-gray-500">Homepage</dt>
            <dd>
              <a
                href={oss.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {oss.homepage}
              </a>
            </dd>
          </div>
        )}
        {oss.download_location && (
          <div>
            <dt className="text-gray-500">Download</dt>
            <dd>
              <a
                href={oss.download_location}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {oss.download_location}
              </a>
            </dd>
          </div>
        )}
        {oss.description && (
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Description</dt>
            <dd className="text-gray-900">{oss.description}</dd>
          </div>
        )}
        {oss.description_ko && (
          <div className="sm:col-span-2">
            <dt className="text-gray-500">설명</dt>
            <dd className="text-gray-900">{oss.description_ko}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
