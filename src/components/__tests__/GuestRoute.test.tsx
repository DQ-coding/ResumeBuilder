/**
 * GuestRoute 组件测试
 *
 * @spec frontend-auth-pages
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GuestRoute from '@/components/GuestRoute'
import { useAuthStore } from '@/store/authStore'

function renderWithRouter(ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route
          path="/login"
          element={<GuestRoute>{ui}</GuestRoute>}
        />
        <Route
          path="/resumes"
          element={<div>简历列表页</div>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GuestRoute', () => {
  beforeEach(() => {
    // 重置 authStore
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
    })
  })

  it('未登录时渲染子组件', () => {
    renderWithRouter(<div>登录页</div>)
    expect(screen.getByText('登录页')).toBeInTheDocument()
  })

  it('已登录时重定向到简历列表', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'test@test.com' },
      isAuthenticated: true,
    })
    renderWithRouter(<div>登录页</div>)
    expect(screen.queryByText('登录页')).not.toBeInTheDocument()
    expect(screen.getByText('简历列表页')).toBeInTheDocument()
  })
})
