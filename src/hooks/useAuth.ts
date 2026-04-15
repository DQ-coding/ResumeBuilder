/**
 * 认证相关 Hook
 *
 * 提供在组件中使用的认证便捷方法，结合导航跳转。
 * @spec frontend-auth-pages
 */

import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, login, register, logout } =
    useAuthStore()

  /** 登录并跳转，支持指定跳转路径（默认 /resumes） */
  const loginAndRedirect = async (
    email: string,
    password: string,
    redirectTo?: string,
  ) => {
    await login(email, password)
    navigate(redirectTo || '/resumes')
  }

  /** 注册，需要邮箱验证时返回 true，直接登录时跳转到简历列表 */
  const registerAndRedirect = async (email: string, password: string): Promise<{ needsEmailConfirmation: boolean }> => {
    const result = await register(email, password)
    if (!result.needsEmailConfirmation) {
      navigate('/resumes')
    }
    return result
  }

  /** 登出并跳转到首页 */
  const logoutAndRedirect = () => {
    logout()
    navigate('/')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginAndRedirect,
    register: registerAndRedirect,
    logout: logoutAndRedirect,
  }
}
