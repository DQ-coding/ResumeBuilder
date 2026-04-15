/**
 * 应用入口
 *
 * 初始化 React 根、BrowserRouter、认证状态恢复、i18n。
 *
 * 认证状态恢复方式：
 * 通过 Supabase onAuthStateChange 监听会话变化，首次触发时恢复登录态。
 * 相比原来的 loadFromStorage()，此方式能保证 isLoading 状态在 React 渲染前正确设置。
 *
 * @spec frontend-base-arch @spec i18n @spec supabase-migration
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase'
import '@/i18n'
import App from './App.tsx'
import './index.css'

// 监听 Supabase 会话变化，驱动认证状态恢复
// INITIAL_SESSION 事件在页面加载时自动触发，携带当前已登录的用户信息
supabase.auth.onAuthStateChange((event, session) => {
  const { loadFromStorage } = useAuthStore.getState()

  if (event === 'INITIAL_SESSION') {
    if (session?.user) {
      loadFromStorage()
    } else {
      // 无会话，结束初始化，让路由守卫正常判断
      useAuthStore.setState({ isInitializing: false })
    }
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isAuthenticated: false, isInitializing: false })
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
