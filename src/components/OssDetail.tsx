'use client'

import { useState } from 'react'
import StatusBadge from './StatusBadge'
import OssReviewModal from './OssReviewModal'
import type { OssMaster } from '@/lib/types'

interface OssDetailProps {
  readonly oss: OssMaster
  readonly onSave?: (data: Partial<OssMaster>) => Promise<void>
  readonly updating?: boolean
}

export default function OssDetail({ oss, onSave, updating }: OssDetailProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{oss.oss_name}</h2>
          {oss.oss_nickname && (
            <p className="text-sm text-gray-500 mt-1">{oss.oss_nickname}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={oss.reviewed} />
          {onSave && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-md border transition-colors border-orange-400 text-orange-700 bg-orange-50 hover:bg-orange-100"
            >
              리뷰 하기
            </button>
          )}
        </div>
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
        {oss.creater && (
          <div>
            <dt className="text-gray-500">Created by</dt>
            <dd className="text-gray-900 font-medium">{oss.creater}</dd>
          </div>
        )}
        {oss.purl && (
          <div className="sm:col-span-2">
            <dt className="text-gray-500">PURL</dt>
            <dd className="text-gray-900 font-mono text-xs break-all">{oss.purl}</dd>
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

      {onSave && (
        <OssReviewModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          oss={oss}
          onSave={onSave}
          saving={updating}
        />
      )}
    </div>
  )
}
