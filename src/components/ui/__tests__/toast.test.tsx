import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToastProvider, Toast, ToastTitle, ToastViewport } from '../toast'

describe('Toast Component', () => {
  it('renders ToastProvider with children', () => {
    const children = <div>Test Content</div>
    render(
      <ToastProvider>
        {children}
      </ToastProvider>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders ToastViewport with correct role', () => {
    render(
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    )
    
    expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument()
  })
})
