'use client'

import { useState, useEffect } from 'react'
import { useOssList } from '@/hooks/useOssList'
import { useAuth } from '@/hooks/useAuth'
import OssListItem from './OssListItem'
import Pagination from './Pagination'
import LoadingSkeleton from './LoadingSkeleton'
import ErrorMessage from './ErrorMessage'
import type { OssReviewStatus } from '@/lib/types'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function OssList() {
  const { isAuthenticated } = useAuth()
  const {
    data,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    setSearchQuery,
    setReviewFilter,
    setCurrentPage,
    refresh,
  } = useOssList()

  const [localSearch, setLocalSearch] = useState('')
  const debouncedSearch = useDebounce(localSearch, 300)

  useEffect(() => {
    setSearchQuery(debouncedSearch)
  }, [debouncedSearch, setSearchQuery])

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 text-gray-500">
        API 토큰을 입력하면 OSS 목록을 조회할 수 있습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="OSS 이름으로 검색..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          onChange={(e) => setReviewFilter(e.target.value as OssReviewStatus | '')}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체</option>
          <option value="Y">리뷰 완료</option>
          <option value="N">미리뷰</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} onRetry={refresh} />}

      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          검색 결과가 없습니다.
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            총 {totalCount.toLocaleString()}건
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-600 text-center w-20">ID</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-600">Name</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-600">URL</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-600 text-center w-24">리뷰</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((oss) => (
                  <OssListItem key={oss.oss_master_id} oss={oss} />
                ))}
              </tbody>
            </table>
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
  )
}
