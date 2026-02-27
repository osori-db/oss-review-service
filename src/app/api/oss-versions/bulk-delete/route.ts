import { NextRequest, NextResponse } from 'next/server'
import { externalFetch, getErrorMessage } from '@/lib/external-api'
import type { ApiResponse, BulkDeleteRequest, BulkDeleteResult } from '@/lib/types'

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BulkDeleteResult>>> {
  const token = request.headers.get('X-Auth-Token')
  if (!token) {
    return NextResponse.json(
      { success: false, error: '인증 토큰이 필요합니다.' },
      { status: 401 }
    )
  }

  try {
    const body: BulkDeleteRequest = await request.json()
    const { versionIds } = body

    if (!Array.isArray(versionIds) || versionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '버전 ID 목록이 필요합니다.' },
        { status: 400 }
      )
    }

    const results = await Promise.allSettled(
      versionIds.map(async (id) => {
        const result = await externalFetch(`/api/v2/admin/oss-versions/${id}`, token, {
          method: 'DELETE',
        })

        if (!result.success) {
          throw new Error(getErrorMessage(result.code))
        }

        return id
      })
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    const data: BulkDeleteResult = {
      total: versionIds.length,
      succeeded,
      failed,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { success: false, error: `일괄 삭제 처리 실패: ${message}` },
      { status: 500 }
    )
  }
}
