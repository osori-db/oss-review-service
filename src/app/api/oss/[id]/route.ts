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
      reviewed: raw.reviewed === 1 || raw.reviewed === '1' || raw.reviewed === 'Y' ? 'Y' as const : 'N' as const,
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
