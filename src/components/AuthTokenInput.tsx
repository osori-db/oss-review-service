'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function AuthTokenInput() {
  const { setToken, isAuthenticated } = useAuth()
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
    return null
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
