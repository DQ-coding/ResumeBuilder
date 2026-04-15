/**
 * Login 页面测试
 *
 * @spec frontend-auth-pages
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Login from '@/pages/Login'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase'

/** 渲染 Login 页面，带路由环境 */
function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<div>注册页</div>} />
        <Route path="/resumes" element={<div>简历列表</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Login 页面', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
    })
    vi.restoreAllMocks()
  })

  it('渲染邮箱和密码输入框及登录按钮', () => {
    renderLogin()
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
  })

  it('显示注册链接', () => {
    renderLogin()
    expect(screen.getByText('注册')).toBeInTheDocument()
  })

  it('空表单提交显示验证错误', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
    expect(screen.getByText('请输入密码')).toBeInTheDocument()
  })

  it('无效邮箱格式显示错误', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText('邮箱'), 'invalid')
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(screen.getByText('邮箱格式不正确')).toBeInTheDocument()
  })

  it('API 错误时显示错误提示', async () => {
    const user = userEvent.setup()
    // Mock Supabase auth 失败
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error('邮箱或密码错误'),
    })

    renderLogin()
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), 'password123')
    await user.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      expect(screen.getByText('邮箱或密码错误')).toBeInTheDocument()
    })
  })

  it('输入时清除对应字段的验证错误', async () => {
    const user = userEvent.setup()
    renderLogin()
    // 触发验证错误
    await user.click(screen.getByRole('button', { name: '登录' }))
    expect(screen.getByText('请输入邮箱')).toBeInTheDocument()

    // 输入邮箱后错误消失
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    expect(screen.queryByText('请输入邮箱')).not.toBeInTheDocument()
  })
})
