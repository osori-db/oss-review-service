import type { ExternalApiResponse } from './types'

const EXTERNAL_API_BASE = 'https://olis.or.kr:16443'
const REQUEST_TIMEOUT_MS = 30_000

export async function externalFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<ExternalApiResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${EXTERNAL_API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (response.status === 401) {
      return { code: '401', messageList: {}, success: false }
    }

    if (response.status === 403) {
      return { code: '403', messageList: {}, success: false }
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return {
        code: String(response.status),
        messageList: { error: text },
        success: false,
      }
    }

    if (response.status === 204) {
      return { code: '204', messageList: {}, success: true }
    }

    const data: ExternalApiResponse = await response.json()
    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { code: 'TIMEOUT', messageList: {}, success: false }
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export function getErrorMessage(code: string): string {
  switch (code) {
    case '401':
      return '인증 정보가 유효하지 않습니다. 토큰을 확인해주세요.'
    case '403':
      return '접근 권한이 없습니다.'
    case 'TIMEOUT':
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.'
    default:
      return `요청 처리에 실패했습니다. (코드: ${code})`
  }
}
