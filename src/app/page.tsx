import AuthTokenInput from '@/components/AuthTokenInput'
import OssList from '@/components/OssList'

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">OSS 리뷰 관리</h1>
        <p className="text-gray-500 mt-1 text-sm">
          OSS 버전별 리뷰 상태를 확인하고 관리합니다.
        </p>
      </header>
      <div className="mb-6">
        <AuthTokenInput />
      </div>
      <OssList />
    </main>
  )
}
