'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function AuthTokenInput() {
  const { token, setToken, clearToken, isAuthenticated } = useAuth()
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed) {
      setToken(trimmed)
      setInputValue('')
    }
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-green-700">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <span>인증됨 (토큰: ...{token?.slice(-8)})</span>
        </div>
        <button
          type="button"
          onClick={clearToken}
          className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="password"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="API 인증 토큰을 입력하세요"
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={!inputValue.trim()}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        인증
      </button>
    </form>
  )
}
