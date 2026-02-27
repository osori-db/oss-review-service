import { NextRequest, NextResponse } from 'next/server'
import { externalFetch, buildQueryString, getErrorMessage } from '@/lib/external-api'
import type { ApiResponse, OssVersion } from '@/lib/types'

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<readonly OssVersion[]>>> {
  const token = request.headers.get('X-Auth-Token')
  if (!token) {
    return NextResponse.json(
      { success: false, error: '인증 토큰이 필요합니다.' },
      { status: 401 }
    )
  }

  const { searchParams } = request.nextUrl
  const ossMasterId = searchParams.get('ossMasterId')

  if (!ossMasterId) {
    return NextResponse.json(
      { success: false, error: 'ossMasterId는 필수 파라미터입니다.' },
      { status: 400 }
    )
  }

  const clientPage = Number(searchParams.get('page') ?? '1')
  const apiPage = clientPage > 0 ? clientPage - 1 : 0

  const query = buildQueryString({
    ossMasterId,
    version: searchParams.get('version'),
    reviewed: searchParams.get('reviewed'),
    equalFlag: searchParams.get('equalFlag') ?? 'N',
    page: String(apiPage),
    size: searchParams.get('size') ?? '20',
    sort: searchParams.get('sort') ?? 'version',
    direction: searchParams.get('direction') ?? 'ASC',
  })

  try {
    const result = await externalFetch(`/api/v2/admin/oss-versions${query}`, token)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: getErrorMessage(result.code) },
        { status: result.code === '401' ? 401 : 502 }
      )
    }

    const messageList = result.messageList as Record<string, unknown>
    const rawList = (messageList.list ?? messageList.ossVersionList ?? messageList.content ?? []) as readonly Record<string, unknown>[]
    const totalCount = (messageList.count ?? messageList.totalCount ?? messageList.totalElements ?? 0) as number

    const versions = rawList.map((item) => ({
      ...item,
      reviewed: item.reviewed === 1 || item.reviewed === '1' || item.reviewed === 'Y' ? 'Y' as const : 'N' as const,
    })) as unknown as readonly OssVersion[]

    return NextResponse.json({
      success: true,
      data: versions,
      meta: {
        totalCount,
        currentPage: Number(searchParams.get('page') ?? 0),
        pageSize: Number(searchParams.get('size') ?? 20),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { success: false, error: `버전 목록 조회 실패: ${message}` },
      { status: 500 }
    )
  }
}
