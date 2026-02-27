import { NextRequest, NextResponse } from 'next/server'
import { externalFetch, buildQueryString, getErrorMessage } from '@/lib/external-api'
import type { ApiResponse, OssMaster } from '@/lib/types'

function toReviewStatus(value: unknown): 'Y' | 'N' {
  return value === 1 || value === '1' || value === 'Y' ? 'Y' : 'N'
}

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
  const clientPage = Number(searchParams.get('page') ?? '1')
  const apiPage = clientPage > 0 ? clientPage - 1 : 0

  const query = buildQueryString({
    ossName: searchParams.get('ossName'),
    reviewed: searchParams.get('reviewed'),
    equalFlag: searchParams.get('equalFlag') ?? 'N',
    page: String(apiPage),
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
    const rawList = (messageList.list ?? messageList.ossList ?? messageList.content ?? []) as readonly Record<string, unknown>[]
    const totalCount = (messageList.count ?? messageList.totalCount ?? messageList.totalElements ?? 0) as number

    const ossList = rawList.map((item) => ({
      oss_master_id: item.oss_master_id as number,
      oss_name: (item.oss_name ?? item.name ?? '') as string,
      reviewed: toReviewStatus(item.reviewed),
      version_license_diff: String(item.version_license_diff ?? ''),
      oss_nickname: (item.oss_nickname ?? '') as string,
      publisher: (item.publisher ?? '') as string,
      purl: (item.purl ?? '') as string,
      versions: item.versions
        ? {
            total_count: ((item.versions as Record<string, unknown>).total_count as number) ?? 0,
            reviewed_count: ((item.versions as Record<string, unknown>).reviewed_count as number) ?? 0,
          }
        : undefined,
    })) as unknown as readonly OssMaster[]

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
