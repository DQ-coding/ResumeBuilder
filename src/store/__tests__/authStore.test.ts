/**
 * authStore 测试
 *
 * 测试 Supabase Auth 驱动的认证状态管理
 *
 * @spec supabase-migration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase'
import type { User, Session, AuthTokenResponsePassword } from '@supabase/supabase-js'
import { AuthError } from '@supabase/supabase-js'

/** 创建最小合规的 Supabase User 对象 */
function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: '1',
    email: 'test@test.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-04-12T00:00:00Z',
    ...overrides,
  } as User
}

/** 创建最小合规的 Supabase Session 对象 */
function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: createMockUser(),
    ...overrides,
  } as Session
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
    })
    vi.restoreAllMocks()
  })

  describe('loadFromStorage', () => {
    it('Supabase 返回已登录用户时恢复登录态', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: createMockUser(),
        },
        error: null,
      })

      await useAuthStore.getState().loadFromStorage()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual({ id: '1', email: 'test@test.com' })
    })

    it('Supabase 返回无用户时保持未登录', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null as unknown as User },
        error: null,
      })

      await useAuthStore.getState().loadFromStorage()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
    })
  })

  describe('login', () => {
    it('登录成功设置用户状态', async () => {
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: {
          user: createMockUser(),
          session: createMockSession(),
        },
        error: null,
      } as AuthTokenResponsePassword)

      await useAuthStore.getState().login('test@test.com', 'password123')

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual({ id: '1', email: 'test@test.com' })
      expect(state.isLoading).toBe(false)
    })

    it('登录失败不改变状态', async () => {
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new AuthError('邮箱或密码错误'),
      } as AuthTokenResponsePassword)

      await expect(
        useAuthStore.getState().login('test@test.com', 'wrong'),
      ).rejects.toThrow('邮箱或密码错误')

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
    })

    it('登录期间 isLoading 为 true', async () => {
      let resolveLogin: (value: AuthTokenResponsePassword) => void
      vi.spyOn(supabase.auth, 'signInWithPassword').mockImplementationOnce(
        () =>
          new Promise<AuthTokenResponsePassword>((resolve) => {
            resolveLogin = resolve
          }),
      )

      const promise = useAuthStore.getState().login('test@test.com', 'password')
      expect(useAuthStore.getState().isLoading).toBe(true)

      resolveLogin!({
        data: {
          user: createMockUser(),
          session: createMockSession(),
        },
        error: null,
      } as AuthTokenResponsePassword)
      await promise
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('register', () => {
    it('需要邮箱验证时返回 needsEmailConfirmation=true', async () => {
      vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
        data: { user: createMockUser(), session: null },
        error: null,
      })

      const result = await useAuthStore.getState().register('test@test.com', 'password123')

      expect(result.needsEmailConfirmation).toBe(true)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('无需邮箱验证时直接登录', async () => {
      vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
        data: {
          user: createMockUser(),
          session: createMockSession(),
        },
        error: null,
      })

      const result = await useAuthStore.getState().register('test@test.com', 'password123')

      expect(result.needsEmailConfirmation).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('清除用户状态并调用 signOut', async () => {
      vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({ error: null })

      useAuthStore.setState({
        user: { id: '1', email: 'test@test.com' },
        isAuthenticated: true,
      })

      await useAuthStore.getState().logout()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })
})
