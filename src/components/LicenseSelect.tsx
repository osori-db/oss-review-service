'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { fetchLicenses } from '@/lib/api-client'
import type { License } from '@/lib/types'

interface LicenseSelectProps {
  readonly selectedLicenses: readonly string[]
  readonly onChange: (licenses: readonly string[]) => void
  readonly token: string
}

const DEBOUNCE_MS = 300

export default function LicenseSelect({
  selectedLicenses,
  onChange,
  token,
}: LicenseSelectProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<readonly License[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const res = await fetchLicenses(token, name, 0, 20, false)
        if (res.success && res.data) {
          setResults(res.data)
        } else {
          setResults([])
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  function handleQueryChange(value: string) {
    setQuery(value)
    setOpen(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      search(value)
    }, DEBOUNCE_MS)
  }

  function handleSelect(licenseName: string) {
    if (selectedLicenses.includes(licenseName)) {
      onChange(selectedLicenses.filter((l) => l !== licenseName))
    } else {
      onChange([...selectedLicenses, licenseName])
    }
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  function handleRemove(licenseName: string) {
    onChange(selectedLicenses.filter((l) => l !== licenseName))
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const showDropdown = open && (loading || results.length > 0 || (query.trim().length > 0 && !loading))

  return (
    <div ref={containerRef} className="relative">
      {selectedLicenses.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedLicenses.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-olive-100 text-olive-800 text-xs font-medium"
            >
              {name}
              <button
                type="button"
                onClick={() => handleRemove(name)}
                className="text-olive-500 hover:text-olive-700 transition-colors"
                aria-label={`${name} 제거`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        onFocus={() => { if (query.trim()) setOpen(true) }}
        placeholder="라이선스 검색 (예: MIT, Apache)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-olive-400 focus:border-transparent"
      />

      {showDropdown && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {loading && (
            <li className="px-3 py-2 text-sm text-gray-400">검색 중...</li>
          )}
          {!loading && results.length === 0 && query.trim().length > 0 && (
            <li className="px-3 py-2 text-sm text-gray-400">검색 결과가 없습니다</li>
          )}
          {!loading &&
            results.map((license) => {
              const isSelected = selectedLicenses.includes(license.name)
              return (
                <li key={license.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(license.name)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'bg-olive-50 text-olive-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && <span className="mr-1.5">&#10003;</span>}
                    {license.name}
                  </button>
                </li>
              )
            })}
        </ul>
      )}
    </div>
  )
}
