export type OssReviewStatus = 'Y' | 'N'

export const REVIEW_STATUS_LABELS: Record<OssReviewStatus, string> = {
  Y: '리뷰 완료',
  N: '미리뷰',
}

export interface OssMaster {
  readonly oss_master_id: number
  readonly oss_name: string
  readonly oss_nickname: string
  readonly homepage: string
  readonly description: string
  readonly description_ko: string
  readonly publisher: string
  readonly download_location: string
  readonly downloadLocationList: readonly string[]
  readonly nicknameList: readonly string[]
  readonly attribution: string
  readonly compliance_notice: string
  readonly compliance_notice_ko: string
  readonly version_license_diff: string
  readonly reviewed: OssReviewStatus
  readonly ignore_flag: string
  readonly created_date: string
  readonly modified_date: string
}

export interface OssVersion {
  readonly oss_version_id: number
  readonly oss_master_id: number
  readonly version: string
  readonly description: string
  readonly description_ko: string
  readonly attribution: string
  readonly copyright: string
  readonly declaredLicenseList: readonly string[] | null
  readonly detectedLicenseList: readonly string[] | null
  readonly restrictionList: readonly string[] | null
  readonly license_combination: 'AND' | 'OR'
  readonly release_date: string
  readonly reviewed: OssReviewStatus
  readonly created_date: string
  readonly modified_date: string
}

export interface ExternalApiResponse {
  readonly code: string
  readonly messageList: Record<string, unknown>
  readonly success: boolean
}

export interface ApiResponse<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
  readonly meta?: {
    readonly totalCount: number
    readonly currentPage: number
    readonly pageSize: number
  }
}

export interface OssListParams {
  readonly ossName?: string
  readonly reviewed?: OssReviewStatus
  readonly page?: number
  readonly size?: number
  readonly sort?: string
  readonly direction?: 'ASC' | 'DESC'
}

export interface OssVersionListParams {
  readonly ossMasterId: number
  readonly version?: string
  readonly reviewed?: OssReviewStatus
  readonly page?: number
  readonly size?: number
  readonly sort?: string
  readonly direction?: 'ASC' | 'DESC'
}

export interface BulkReviewRequest {
  readonly versionIds: readonly number[]
  readonly reviewed: OssReviewStatus
}

export interface BulkReviewResult {
  readonly total: number
  readonly succeeded: number
  readonly failed: number
}

export interface UserInfo {
  readonly userId: string
  readonly companyName: string
  readonly key: string
}
