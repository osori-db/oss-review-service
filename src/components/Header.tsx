'use client'

import { useAuth } from '@/hooks/useAuth'

function UserInitial({ name }: { readonly name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
      {initial}
    </div>
  )
}

export default function Header() {
  const { userInfo, clearToken, isAuthenticated } = useAuth()

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">OSS 리뷰 관리</h1>
        <p className="text-gray-500 mt-1 text-sm">
          OSS 버전별 리뷰 상태를 확인하고 관리합니다.
        </p>
      </div>
      {isAuthenticated && userInfo && (
        <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white pl-1.5 pr-3 py-1.5 shadow-sm">
          <UserInitial name={userInfo.userId} />
          <div className="text-sm leading-tight">
            <p className="font-medium text-gray-900">{userInfo.userId}</p>
            <p className="text-xs text-gray-400">{userInfo.companyName}</p>
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <button
            type="button"
            onClick={clearToken}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </header>
  )
}
