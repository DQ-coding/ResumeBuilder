/**
 * 认证相关 API 服务
 *
 * 使用 Supabase Auth 替代原有后端认证
 *
 * @spec supabase-migration
 */

import { supabase } from './supabase'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types'
import type { User, Session } from '@supabase/supabase-js'

/** 将 Supabase User 转换为 AuthResponse */
function toAuthResponse(user: User, session: Session): AuthResponse {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: {
      id: user.id,
      email: user.email ?? '',
    },
  }
}

/** 注册结果 */
export interface RegisterResult {
  /** 是否需要验证邮箱（Supabase 开启了邮箱确认时为 true） */
  needsEmailConfirmation: boolean
  user?: AuthResponse['user']
}

/** 用户注册 */
export async function register(data: RegisterRequest): Promise<RegisterResult> {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!authData.user) {
    throw new Error('注册失败，请稍后重试')
  }

  // session 为 null 时说明 Supabase 开启了邮箱验证，需要用户去邮箱确认
  if (!authData.session) {
    return { needsEmailConfirmation: true }
  }

  return {
    needsEmailConfirmation: false,
    user: { id: authData.user.id, email: authData.user.email ?? '' },
  }
}

/** 用户登录 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!authData.user || !authData.session) {
    throw new Error('登录失败，未返回用户会话')
  }

  return toAuthResponse(authData.user, authData.session)
}

/** 刷新 Token */
export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  const { data: authData, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!authData.user || !authData.session) {
    throw new Error('刷新会话失败')
  }

  return toAuthResponse(authData.user, authData.session)
}

/** 获取当前用户 */
export async function getCurrentUser(): Promise<AuthResponse | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user || !session) {
    return null
  }

  return toAuthResponse(user, session)
}

/** 订阅认证状态变化 */
export function onAuthStateChange(callback: (user: AuthResponse['user'] | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_, session) => {
    if (!session?.user) {
      callback(null)
      return
    }
    callback({
      id: session.user.id,
      email: session.user.email ?? '',
    })
  })

  return () => subscription.unsubscribe()
}

/** 退出登录 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}
