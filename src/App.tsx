/**
 * 应用根组件 — 路由配置
 *
 * 路由表依据 PRD 核心使用流程设计：
 * 首页 → 登录/注册 → 简历列表 → 编辑器
 * 公开分享链接：/share/:token（无需登录）
 *
 * @spec frontend-base-arch @spec share-link
 */

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import GuestRoute from '@/components/GuestRoute'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ResumeList from '@/pages/ResumeList'
import Editor from '@/pages/Editor'
import ShareView from '@/pages/ShareView'

function App() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/" element={<Landing />} />

      {/* 公开分享页面（无需登录） */}
      <Route path="/share/:token" element={<ShareView />} />

      {/* 仅限未登录用户访问 */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* 需要认证的路由 */}
      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <ResumeList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resumes/:id/edit"
        element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
