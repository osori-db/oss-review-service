import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('리뷰 완료 상태를 올바르게 표시한다', () => {
    render(<StatusBadge status="Y" />)
    expect(screen.getByText('리뷰 완료')).toBeInTheDocument()
  })

  it('미리뷰 상태를 올바르게 표시한다', () => {
    render(<StatusBadge status="N" />)
    expect(screen.getByText('미리뷰')).toBeInTheDocument()
  })
})
