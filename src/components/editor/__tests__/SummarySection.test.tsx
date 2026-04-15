/**
 * SummarySection 组件测试
 *
 * Tiptap 依赖 ProseMirror，其需要 elementFromPoint / getClientRects 等
 * jsdom 未实现的 DOM API，因此这里 mock @tiptap/react 模块，
 * 用简单的 textarea 模拟富文本编辑器行为。
 *
 * @spec frontend-editor @spec phase2-iteration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import SummarySection from '@/components/editor/SummarySection'
import { useResumeStore } from '@/store/resumeStore'
import { createEmptyResumeContent, getSectionByType } from '@/types'
import { createResumeWithSummary } from '@/test/helpers'

// Mock RichTextEditor：用简单的 textarea 替代 Tiptap
vi.mock('@/components/editor/RichTextEditor', () => ({
  default: ({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) => {
    return React.createElement('div', { 'data-testid': 'rich-text-editor' },
      React.createElement('button', { title: '加粗', type: 'button' }, 'B'),
      React.createElement('textarea', {
        value: value?.replace(/<[^>]*>/g, '') || '',
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(`<p>${e.target.value}</p>`),
        placeholder,
        'aria-label': placeholder,
      })
    )
  },
}))

describe('SummarySection', () => {
  beforeEach(() => {
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createEmptyResumeContent(),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
      saveStatus: 'saved',
    })
  })

  it('渲染自我介绍编辑器', () => {
    render(<SummarySection />)
    expect(screen.getByText('自我介绍')).toBeInTheDocument()
    expect(screen.getByTitle('加粗')).toBeInTheDocument()
  })

  it('输入内容后更新 store', async () => {
    const user = userEvent.setup()
    render(<SummarySection />)
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '5年前端开发经验')
    const { currentResume } = useResumeStore.getState()
    const summary = getSectionByType(currentResume!.content, 'summary')!.content as string
    expect(summary).toContain('5年前端开发经验')
  })

  it('显示已有数据', () => {
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithSummary('已有简介'),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<SummarySection />)
    expect(screen.getByDisplayValue('已有简介')).toBeInTheDocument()
  })
})
