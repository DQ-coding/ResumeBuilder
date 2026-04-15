/**
 * ResumeList 页面测试
 *
 * 分模块测试：列表渲染、新建、删除、重命名、跳转。
 * Mock resumeService 避免真实 API 调用。
 *
 * @spec frontend-resume-list
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ResumeList from '@/pages/ResumeList'
import { useResumeStore } from '@/store/resumeStore'
import { useAuthStore } from '@/store/authStore'

/** 模拟 resumeService */
vi.mock('@/services/resumeService', () => ({
  getResumeList: vi.fn(),
  getResumeDetail: vi.fn(),
  createResume: vi.fn(),
  updateResume: vi.fn(),
  deleteResume: vi.fn(),
  renameResume: vi.fn(),
}))

/** 渲染 ResumeList，带路由环境 */
function renderResumeList() {
  return render(
    <MemoryRouter initialEntries={['/resumes']}>
      <Routes>
        <Route path="/resumes" element={<ResumeList />} />
        <Route
          path="/resumes/:id/edit"
          element={<div>编辑器页面</div>}
        />
        <Route path="/" element={<div>首页</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

const mockResumeList = [
  {
    id: '1',
    title: '我的简历 1',
    templateId: 'classic',
    updatedAt: '2026-04-12T10:30:00.000Z',
    createdAt: '2026-04-10T08:00:00.000Z',
  },
  {
    id: '2',
    title: '我的简历 2',
    templateId: 'classic',
    updatedAt: '2026-04-11T14:20:00.000Z',
    createdAt: '2026-04-11T14:20:00.000Z',
  },
]

describe('ResumeList 页面', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    // 设置认证状态
    useAuthStore.setState({
      user: { id: '1', email: 'test@test.com' },
      isAuthenticated: true,
    })

    // 重置 resumeStore
    useResumeStore.setState({
      resumeList: [],
      currentResume: null,
      saveStatus: 'saved',
      isListLoading: false,
    })
  })

  describe('列表渲染', () => {
    it('加载中显示加载提示', async () => {
      const { getResumeList } = await import('@/services/resumeService')
      vi.mocked(getResumeList).mockReturnValue(new Promise(() => {})) // 永远 pending
      useResumeStore.setState({ isListLoading: true })

      renderResumeList()
      expect(screen.getByText('加载中...')).toBeInTheDocument()
    })

    it('空列表显示空状态引导', async () => {
      const { getResumeList } = await import('@/services/resumeService')
      vi.mocked(getResumeList).mockResolvedValueOnce([])

      renderResumeList()
      await waitFor(() => {
        expect(screen.getByText('还没有简历')).toBeInTheDocument()
      })
      expect(screen.getByText('创建第一份简历')).toBeInTheDocument()
    })

    it('有简历时显示卡片列表', async () => {
      const { getResumeList } = await import('@/services/resumeService')
      vi.mocked(getResumeList).mockResolvedValueOnce(mockResumeList)

      renderResumeList()

      await waitFor(() => {
        expect(screen.getByText('我的简历 1')).toBeInTheDocument()
        expect(screen.getByText('我的简历 2')).toBeInTheDocument()
      })
    })
  })

  describe('新建简历', () => {
    it('点击新建按钮创建简历并跳转', async () => {
      const user = userEvent.setup()
      const { getResumeList, createResume } = await import(
        '@/services/resumeService'
      )
      vi.mocked(getResumeList).mockResolvedValueOnce([])
      vi.mocked(createResume).mockResolvedValueOnce({
        id: 'new-1',
        title: '我的简历 1',
        templateId: 'classic',
        content: {
          sections: [
            { id: 'section-basic-1', type: 'basic', title: '基本信息', content: { name: '', title: '', phone: '', email: '', avatar: '' } },
            { id: 'section-summary-1', type: 'summary', title: '个人简介', content: '' },
            { id: 'section-work-1', type: 'workExperience', title: '工作经历', content: [] },
            { id: 'section-edu-1', type: 'education', title: '教育背景', content: [] },
            { id: 'section-skills-1', type: 'skills', title: '技能特长', content: [] },
          ],
        },
        userId: '1',
        createdAt: '2026-04-12T10:00:00.000Z',
        updatedAt: '2026-04-12T10:00:00.000Z',
      })
      // fetchList 第二次调用返回新列表
      vi.mocked(getResumeList).mockResolvedValueOnce([
        mockResumeList[0],
      ])

      renderResumeList()

      await waitFor(() => {
        expect(screen.getByText('新建简历')).toBeInTheDocument()
      })
      await user.click(screen.getByText('新建简历'))

      await waitFor(() => {
        expect(screen.getByText('编辑器页面')).toBeInTheDocument()
      })
    })
  })

  describe('删除简历', () => {
    it('点击删除弹出确认弹窗', async () => {
      const user = userEvent.setup()
      const { getResumeList } = await import('@/services/resumeService')
      vi.mocked(getResumeList).mockResolvedValueOnce(mockResumeList)

      renderResumeList()

      await waitFor(() => {
        expect(screen.getByText('我的简历 1')).toBeInTheDocument()
      })

      // 悬停显示操作按钮，然后点击删除
      await user.hover(screen.getByText('我的简历 1'))
      const deleteButtons = screen.getAllByText('删除')
      await user.click(deleteButtons[0])

      expect(screen.getByText(/确定要删除/)).toBeInTheDocument()
      expect(screen.getByText('我的简历 1')).toBeInTheDocument()
    })

    it('确认删除调用 deleteResume', async () => {
      const user = userEvent.setup()
      const { getResumeList, deleteResume } = await import(
        '@/services/resumeService'
      )
      vi.mocked(getResumeList).mockResolvedValueOnce(mockResumeList)
      vi.mocked(deleteResume).mockResolvedValueOnce(undefined)
      vi.mocked(getResumeList).mockResolvedValueOnce([mockResumeList[1]])

      renderResumeList()

      await waitFor(() => {
        expect(screen.getByText('我的简历 1')).toBeInTheDocument()
      })

      await user.hover(screen.getByText('我的简历 1'))
      const deleteButtons = screen.getAllByText('删除')
      await user.click(deleteButtons[0])

      // 点击确认删除（Modal 中的删除按钮是 danger 样式，位于弹窗底部）
      const allDeleteButtons = screen.getAllByRole('button', { name: '删除' })
      // 最后一个删除按钮是 Modal 中的确认按钮
      const confirmDeleteBtn = allDeleteButtons[allDeleteButtons.length - 1]
      await user.click(confirmDeleteBtn)

      await waitFor(() => {
        expect(vi.mocked(deleteResume)).toHaveBeenCalledWith('1')
      })
    })

    it('取消删除关闭弹窗', async () => {
      const user = userEvent.setup()
      const { getResumeList } = await import('@/services/resumeService')
      vi.mocked(getResumeList).mockResolvedValueOnce(mockResumeList)

      renderResumeList()

      await waitFor(() => {
        expect(screen.getByText('我的简历 1')).toBeInTheDocument()
      })

      await user.hover(screen.getByText('我的简历 1'))
      const deleteButtons = screen.getAllByText('删除')
      await user.click(deleteButtons[0])

      // 点击取消
      await user.click(screen.getByRole('button', { name: '取消' }))

      await waitFor(() => {
        expect(screen.queryByText(/确定要删除/)).not.toBeInTheDocument()
      })
    })
  })

  describe('重命名简历', () => {
    it('点击重命名弹出弹窗并显示当前标题', async () => {
      const user = userEvent.setup()
      const { getResumeList } = await import('@/services/resumeService')
      vi.mocked(getResumeList).mockResolvedValueOnce(mockResumeList)

      renderResumeList()

      await waitFor(() => {
        expect(screen.getByText('我的简历 1')).toBeInTheDocument()
      })

      await user.hover(screen.getByText('我的简历 1'))
      const renameButtons = screen.getAllByText('重命名')
      await user.click(renameButtons[0])

      expect(screen.getByText('重命名简历')).toBeInTheDocument()
      expect(screen.getByDisplayValue('我的简历 1')).toBeInTheDocument()
    })

    it('确认重命名调用 renameResume', async () => {
      const user = userEvent.setup()
      const { getResumeList, renameResume } = await import(
        '@/services/resumeService'
      )
      vi.mocked(getResumeList).mockResolvedValueOnce(mockResumeList)
      vi.mocked(renameResume).mockResolvedValueOnce({
        ...mockResumeList[0],
        title: '新标题',
        content: {
          sections: [
            { id: 'section-basic-1', type: 'basic', title: '基本信息', content: { name: '', title: '', phone: '', email: '', avatar: '' } },
            { id: 'section-summary-1', type: 'summary', title: '个人简介', content: '' },
            { id: 'section-work-1', type: 'workExperience', title: '工作经历', content: [] },
            { id: 'section-edu-1', type: 'education', title: '教育背景', content: [] },
            { id: 'section-skills-1', type: 'skills', title: '技能特长', content: [] },
          ],
        },
        userId: '1',
      })

      renderResumeList()

      await waitFor(() => {
        expect(screen.getByText('我的简历 1')).toBeInTheDocument()
      })

      await user.hover(screen.getByText('我的简历 1'))
      const renameButtons = screen.getAllByText('重命名')
      await user.click(renameButtons[0])

      const input = screen.getByDisplayValue('我的简历 1')
      await user.clear(input)
      await user.type(input, '新标题')

      // 点击弹窗中的确认按钮（第二个"重命名"按钮是弹窗确认按钮）
      const allRenameButtons = screen.getAllByRole('button', { name: '重命名' })
      await user.click(allRenameButtons[allRenameButtons.length - 1])

      await waitFor(() => {
        expect(vi.mocked(renameResume)).toHaveBeenCalledWith('1', {
          title: '新标题',
        })
      })
    })
  })

  describe('跳转编辑器', () => {
    it('点击卡片跳转到编辑器页面', async () => {
      const user = userEvent.setup()
      const { getResumeList } = await import('@/services/resumeService')
      vi.mocked(getResumeList).mockResolvedValueOnce(mockResumeList)

      renderResumeList()

      await waitFor(() => {
        expect(screen.getByText('我的简历 1')).toBeInTheDocument()
      })

      // 点击卡片（而非操作按钮）
      await user.click(screen.getByText('我的简历 1'))

      await waitFor(() => {
        expect(screen.getByText('编辑器页面')).toBeInTheDocument()
      })
    })
  })
})
