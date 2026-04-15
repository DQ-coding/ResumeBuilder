/**
 * 测试框架验证
 *
 * @spec frontend-auth-pages
 */

import { describe, it, expect } from 'vitest'

describe('测试框架', () => {
  it('vitest 基本断言', () => {
    expect(1 + 1).toBe(2)
  })

  it('jest-dom 扩展断言', () => {
    const el = document.createElement('div')
    el.textContent = 'hello'
    expect(el).toHaveTextContent('hello')
  })
})
