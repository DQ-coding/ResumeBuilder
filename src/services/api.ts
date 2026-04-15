/**
 * Axios 实例与拦截器配置
 *
 * 统一的 HTTP 客户端，处理 Token 附加和错误响应。
 * - 请求拦截器：自动附加 Authorization 头
 * - 响应拦截器：401 时尝试刷新 Token，刷新失败跳转登录
 *
 * @spec frontend-base-arch
 */

import axios from 'axios'
import type { ApiResponse, RefreshTokenRequest, AuthResponse } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Token 刷新状态，防止并发请求多次刷新 */
let isRefreshing = false
/** 刷新期间排队的请求 */
let pendingRequests: Array<(token: string) => void> = []

function onTokenRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token))
  pendingRequests = []
}

/**
 * 获取当前存储的 accessToken
 * 从 localStorage 读取，与 authStore 的持久化位置一致
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken')
}

/** 设置 Token 到 localStorage */
export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

/** 清除 Token */
export function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

// 请求拦截器：自动附加 Authorization 头
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：处理 401 和统一错误
api.interceptors.response.use(
  (response) => {
    // 后端用 TransformInterceptor 包裹为 { data, message }，直接返回 data 部分
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 且非刷新请求本身 → 尝试刷新 Token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true

      if (isRefreshing) {
        // 已有刷新进行中，排队等待
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      isRefreshing = true
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post<ApiResponse<AuthResponse>>(
          '/api/auth/refresh',
          { refreshToken } satisfies RefreshTokenRequest,
        )
        const { accessToken, refreshToken: newRefreshToken } = res.data.data
        setTokens(accessToken, newRefreshToken)
        onTokenRefreshed(accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
