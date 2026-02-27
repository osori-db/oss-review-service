import Link from 'next/link'
import StatusBadge from './StatusBadge'
import type { OssMaster } from '@/lib/types'

interface OssListItemProps {
  readonly oss: OssMaster
}

function purlToUrl(purl: string): string {
  if (!purl) return ''
  const match = purl.match(/^pkg:github\/(.+)$/)
  if (match) return `https://github.com/${match[1]}`
  const npmMatch = purl.match(/^pkg:npm\/(.+)$/)
  if (npmMatch) return `https://www.npmjs.com/package/${npmMatch[1]}`
  const pypiMatch = purl.match(/^pkg:pypi\/(.+)$/)
  if (pypiMatch) return `https://pypi.org/project/${pypiMatch[1]}`
  return purl
}

export default function OssListItem({ oss }: OssListItemProps) {
  const url = purlToUrl(oss.purl ?? '')

  return (
    <tr className="border-b border-gray-100 hover:bg-olive-50/50 transition-colors">
      <td className="px-3 py-2.5 text-xs text-gray-500 text-center">
        {oss.oss_master_id}
      </td>
      <td className="px-3 py-2.5">
        <Link
          href={`/oss/${oss.oss_master_id}`}
          className="text-sm font-medium text-olive-600 hover:text-olive-800 hover:underline"
        >
          {oss.oss_name}
        </Link>
        {oss.oss_nickname && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{oss.oss_nickname}</p>
        )}
      </td>
      <td className="px-3 py-2.5 max-w-[200px]">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-blue-600 truncate block"
            title={url}
          >
            {url}
          </a>
        ) : (
          <span className="text-xs text-gray-300">-</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-center">
        {oss.versions ? (
          <span className={`text-xs font-medium ${
            oss.versions.reviewed_count < oss.versions.total_count
              ? 'text-amber-600'
              : 'text-olive-500'
          }`}>
            {oss.versions.reviewed_count}/{oss.versions.total_count}
          </span>
        ) : (
          <span className="text-xs text-gray-300">-</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-center">
        <StatusBadge status={oss.reviewed} />
      </td>
    </tr>
  )
}
