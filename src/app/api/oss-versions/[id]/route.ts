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

function toExternalReviewed(value: unknown): string {
  if (value === 'Y' || value === 1 || value === '1' || value === true || value === 'true') return 'true'
  return 'false'
}

function buildExternalVersionBody(
  raw: Record<string, unknown>,
  body: Record<string, unknown>
): Record<string, unknown> {
  return {
    version: raw.version ?? '',
    description: body.description ?? raw.description ?? '',
    description_ko: body.description_ko ?? raw.description_ko ?? '',
    attribution: raw.attribution ?? '',
    copyright: body.copyright ?? raw.copyright ?? '',
    declaredLicenseList: raw.declaredLicenseList ?? [],
    detectedLicenseList: raw.detectedLicenseList ?? [],
    restrictionList: raw.restrictionList ?? [],
    oss_master_id: raw.oss_master_id,
    license_combination: raw.license_combination ?? 'AND',
    release_date: raw.release_date ?? '',
    reviewed: body.reviewed !== undefined
      ? toExternalReviewed(body.reviewed)
      : toExternalReviewed(raw.reviewed),
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

    const getResult = await externalFetch(`/api/v2/admin/oss-versions/${id}`, token)
    if (!getResult.success) {
      return NextResponse.json(
        { success: false, error: getErrorMessage(getResult.code) },
        { status: getResult.code === '401' ? 401 : 502 }
      )
    }

    const raw = getResult.messageList as Record<string, unknown>
    const externalBody = buildExternalVersionBody(raw, body)

    const result = await externalFetch(`/api/v2/admin/oss-versions/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(externalBody),
    })

    if (!result.success) {
      console.error(`[PUT /api/oss-versions/${id}] External API error:`, result.code, result.messageList)
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
