'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { fetchOssDetail, fetchOssVersions, updateOssVersion, updateOssMaster, bulkReviewVersions } from '@/lib/api-client'
import type { OssMaster, OssVersion, OssReviewStatus } from '@/lib/types'

interface UseOssVersionsState {
  readonly ossMaster: OssMaster | null
  readonly versions: readonly OssVersion[]
  readonly loading: boolean
  readonly error: string | null
  readonly totalCount: number
  readonly currentPage: number
  readonly pageSize: number
  readonly selectedIds: ReadonlySet<number>
  readonly updating: boolean
  readonly reviewFilter: OssReviewStatus | ''
}

interface UseOssVersionsReturn extends UseOssVersionsState {
  readonly setCurrentPage: (page: number) => void
  readonly toggleSelection: (id: number) => void
  readonly toggleSelectAll: () => void
  readonly selectUnreviewed: () => void
  readonly setReviewFilter: (filter: OssReviewStatus | '') => void
  readonly updateReviewStatus: (id: number, reviewed: OssReviewStatus) => Promise<void>
  readonly updateOssMasterReview: (reviewed: OssReviewStatus) => Promise<void>
  readonly saveOssMaster: (data: Partial<OssMaster>) => Promise<void>
  readonly saveVersion: (id: number, data: Partial<OssVersion>) => Promise<void>
  readonly bulkUpdateReview: (reviewed: OssReviewStatus) => Promise<void>
  readonly refresh: () => void
}

const DEFAULT_PAGE_SIZE = 20

export function useOssVersions(ossMasterId: number): UseOssVersionsReturn {
  const { token } = useAuth()

  const [state, setState] = useState<UseOssVersionsState>({
    ossMaster: null,
    versions: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    selectedIds: new Set(),
    updating: false,
    reviewFilter: 'N',
  })

  const load = useCallback(async () => {
    if (!token) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const [masterResult, versionsResult] = await Promise.all([
        fetchOssDetail(token, ossMasterId),
        fetchOssVersions(token, {
          ossMasterId,
          reviewed: state.reviewFilter || undefined,
          page: state.currentPage,
          size: state.pageSize,
        }),
      ])

      if (!masterResult.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: masterResult.error ?? 'OSS 정보 조회 실패',
        }))
        return
      }

      if (!versionsResult.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          ossMaster: masterResult.data ?? null,
          error: versionsResult.error ?? '버전 목록 조회 실패',
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        ossMaster: masterResult.data ?? null,
        versions: versionsResult.data ?? [],
        totalCount: versionsResult.meta?.totalCount ?? 0,
        selectedIds: new Set(),
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류'
      setState((prev) => ({ ...prev, loading: false, error: message }))
    }
  }, [token, ossMasterId, state.currentPage, state.pageSize, state.reviewFilter])

  useEffect(() => {
    load()
  }, [load])

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page, selectedIds: new Set() }))
  }, [])

  const setReviewFilter = useCallback((filter: OssReviewStatus | '') => {
    setState((prev) => ({ ...prev, reviewFilter: filter, currentPage: 1, selectedIds: new Set() }))
  }, [])

  const toggleSelection = useCallback((id: number) => {
    setState((prev) => {
      const next = new Set(prev.selectedIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { ...prev, selectedIds: next }
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setState((prev) => {
      const allSelected = prev.versions.length > 0 && prev.versions.every((v) => prev.selectedIds.has(v.oss_version_id))
      if (allSelected) {
        return { ...prev, selectedIds: new Set() }
      }
      return {
        ...prev,
        selectedIds: new Set(prev.versions.map((v) => v.oss_version_id)),
      }
    })
  }, [])

  const selectUnreviewed = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIds: new Set(
        prev.versions
          .filter((v) => v.reviewed === 'N')
          .map((v) => v.oss_version_id)
      ),
    }))
  }, [])

  const updateOssMasterReview = useCallback(
    async (reviewed: OssReviewStatus) => {
      if (!token || !state.ossMaster) return

      setState((prev) => ({ ...prev, updating: true }))

      try {
        const result = await updateOssMaster(token, ossMasterId, {
          ...state.ossMaster,
          reviewed,
        })

        if (!result.success) {
          setState((prev) => ({ ...prev, updating: false, error: result.error ?? 'OSS 리뷰 업데이트 실패' }))
          return
        }

        setState((prev) => ({
          ...prev,
          updating: false,
          ossMaster: prev.ossMaster ? { ...prev.ossMaster, reviewed } : null,
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류'
        setState((prev) => ({ ...prev, updating: false, error: message }))
      }
    },
    [token, ossMasterId, state.ossMaster]
  )

  const saveOssMaster = useCallback(
    async (data: Partial<OssMaster>) => {
      if (!token || !state.ossMaster) return

      setState((prev) => ({ ...prev, updating: true }))

      try {
        const result = await updateOssMaster(token, ossMasterId, {
          ...state.ossMaster,
          ...data,
        })

        if (!result.success) {
          setState((prev) => ({ ...prev, updating: false, error: result.error ?? 'OSS 업데이트 실패' }))
          return
        }

        setState((prev) => ({
          ...prev,
          updating: false,
          ossMaster: prev.ossMaster ? { ...prev.ossMaster, ...data } : null,
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류'
        setState((prev) => ({ ...prev, updating: false, error: message }))
      }
    },
    [token, ossMasterId, state.ossMaster]
  )

  const saveVersion = useCallback(
    async (id: number, data: Partial<OssVersion>) => {
      if (!token) return

      setState((prev) => ({ ...prev, updating: true }))

      try {
        const version = state.versions.find((v) => v.oss_version_id === id)
        if (!version) return

        const result = await updateOssVersion(token, id, { ...version, ...data })

        if (!result.success) {
          setState((prev) => ({ ...prev, updating: false, error: result.error ?? '버전 업데이트 실패' }))
          return
        }

        setState((prev) => ({
          ...prev,
          updating: false,
          versions: prev.versions.map((v) =>
            v.oss_version_id === id ? { ...v, ...data } : v
          ),
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류'
        setState((prev) => ({ ...prev, updating: false, error: message }))
      }
    },
    [token, state.versions]
  )

  const updateReviewStatus = useCallback(
    async (id: number, reviewed: OssReviewStatus) => {
      if (!token) return

      setState((prev) => ({ ...prev, updating: true }))

      try {
        const version = state.versions.find((v) => v.oss_version_id === id)
        if (!version) return

        const result = await updateOssVersion(token, id, { ...version, reviewed })

        if (!result.success) {
          setState((prev) => ({ ...prev, updating: false, error: result.error ?? '업데이트 실패' }))
          return
        }

        setState((prev) => ({
          ...prev,
          updating: false,
          versions: prev.versions.map((v) =>
            v.oss_version_id === id ? { ...v, reviewed } : v
          ),
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류'
        setState((prev) => ({ ...prev, updating: false, error: message }))
      }
    },
    [token, state.versions]
  )

  const bulkUpdateReview = useCallback(
    async (reviewed: OssReviewStatus) => {
      if (!token || state.selectedIds.size === 0) return

      setState((prev) => ({ ...prev, updating: true }))

      try {
        const result = await bulkReviewVersions(token, {
          versionIds: Array.from(state.selectedIds),
          reviewed,
        })

        if (!result.success) {
          setState((prev) => ({ ...prev, updating: false, error: result.error ?? '일괄 처리 실패' }))
          return
        }

        const bulkResult = result.data
        if (bulkResult && bulkResult.failed > 0) {
          setState((prev) => ({
            ...prev,
            updating: false,
            error: `${bulkResult.succeeded}건 성공, ${bulkResult.failed}건 실패`,
          }))
        } else {
          setState((prev) => ({ ...prev, updating: false }))
        }

        await load()
      } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류'
        setState((prev) => ({ ...prev, updating: false, error: message }))
      }
    },
    [token, state.selectedIds, load]
  )

  return {
    ...state,
    setCurrentPage,
    setReviewFilter,
    toggleSelection,
    toggleSelectAll,
    selectUnreviewed,
    updateReviewStatus,
    updateOssMasterReview,
    saveOssMaster,
    saveVersion,
    bulkUpdateReview,
    refresh: load,
  }
}
