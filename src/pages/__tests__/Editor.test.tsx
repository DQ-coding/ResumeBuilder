/**
 * Editor 页面集成测试
 *
 * @spec frontend-editor @spec frontend-preview @spec phase2-iteration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Editor from '@/pages/Editor'
import { useResumeStore } from '@/store/resumeStore'
import { getSectionByType } from '@/types'

// vi.hoisted 确保数据在 vi.mock 提升时可用（不能使用外部 import）
const { mockResumeData } = vi.hoisted(() => {
  const emptyContent = {
    sections: [
      { id: 'section-basic-1', type: 'basic', title: '基本信息', content: { name: '', title: '', phone: '', email: '', avatar: '' } },
      { id: 'section-summary-1', type: 'summary', title: '个人简介', content: '' },
      { id: 'section-work-1', type: 'workExperience', title: '工作经历', content: [] },
      { id: 'section-edu-1', type: 'education', title: '教育背景', content: [] },
      { id: 'section-skills-1', type: 'skills', title: '技能特长', content: [] },
    ],
  }
  return {
    mockResumeData: {
      id: '1',
      title: '测试简历',
      templateId: 'classic',
      content: emptyContent,
      userId: 'u1',
      createdAt: '2026-04-12T00:00:00Z',
      updatedAt: '2026-04-12T00:00:00Z',
    },
  }
})

vi.mock('@/services/resumeService', () => ({
  getResumeList: vi.fn().mockResolvedValue([]),
  getResumeDetail: vi.fn().mockResolvedValue(mockResumeData),
  createResume: vi.fn(),
  updateResume: vi.fn(),
  deleteResume: vi.fn(),
  renameResume: vi.fn(),
}))

function renderEditor() {
  return render(
    <MemoryRouter initialEntries={['/resumes/1/edit']}>
      <Routes>
        <Route path="/resumes/:id/edit" element={<Editor />} />
        <Route path="/resumes" element={<div>简历列表</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Editor 页面集成测试', () => {
  beforeEach(() => {
    useResumeStore.setState({
      currentResume: null,
      resumeList: [],
      saveStatus: 'saved',
      isListLoading: false,
    })
  })

  it('加载简历后显示编辑器布局', async () => {
    renderEditor()
    // 等待数据加载完成
    expect(await screen.findByText('测试简历')).toBeInTheDocument()
    // 顶栏元素
    expect(screen.getByText('返回列表')).toBeInTheDocument()
    expect(screen.getByText('下载 PDF')).toBeInTheDocument()
    expect(screen.getByText('已保存')).toBeInTheDocument()
    // 编辑模块标题
    expect(screen.getByText('基本信息')).toBeInTheDocument()
    expect(screen.getByText('个人简介')).toBeInTheDocument()
    expect(screen.getByText('工作经历')).toBeInTheDocument()
    expect(screen.getByText('教育背景')).toBeInTheDocument()
    expect(screen.getByText('技能特长')).toBeInTheDocument()
  })

  it('预览区显示经典模板容器', async () => {
    renderEditor()
    expect(await screen.findByTestId('preview-panel')).toBeInTheDocument()
    expect(screen.getByTestId('classic-template')).toBeInTheDocument()
  })

  it('基本信息输入后更新 store 和预览', async () => {
    const user = userEvent.setup()
    renderEditor()
    await screen.findByText('基本信息')
    const nameInput = screen.getByLabelText('姓名 *')
    await user.type(nameInput, '王五')
    const { currentResume } = useResumeStore.getState()
    const basic = getSectionByType(currentResume!.content, 'basic')!.content as { name: string }
    expect(basic.name).toBe('王五')
    // 预览应实时更新显示姓名
    expect(screen.getByText('王五')).toBeInTheDocument()
  })

  it('保存状态在编辑后变为未保存', async () => {
    const user = userEvent.setup()
    renderEditor()
    await screen.findByText('基本信息')
    const nameInput = screen.getByLabelText('姓名 *')
    await user.type(nameInput, '测试')
    expect(useResumeStore.getState().saveStatus).toBe('unsaved')
  })
})
