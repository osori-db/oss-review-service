import { NextRequest, NextResponse } from 'next/server'
import { externalFetch, buildQueryString, getErrorMessage } from '@/lib/external-api'
import type { ApiResponse, OssMaster } from '@/lib/types'

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<readonly OssMaster[]>>> {
  const token = request.headers.get('X-Auth-Token')
  if (!token) {
    return NextResponse.json(
      { success: false, error: '인증 토큰이 필요합니다.' },
      { status: 401 }
    )
  }

  const { searchParams } = request.nextUrl
  const query = buildQueryString({
    ossName: searchParams.get('ossName'),
    reviewed: searchParams.get('reviewed'),
    equalFlag: searchParams.get('equalFlag') ?? 'N',
    page: searchParams.get('page') ?? '0',
    size: searchParams.get('size') ?? '20',
    sort: searchParams.get('sort') ?? 'name',
    direction: searchParams.get('direction') ?? 'ASC',
  })

  try {
    const result = await externalFetch(`/api/v2/admin/oss${query}`, token)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: getErrorMessage(result.code) },
        { status: result.code === '401' ? 401 : 502 }
      )
    }

    const messageList = result.messageList as Record<string, unknown>
    const ossList = (messageList.ossList ?? messageList.content ?? []) as OssMaster[]
    const totalCount = (messageList.totalCount ?? messageList.totalElements ?? 0) as number

    return NextResponse.json({
      success: true,
      data: ossList,
      meta: {
        totalCount,
        currentPage: Number(searchParams.get('page') ?? 0),
        pageSize: Number(searchParams.get('size') ?? 20),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { success: false, error: `OSS 목록 조회 실패: ${message}` },
      { status: 500 }
    )
  }
}
