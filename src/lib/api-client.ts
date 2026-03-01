import type {
  ApiResponse,
  BulkDeleteRequest,
  BulkDeleteResult,
  License,
  OssListParams,
  OssMaster,
  OssVersion,
  OssVersionListParams,
  UserInfo,
} from './types'

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
      ...options.headers,
    },
  })

  const data: ApiResponse<T> = await response.json()
  return data
}

function toQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export async function fetchOssList(
  token: string,
  params: OssListParams = {}
): Promise<ApiResponse<readonly OssMaster[]>> {
  const qs = toQueryString(params as unknown as Record<string, unknown>)
  return apiFetch<readonly OssMaster[]>(`/api/oss${qs}`, token)
}

export async function fetchOssDetail(
  token: string,
  id: number
): Promise<ApiResponse<OssMaster>> {
  return apiFetch<OssMaster>(`/api/oss/${id}`, token)
}

export async function fetchOssVersions(
  token: string,
  params: OssVersionListParams
): Promise<ApiResponse<readonly OssVersion[]>> {
  const qs = toQueryString(params as unknown as Record<string, unknown>)
  return apiFetch<readonly OssVersion[]>(`/api/oss-versions${qs}`, token)
}

export async function fetchOssVersion(
  token: string,
  id: number
): Promise<ApiResponse<OssVersion>> {
  return apiFetch<OssVersion>(`/api/oss-versions/${id}`, token)
}

export async function updateOssVersion(
  token: string,
  id: number,
  data: Partial<OssVersion>
): Promise<ApiResponse<OssVersion>> {
  return apiFetch<OssVersion>(`/api/oss-versions/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function updateOssMaster(
  token: string,
  id: number,
  data: Partial<OssMaster>
): Promise<ApiResponse<OssMaster>> {
  return apiFetch<OssMaster>(`/api/oss/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function parseUserInfoFromToken(token: string): UserInfo | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return {
      userId: payload.userId ?? '',
      companyName: payload.companyName ?? '',
      key: payload.key ?? '',
    }
  } catch {
    return null
  }
}

export async function fetchLicenses(
  token: string,
  name: string,
  page: number = 0,
  size: number = 20,
  exactMatch: boolean = false,
): Promise<ApiResponse<readonly License[]>> {
  const params = new URLSearchParams({
    name,
    page: String(page),
    size: String(size),
    exactMatch: String(exactMatch),
  })
  return apiFetch<readonly License[]>(`/api/licenses?${params}`, token)
}

export async function bulkDeleteVersions(
  token: string,
  versionIds: readonly number[]
): Promise<ApiResponse<BulkDeleteResult>> {
  const request: BulkDeleteRequest = { versionIds }
  return apiFetch<BulkDeleteResult>('/api/oss-versions/bulk-delete', token, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
