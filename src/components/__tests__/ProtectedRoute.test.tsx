/**
 * ProtectedRoute 组件测试
 *
 * @spec frontend-auth-pages
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

function renderWithRouter(ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/resumes']}>
      <Routes>
        <Route
          path="/resumes"
          element={<ProtectedRoute>{ui}</ProtectedRoute>}
        />
        <Route path="/login" element={<div>登录页</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
    })
  })

  it('已登录时渲染子组件', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'test@test.com' },
      isAuthenticated: true,
    })
    renderWithRouter(<div>受保护内容</div>)
    expect(screen.getByText('受保护内容')).toBeInTheDocument()
  })

  it('未登录时重定向到登录页', () => {
    renderWithRouter(<div>受保护内容</div>)
    expect(screen.queryByText('受保护内容')).not.toBeInTheDocument()
    expect(screen.getByText('登录页')).toBeInTheDocument()
  })
})
