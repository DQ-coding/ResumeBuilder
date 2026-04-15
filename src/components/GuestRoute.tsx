/**
 * 访客路由守卫组件
 *
 * 已登录用户访问登录/注册等页面时，重定向到简历列表。
 * 与 ProtectedRoute 互补：ProtectedRoute 保护需认证的路由，
 * GuestRoute 保护仅限未认证用户访问的路由。
 *
 * @spec frontend-auth-pages
 */

import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface GuestRouteProps {
  children: React.ReactNode
}

function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  // 初始会话检查期间显示加载中，不跳转
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/resumes" replace />
  }

  return <>{children}</>
}

export default GuestRoute
