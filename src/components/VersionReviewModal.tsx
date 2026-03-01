'use client'

import { useState } from 'react'
import Modal from './Modal'
import LicenseSelect from './LicenseSelect'
import { useAuth } from '@/hooks/useAuth'
import type { OssVersion, OssReviewStatus } from '@/lib/types'

interface VersionReviewModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly version: OssVersion
  readonly onSave: (id: number, updated: Partial<OssVersion>) => Promise<void>
  readonly saving?: boolean
}

function formatLicenseList(list: readonly string[] | null): string {
  if (!list || list.length === 0) return ''
  return list.join(', ')
}

const FIELD_LABEL = 'block text-xs font-medium text-gray-500 mb-1'
const TEXT_INPUT =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-olive-400 focus:border-transparent'
const TEXTAREA = `${TEXT_INPUT} resize-none`

export default function VersionReviewModal({
  open,
  onClose,
  version,
  onSave,
  saving = false,
}: VersionReviewModalProps) {
  const { token } = useAuth()
  const [description, setDescription] = useState(version.description ?? '')
  const [descriptionKo, setDescriptionKo] = useState(version.description_ko ?? '')
  const [declaredLicenses, setDeclaredLicenses] = useState<readonly string[]>(
    version.declaredLicenseList ?? []
  )
  const [detectedLicenses] = useState(
    formatLicenseList(version.detectedLicenseList)
  )
  const [copyright, setCopyright] = useState(version.copyright ?? '')
  const [reviewed, setReviewed] = useState<OssReviewStatus>(version.reviewed)

  async function handleSave() {
    await onSave(version.oss_version_id, {
      ...version,
      description,
      description_ko: descriptionKo,
      declaredLicenseList: declaredLicenses,
      copyright,
      reviewed,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`버전 리뷰 — ${version.version || '(버전 없음)'}`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={FIELD_LABEL}>Version ID</label>
            <p className="text-sm text-gray-900">{version.oss_version_id}</p>
          </div>
          <div>
            <label className={FIELD_LABEL}>Version</label>
            <p className="text-sm font-medium text-gray-900">
              {version.version || '(버전 없음)'}
            </p>
          </div>
        </div>

        <fieldset>
          <legend className={FIELD_LABEL}>리뷰 상태</legend>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="version-reviewed"
                checked={reviewed === 'Y'}
                onChange={() => setReviewed('Y')}
                className="h-4 w-4 text-olive-500 border-gray-300 focus:ring-olive-400"
              />
              <span className="text-sm text-gray-700">리뷰 완료</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="version-reviewed"
                checked={reviewed === 'N'}
                onChange={() => setReviewed('N')}
                className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">리뷰 안됨</span>
            </label>
          </div>
        </fieldset>

        <div>
          <label className={FIELD_LABEL}>Declared License</label>
          {token ? (
            <LicenseSelect
              selectedLicenses={declaredLicenses}
              onChange={setDeclaredLicenses}
              token={token}
            />
          ) : (
            <p className="text-sm text-gray-400">토큰이 없어 라이선스 검색을 사용할 수 없습니다.</p>
          )}
        </div>

        <div>
          <label className={FIELD_LABEL}>Detected License</label>
          <input
            type="text"
            value={detectedLicenses}
            disabled
            className={`${TEXT_INPUT} bg-gray-100 text-gray-500 cursor-not-allowed`}
          />
        </div>

        <div>
          <label className={FIELD_LABEL}>Copyright</label>
          <input
            type="text"
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)}
            className={TEXT_INPUT}
          />
        </div>

        <div>
          <label className={FIELD_LABEL}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={TEXTAREA}
          />
        </div>

        <div>
          <label className={FIELD_LABEL}>설명 (한국어)</label>
          <textarea
            value={descriptionKo}
            onChange={(e) => setDescriptionKo(e.target.value)}
            rows={3}
            className={TEXTAREA}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-olive-500 text-white hover:bg-olive-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
