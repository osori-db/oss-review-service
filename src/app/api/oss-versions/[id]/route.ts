import { NextRequest, NextResponse } from 'next/server'
import { externalFetch, getErrorMessage } from '@/lib/external-api'
import type { ApiResponse, OssVersion } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<OssVersion>>> {
  const token = request.headers.get('X-Auth-Token')
  if (!token) {
    return NextResponse.json(
      { success: false, error: '인증 토큰이 필요합니다.' },
      { status: 401 }
    )
  }

  const { id } = await params

  try {
    const result = await externalFetch(`/api/v2/admin/oss-versions/${id}`, token)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: getErrorMessage(result.code) },
        { status: result.code === '401' ? 401 : 502 }
      )
    }

    const version = result.messageList as unknown as OssVersion

    return NextResponse.json({ success: true, data: version })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { success: false, error: `버전 상세 조회 실패: ${message}` },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<OssVersion>>> {
  const token = request.headers.get('X-Auth-Token')
  if (!token) {
    return NextResponse.json(
      { success: false, error: '인증 토큰이 필요합니다.' },
      { status: 401 }
    )
  }

  const { id } = await params

  try {
    const body = await request.json()

    const result = await externalFetch(`/api/v2/admin/oss-versions/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: getErrorMessage(result.code) },
        { status: result.code === '401' ? 401 : 502 }
      )
    }

    const version = result.messageList as unknown as OssVersion

    return NextResponse.json({ success: true, data: version })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { success: false, error: `버전 수정 실패: ${message}` },
      { status: 500 }
    )
  }
}
