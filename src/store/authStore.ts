/**
 * 认证状态管理 Store
 *
 * 使用 Supabase Auth 管理认证状态
 *
 * @spec supabase-migration
 */

import { create } from 'zustand'
import type { UserBrief } from '@/types'
import { supabase } from '@/services/supabase'

interface AuthState {
  /** 当前用户信息 */
  user: UserBrief | null
  /** 是否已认证 */
  isAuthenticated: boolean
  /** 是否正在加载（登录/注册操作中） */
  isLoading: boolean
  /** 是否正在进行初始会话检查（页面刷新时恢复登录态） */
  isInitializing: boolean

  /** 从 Supabase 恢复登录态 */
  loadFromStorage: () => Promise<void>
  /** 用户登录 */
  login: (email: string, password: string) => Promise<void>
  /** 用户注册，返回是否需要验证邮箱 */
  register: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>
  /** 用户登出 */
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true, // 初始为 true，等待 loadFromStorage 完成

  loadFromStorage: async () => {
    set({ isInitializing: true })
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        set({
          user: { id: user.id, email: user.email ?? '' },
          isAuthenticated: true,
          isInitializing: false,
        })
      } else {
        set({ isInitializing: false })
      }
    } catch {
      set({ isInitializing: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email ?? '',
          },
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        set({ isLoading: false })
        throw error
      }

      // session 为 null 说明需要邮箱验证
      if (!data.session) {
        set({ isLoading: false })
        return { needsEmailConfirmation: true }
      }

      // 无需邮箱验证（Supabase 关闭了邮箱确认），直接登录
      if (data.user) {
        set({
          user: { id: data.user.id, email: data.user.email ?? '' },
          isAuthenticated: true,
          isLoading: false,
        })
      }
      return { needsEmailConfirmation: false }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    set({ user: null, isAuthenticated: false })
  },
}))
