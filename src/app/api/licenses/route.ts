import { NextRequest, NextResponse } from 'next/server'
import { externalFetch, getErrorMessage } from '@/lib/external-api'
import type { ApiResponse, License } from '@/lib/types'

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<readonly License[]>>> {
  const token = request.headers.get('X-Auth-Token')
  if (!token) {
    return NextResponse.json(
      { success: false, error: '인증 토큰이 필요합니다.' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') ?? ''
    const page = searchParams.get('page') ?? '0'
    const size = searchParams.get('size') ?? '20'
    const exactMatch = searchParams.get('exactMatch') !== 'false'

    const equalFlag = exactMatch ? 'Y' : 'N'
    const query = `?equalFlag=${equalFlag}&page=${page}&size=${size}&sort=id&direction=ASC`
    const nameParam = name.trim() ? `&name=${encodeURIComponent(name.trim())}` : ''

    const result = await externalFetch(
      `/api/v2/admin/licenses${query}${nameParam}`,
      token
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: getErrorMessage(result.code) },
        { status: result.code === '401' ? 401 : 502 }
      )
    }

    const messageList = result.messageList as { list?: readonly Record<string, unknown>[] | null }
    const rawList = messageList.list ?? []
    const licenses: License[] = rawList.map((item) => ({
      id: item.id as number,
      name: item.name as string,
    }))

    return NextResponse.json({ success: true, data: licenses })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { success: false, error: `라이선스 조회 실패: ${message}` },
      { status: 500 }
    )
  }
}
