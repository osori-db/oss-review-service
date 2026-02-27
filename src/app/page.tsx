import Header from '@/components/Header'
import AuthTokenInput from '@/components/AuthTokenInput'
import OssList from '@/components/OssList'

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Header />
      <div className="mb-6">
        <AuthTokenInput />
      </div>
      <OssList />
    </main>
  )
}
