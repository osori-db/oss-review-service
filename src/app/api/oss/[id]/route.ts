import { NextRequest, NextResponse } from 'next/server'
import { externalFetch, getErrorMessage } from '@/lib/external-api'
import type { ApiResponse, OssMaster } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<OssMaster>>> {
  const token = request.headers.get('X-Auth-Token')
  if (!token) {
    return NextResponse.json(
      { success: false, error: '인증 토큰이 필요합니다.' },
      { status: 401 }
    )
  }

  const { id } = await params

  try {
    const result = await externalFetch(`/api/v2/admin/oss/${id}`, token)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: getErrorMessage(result.code) },
        { status: result.code === '401' ? 401 : 502 }
      )
    }

    const messageList = result.messageList as Record<string, unknown>
    const raw = (messageList.detailInfo ?? messageList) as Record<string, unknown>
    const oss = {
      oss_master_id: raw.oss_master_id as number,
      oss_name: (raw.oss_name ?? raw.name ?? '') as string,
      oss_nickname: (raw.oss_nickname ?? (Array.isArray(raw.nicknameList) ? (raw.nicknameList as string[])[0] : '') ?? '') as string,
      homepage: (raw.homepage ?? '') as string,
      description: (raw.description ?? '') as string,
      description_ko: (raw.description_ko ?? '') as string,
      publisher: (raw.publisher ?? '') as string,
      download_location: (raw.download_location ?? '') as string,
      reviewed: raw.reviewed === 1 || raw.reviewed === '1' || raw.reviewed === 'Y' || raw.reviewed === true || raw.reviewed === 'true' ? 'Y' as const : 'N' as const,
      version_license_diff: String(raw.version_license_diff ?? ''),
      attribution: (raw.attribution ?? '') as string,
      compliance_notice: (raw.compliance_notice ?? '') as string,
      compliance_notice_ko: (raw.compliance_notice_ko ?? '') as string,
      created_date: (raw.created_date ?? '') as string,
      modified_date: (raw.modified_date ?? '') as string,
    }

    return NextResponse.json({ success: true, data: oss as unknown as OssMaster })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { success: false, error: `OSS 상세 조회 실패: ${message}` },
      { status: 500 }
    )
  }
}

function toExternalReviewed(value: unknown): string {
  if (value === 'Y' || value === 1 || value === '1' || value === true || value === 'true') return 'true'
  return 'false'
}

function buildExternalOssBody(
  raw: Record<string, unknown>,
  body: Record<string, unknown>
): Record<string, unknown> {
  const nicknameList = body.oss_nickname !== undefined
    ? [body.oss_nickname]
    : (raw.nicknameList ?? [])
  const downloadLocationList = raw.downloadLocationList ?? (
    raw.download_location ? [raw.download_location] : []
  )

  return {
    name: raw.oss_name ?? raw.name ?? '',
    homepage: body.homepage ?? raw.homepage ?? '',
    description: body.description ?? raw.description ?? '',
    attribution: raw.attribution ?? '',
    publisher: raw.publisher ?? '',
    downloadLocationList,
    nicknameList,
    download_location: raw.download_location ?? '',
    compliance_notice: raw.compliance_notice ?? '',
    compliance_notice_ko: raw.compliance_notice_ko ?? '',
    version_license_diff: String(raw.version_license_diff ?? ''),
    reviewed: body.reviewed !== undefined
      ? toExternalReviewed(body.reviewed)
      : toExternalReviewed(raw.reviewed),
    ignore_flag: raw.ignore_flag ?? 'N',
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<OssMaster>>> {
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

    const getResult = await externalFetch(`/api/v2/admin/oss/${id}`, token)
    if (!getResult.success) {
      return NextResponse.json(
        { success: false, error: getErrorMessage(getResult.code) },
        { status: getResult.code === '401' ? 401 : 502 }
      )
    }

    const messageList = getResult.messageList as Record<string, unknown>
    const raw = (messageList.detailInfo ?? messageList) as Record<string, unknown>
    const externalBody = buildExternalOssBody(raw, body)

    const result = await externalFetch(`/api/v2/admin/oss/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(externalBody),
    })

    if (!result.success) {
      console.error(`[PUT /api/oss/${id}] External API error:`, result.code, result.messageList)
      return NextResponse.json(
        { success: false, error: getErrorMessage(result.code) },
        { status: result.code === '401' ? 401 : 502 }
      )
    }

    const oss = result.messageList as unknown as OssMaster

    return NextResponse.json({ success: true, data: oss })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { success: false, error: `OSS 수정 실패: ${message}` },
      { status: 500 }
    )
  }
}
