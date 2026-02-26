'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { fetchOssList } from '@/lib/api-client'
import type { OssMaster, OssReviewStatus } from '@/lib/types'

interface UseOssListState {
  readonly data: readonly OssMaster[]
  readonly loading: boolean
  readonly error: string | null
  readonly totalCount: number
  readonly currentPage: number
  readonly pageSize: number
  readonly searchQuery: string
  readonly reviewFilter: OssReviewStatus | ''
}

interface UseOssListReturn extends UseOssListState {
  readonly setSearchQuery: (query: string) => void
  readonly setReviewFilter: (filter: OssReviewStatus | '') => void
  readonly setCurrentPage: (page: number) => void
  readonly refresh: () => void
}

const DEFAULT_PAGE_SIZE = 20

export function useOssList(): UseOssListReturn {
  const { token } = useAuth()

  const [state, setState] = useState<UseOssListState>({
    data: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    searchQuery: '',
    reviewFilter: '',
  })

  const load = useCallback(async () => {
    if (!token) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await fetchOssList(token, {
        ossName: state.searchQuery || undefined,
        reviewed: state.reviewFilter || undefined,
        page: state.currentPage,
        size: state.pageSize,
      })

      if (!result.success) {
        setState((prev) => ({ ...prev, loading: false, error: result.error ?? '조회 실패' }))
        return
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        data: result.data ?? [],
        totalCount: result.meta?.totalCount ?? 0,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류'
      setState((prev) => ({ ...prev, loading: false, error: message }))
    }
  }, [token, state.searchQuery, state.reviewFilter, state.currentPage, state.pageSize])

  useEffect(() => {
    load()
  }, [load])

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query, currentPage: 1 }))
  }, [])

  const setReviewFilter = useCallback((filter: OssReviewStatus | '') => {
    setState((prev) => ({ ...prev, reviewFilter: filter, currentPage: 1 }))
  }, [])

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }))
  }, [])

  return {
    ...state,
    setSearchQuery,
    setReviewFilter,
    setCurrentPage,
    refresh: load,
  }
}
