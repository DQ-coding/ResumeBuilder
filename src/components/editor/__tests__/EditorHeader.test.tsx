/**
 * EditorHeader 组件测试
 *
 * @spec frontend-editor @spec frontend-auto-save
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EditorHeader from '@/components/editor/EditorHeader'
import { useResumeStore } from '@/store/resumeStore'
import { createEmptyResumeContent } from '@/types'

function renderHeader(props?: { onSave?: () => void }) {
  return render(
    <MemoryRouter initialEntries={['/resumes/1/edit']}>
      <Routes>
        <Route path="/resumes/1/edit" element={<EditorHeader {...props} />} />
        <Route path="/resumes" element={<div>简历列表</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EditorHeader', () => {
  beforeEach(() => {
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '我的简历',
        templateId: 'classic',
        content: createEmptyResumeContent(),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
      saveStatus: 'saved',
    })
  })

  it('显示简历标题', () => {
    renderHeader()
    expect(screen.getByText('我的简历')).toBeInTheDocument()
  })

  it('显示保存状态为"已保存"', () => {
    renderHeader()
    expect(screen.getByText('已保存')).toBeInTheDocument()
  })

  it('点击返回列表跳转', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByText('返回列表'))
    expect(screen.getByText('简历列表')).toBeInTheDocument()
  })

  it('显示下载 PDF 按钮', () => {
    renderHeader()
    expect(screen.getByText('下载 PDF')).toBeInTheDocument()
  })

  it('未保存状态显示"未保存"', () => {
    useResumeStore.setState({ saveStatus: 'unsaved' })
    renderHeader()
    expect(screen.getByText('未保存')).toBeInTheDocument()
  })

  it('保存中状态显示"保存中..."', () => {
    useResumeStore.setState({ saveStatus: 'saving' })
    renderHeader()
    expect(screen.getByText('保存中...')).toBeInTheDocument()
  })

  it('未保存状态且提供 onSave 时显示保存按钮', () => {
    useResumeStore.setState({ saveStatus: 'unsaved' })
    renderHeader({ onSave: () => {} })
    expect(screen.getByText('保存')).toBeInTheDocument()
  })

  it('已保存状态不显示保存按钮', () => {
    renderHeader({ onSave: () => {} })
    expect(screen.queryByText('保存')).not.toBeInTheDocument()
  })

  it('点击保存按钮调用 onSave', async () => {
    const onSave = vi.fn()
    useResumeStore.setState({ saveStatus: 'unsaved' })
    const user = userEvent.setup()
    renderHeader({ onSave })
    await user.click(screen.getByText('保存'))
    expect(onSave).toHaveBeenCalledOnce()
  })
})
