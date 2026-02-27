import Link from 'next/link'
import Header from '@/components/Header'
import AuthTokenInput from '@/components/AuthTokenInput'
import VersionList from '@/components/VersionList'

interface OssDetailPageProps {
  readonly params: Promise<{ id: string }>
}

export default async function OssDetailPage({ params }: OssDetailPageProps) {
  const { id } = await params
  const ossMasterId = Number(id)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Header />
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; OSS 목록으로 돌아가기
        </Link>
      </div>
      <div className="mb-6">
        <AuthTokenInput />
      </div>
      <VersionList ossMasterId={ossMasterId} />
    </main>
  )
}
