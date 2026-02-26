import { NextRequest, NextResponse } from 'next/server'
import { externalFetch, getErrorMessage } from '@/lib/external-api'
import type { ApiResponse, BulkReviewRequest, BulkReviewResult, OssVersion } from '@/lib/types'

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BulkReviewResult>>> {
  const token = request.headers.get('X-Auth-Token')
  if (!token) {
    return NextResponse.json(
      { success: false, error: '인증 토큰이 필요합니다.' },
      { status: 401 }
    )
  }

  try {
    const body: BulkReviewRequest = await request.json()
    const { versionIds, reviewed } = body

    if (!Array.isArray(versionIds) || versionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '버전 ID 목록이 필요합니다.' },
        { status: 400 }
      )
    }

    if (reviewed !== 'Y' && reviewed !== 'N') {
      return NextResponse.json(
        { success: false, error: '리뷰 상태는 Y 또는 N이어야 합니다.' },
        { status: 400 }
      )
    }

    const results = await Promise.allSettled(
      versionIds.map(async (id) => {
        const getResult = await externalFetch(`/api/v2/admin/oss-versions/${id}`, token)

        if (!getResult.success) {
          throw new Error(getErrorMessage(getResult.code))
        }

        const currentVersion = getResult.messageList as unknown as OssVersion
        const updatedVersion = { ...currentVersion, reviewed }

        const putResult = await externalFetch(`/api/v2/admin/oss-versions/${id}`, token, {
          method: 'PUT',
          body: JSON.stringify(updatedVersion),
        })

        if (!putResult.success) {
          throw new Error(getErrorMessage(putResult.code))
        }

        return id
      })
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    const result: BulkReviewResult = {
      total: versionIds.length,
      succeeded,
      failed,
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { success: false, error: `일괄 리뷰 처리 실패: ${message}` },
      { status: 500 }
    )
  }
}
