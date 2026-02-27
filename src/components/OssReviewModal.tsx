'use client'

import { useState } from 'react'
import Modal from './Modal'
import type { OssMaster, OssReviewStatus } from '@/lib/types'

interface OssReviewModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly oss: OssMaster
  readonly onSave: (updated: Partial<OssMaster>) => Promise<void>
  readonly saving?: boolean
}

const FIELD_LABEL = 'block text-xs font-medium text-gray-500 mb-1'
const TEXT_INPUT =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-olive-400 focus:border-transparent'
const TEXTAREA = `${TEXT_INPUT} resize-none`

export default function OssReviewModal({
  open,
  onClose,
  oss,
  onSave,
  saving = false,
}: OssReviewModalProps) {
  const [nickname, setNickname] = useState(oss.oss_nickname ?? '')
  const [homepage, setHomepage] = useState(oss.homepage ?? '')
  const [description, setDescription] = useState(oss.description ?? '')
  const [descriptionKo, setDescriptionKo] = useState(oss.description_ko ?? '')
  const [reviewed, setReviewed] = useState<OssReviewStatus>(oss.reviewed)

  async function handleSave() {
    await onSave({
      ...oss,
      oss_nickname: nickname,
      homepage,
      description,
      description_ko: descriptionKo,
      reviewed,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`OSS 리뷰 — ${oss.oss_name}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={FIELD_LABEL}>ID</label>
            <p className="text-sm text-gray-900">{oss.oss_master_id}</p>
          </div>
          <div>
            <label className={FIELD_LABEL}>Name</label>
            <p className="text-sm font-medium text-gray-900">{oss.oss_name}</p>
          </div>
        </div>

        <fieldset>
          <legend className={FIELD_LABEL}>리뷰 상태</legend>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="oss-reviewed"
                checked={reviewed === 'Y'}
                onChange={() => setReviewed('Y')}
                className="h-4 w-4 text-olive-500 border-gray-300 focus:ring-olive-400"
              />
              <span className="text-sm text-gray-700">리뷰 완료</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="oss-reviewed"
                checked={reviewed === 'N'}
                onChange={() => setReviewed('N')}
                className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">리뷰 안됨</span>
            </label>
          </div>
        </fieldset>

        <div>
          <label className={FIELD_LABEL}>Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={TEXT_INPUT}
          />
        </div>

        <div>
          <label className={FIELD_LABEL}>Homepage</label>
          <input
            type="text"
            value={homepage}
            onChange={(e) => setHomepage(e.target.value)}
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
