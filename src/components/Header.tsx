'use client'

import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const { userInfo, isAuthenticated } = useAuth()

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">OSS 리뷰 관리</h1>
        <p className="text-gray-500 mt-1 text-sm">
          OSS 버전별 리뷰 상태를 확인하고 관리합니다.
        </p>
      </div>
      {isAuthenticated && userInfo && (
        <div className="text-right text-sm">
          <p className="font-medium text-gray-900">{userInfo.userId}</p>
          <p className="text-gray-500">{userInfo.companyName}</p>
        </div>
      )}
    </header>
  )
}
