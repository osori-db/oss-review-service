'use client'

import { useOssVersions } from '@/hooks/useOssVersions'
import VersionItem from './VersionItem'
import Pagination from './Pagination'
import LoadingSkeleton from './LoadingSkeleton'
import ErrorMessage from './ErrorMessage'
import OssDetail from './OssDetail'

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
    setCurrentPage,
    toggleSelection,
    toggleSelectAll,
    updateReviewStatus,
    bulkUpdateReview,
    refresh,
  } = useOssVersions(ossMasterId)

  const allSelected = versions.length > 0 && versions.every((v) => selectedIds.has(v.oss_version_id))

  return (
    <div className="space-y-6">
      {ossMaster && <OssDetail oss={ossMaster} />}

      {error && <ErrorMessage message={error} onRetry={refresh} />}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            버전 목록
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({totalCount.toLocaleString()}건)
              </span>
            )}
          </h3>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedIds.size}건 선택
              </span>
              <button
                type="button"
                onClick={() => bulkUpdateReview('Y')}
                disabled={updating}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                일괄 리뷰 완료
              </button>
              <button
                type="button"
                onClick={() => bulkUpdateReview('N')}
                disabled={updating}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                일괄 리뷰 취소
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            버전이 없습니다.
          </div>
        ) : (
          <>
            <div className="mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                전체 선택
              </label>
            </div>

            <div className="space-y-2">
              {versions.map((version) => (
                <VersionItem
                  key={version.oss_version_id}
                  version={version}
                  selected={selectedIds.has(version.oss_version_id)}
                  updating={updating}
                  onToggleSelect={toggleSelection}
                  onUpdateReview={updateReviewStatus}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
