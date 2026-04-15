/**
 * Register 页面测试
 *
 * @spec frontend-auth-pages
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Register from '@/pages/Register'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase'
import { AuthError } from '@supabase/supabase-js'

/** 渲染 Register 页面，带路由环境 */
function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<div>登录页</div>} />
        <Route path="/resumes" element={<div>简历列表</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Register 页面', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
    })
    vi.restoreAllMocks()
  })

  it('渲染邮箱、密码、确认密码输入框及注册按钮', () => {
    renderRegister()
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument()
  })

  it('显示登录链接', () => {
    renderRegister()
    expect(screen.getByText('登录')).toBeInTheDocument()
  })

  it('空表单提交显示验证错误', async () => {
    const user = userEvent.setup()
    renderRegister()
    await user.click(screen.getByRole('button', { name: '注册' }))

    expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
    expect(screen.getByText('请输入密码')).toBeInTheDocument()
    expect(screen.getByText('请确认密码')).toBeInTheDocument()
  })

  it('密码不足 8 位显示错误', async () => {
    const user = userEvent.setup()
    renderRegister()
    await user.type(screen.getByLabelText('密码'), '1234567')
    await user.type(screen.getByLabelText('确认密码'), '1234567')
    await user.click(screen.getByRole('button', { name: '注册' }))

    expect(screen.getByText('密码至少 8 位')).toBeInTheDocument()
  })

  it('两次密码不一致显示错误', async () => {
    const user = userEvent.setup()
    renderRegister()
    await user.type(screen.getByLabelText('密码'), 'password123')
    await user.type(screen.getByLabelText('确认密码'), 'password456')
    await user.click(screen.getByRole('button', { name: '注册' }))

    expect(screen.getByText('两次密码不一致')).toBeInTheDocument()
  })

  it('API 错误时显示错误提示', async () => {
    const user = userEvent.setup()
    // Mock Supabase auth 失败
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new AuthError('邮箱已被注册'),
    })

    renderRegister()
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), 'password123')
    await user.type(screen.getByLabelText('确认密码'), 'password123')
    await user.click(screen.getByRole('button', { name: '注册' }))

    await waitFor(() => {
      expect(screen.getByText('邮箱已被注册')).toBeInTheDocument()
    })
  })
})
