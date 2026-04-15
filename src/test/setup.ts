/**
 * 测试环境全局配置
 *
 * - 扩展 jest-dom 断言
 * - 清理 localStorage
 * - 初始化 i18n
 *
 * @spec frontend-auth-pages @spec i18n
 */

import '@testing-library/jest-dom/vitest'
import '@/i18n'

// jsdom 没有 ResizeObserver，需要 mock
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 每个测试前清理 localStorage
beforeEach(() => {
  localStorage.clear()
})
