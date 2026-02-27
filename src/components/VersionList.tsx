'use client'

import { useState } from 'react'
import { useOssVersions } from '@/hooks/useOssVersions'
import VersionItem from './VersionItem'
import VersionReviewModal from './VersionReviewModal'
import Pagination from './Pagination'
import LoadingSkeleton from './LoadingSkeleton'
import ErrorMessage from './ErrorMessage'
import OssDetail from './OssDetail'
import type { OssReviewStatus, OssVersion } from '@/lib/types'

interface VersionListProps {
  readonly ossMasterId: number
}

export default function VersionList({ ossMasterId }: VersionListProps) {
  const {
    ossMaster,
    versions,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    selectedIds,
    updating,
    reviewFilter,
    setCurrentPage,
    setReviewFilter,
    toggleSelection,
    toggleSelectAll,
    selectUnreviewed,
    saveOssMaster,
    saveVersion,
    bulkUpdateReview,
    refresh,
  } = useOssVersions(ossMasterId)

  const [reviewTarget, setReviewTarget] = useState<OssVersion | null>(null)

  const allSelected = versions.length > 0 && versions.every((v) => selectedIds.has(v.oss_version_id))
  const hasUnreviewed = versions.some((v) => v.reviewed === 'N')

  return (
    <div className="space-y-6">
      {ossMaster && (
        <OssDetail
          oss={ossMaster}
          onSave={saveOssMaster}
          updating={updating}
        />
      )}

      {error && <ErrorMessage message={error} onRetry={refresh} />}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              버전 목록
              {!loading && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({totalCount.toLocaleString()}건)
                </span>
              )}
            </h3>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value as OssReviewStatus | '')}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-olive-400"
            >
              <option value="">전체</option>
              <option value="Y">리뷰 완료</option>
              <option value="N">리뷰 안됨</option>
            </select>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedIds.size}건 선택
              </span>
              <button
                type="button"
                onClick={() => bulkUpdateReview('Y')}
                disabled={updating}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-olive-500 text-white hover:bg-olive-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                리뷰하기
              </button>
              <button
                type="button"
                onClick={() => bulkUpdateReview('N')}
                disabled={updating}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                리뷰 취소
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {reviewFilter === 'N' ? '리뷰 안됨 버전이 없습니다.' : '버전이 없습니다.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-2.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-olive-500 focus:ring-olive-400"
                        aria-label="전체 선택"
                      />
                    </th>
                    <th className="px-2 py-2.5 text-xs font-semibold text-gray-600 text-center w-16">ID</th>
                    <th className="px-2 py-2.5 text-xs font-semibold text-gray-600">Version</th>
                    <th className="px-2 py-2.5 text-xs font-semibold text-gray-600">Declared License</th>
                    <th className="px-2 py-2.5 text-xs font-semibold text-gray-600">Detected License</th>
                    <th className="px-2 py-2.5 text-xs font-semibold text-gray-600">Copyright</th>
                    <th className="px-2 py-2.5 text-xs font-semibold text-gray-600 text-center w-24">리뷰</th>
                    <th className="px-2 py-2.5 text-xs font-semibold text-gray-600 text-center w-24">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {versions.map((version) => (
                    <VersionItem
                      key={version.oss_version_id}
                      version={version}
                      selected={selectedIds.has(version.oss_version_id)}
                      onToggleSelect={toggleSelection}
                      onOpenReview={setReviewTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {hasUnreviewed && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={selectUnreviewed}
                  className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                >
                  리뷰 안됨만 선택
                </button>
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {reviewTarget && (
        <VersionReviewModal
          open={true}
          onClose={() => setReviewTarget(null)}
          version={reviewTarget}
          onSave={saveVersion}
          saving={updating}
        />
      )}
    </div>
  )
}
