/**
 * PreviewPanel 组件测试
 *
 * @spec frontend-preview
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PreviewPanel from '@/components/preview/PreviewPanel'

describe('PreviewPanel', () => {
  it('渲染子内容', () => {
    render(
      <PreviewPanel>
        <div>测试内容</div>
      </PreviewPanel>,
    )
    expect(screen.getByText('测试内容')).toBeInTheDocument()
  })

  it('包含预览面板容器', () => {
    render(
      <PreviewPanel>
        <div>内容</div>
      </PreviewPanel>,
    )
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument()
  })

  it('A4 纸张容器有白色背景和阴影', () => {
    render(
      <PreviewPanel>
        <div>内容</div>
      </PreviewPanel>,
    )
    const panel = screen.getByTestId('preview-panel')
    const a4Container = panel.querySelector('.bg-white.shadow-lg')
    expect(a4Container).toBeInTheDocument()
  })
})
