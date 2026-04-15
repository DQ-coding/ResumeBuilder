/**
 * WorkExperienceSection 组件测试
 *
 * @spec frontend-editor @spec phase2-iteration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import WorkExperienceSection from '@/components/editor/WorkExperienceSection'
import { useResumeStore } from '@/store/resumeStore'
import { createEmptyResumeContent, getSectionByType } from '@/types'
import type { WorkExperience } from '@/types'
import { createResumeWithWorkExperience } from '@/test/helpers'

// Mock Tiptap - 与 RichTextEditor.test.tsx 保持一致
vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    getHTML: () => '<p></p>',
    commands: { setContent: vi.fn() },
    chain: () => ({ focus: () => ({ toggleBold: () => ({ run: vi.fn() }), toggleBulletList: () => ({ run: vi.fn() }), toggleOrderedList: () => ({ run: vi.fn() }) }) }),
    isActive: () => false,
    on: vi.fn(),
    off: vi.fn(),
  }),
  EditorContent: () => React.createElement('div', { 'data-testid': 'tiptap-editor' }),
}))
vi.mock('@tiptap/starter-kit', () => ({ default: { configure: () => ({}) }, __esModule: true }))

describe('WorkExperienceSection', () => {
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

  it('显示添加工作经历按钮', () => {
    render(<WorkExperienceSection />)
    expect(screen.getByText('+ 添加工作经历')).toBeInTheDocument()
  })

  it('点击添加按钮新增一条工作经历', async () => {
    const user = userEvent.setup()
    render(<WorkExperienceSection />)
    await user.click(screen.getByText('+ 添加工作经历'))
    const { currentResume } = useResumeStore.getState()
    const workExp = getSectionByType(currentResume!.content, 'workExperience')!.content as WorkExperience[]
    expect(workExp).toHaveLength(1)
  })

  it('输入公司名后更新 store', async () => {
    const user = userEvent.setup()
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithWorkExperience([{ company: '', position: '', startDate: '', endDate: '', description: [''] }]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<WorkExperienceSection />)
    const inputs = screen.getAllByPlaceholderText('公司名称')
    await user.type(inputs[0], '腾讯')
    const { currentResume } = useResumeStore.getState()
    const workExp = getSectionByType(currentResume!.content, 'workExperience')!.content as WorkExperience[]
    expect(workExp[0].company).toBe('腾讯')
  })

  it('删除一条工作经历', async () => {
    const user = userEvent.setup()
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithWorkExperience([
          { company: 'A公司', position: '开发', startDate: '', endDate: '', description: [''] },
          { company: 'B公司', position: '测试', startDate: '', endDate: '', description: [''] },
        ]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<WorkExperienceSection />)
    const deleteButtons = screen.getAllByTitle('删除此条工作经历')
    await user.click(deleteButtons[0])
    const { currentResume } = useResumeStore.getState()
    const workExp = getSectionByType(currentResume!.content, 'workExperience')!.content as WorkExperience[]
    expect(workExp).toHaveLength(1)
    expect(workExp[0].company).toBe('B公司')
  })

  it('添加描述条目', async () => {
    const user = userEvent.setup()
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithWorkExperience([{ company: '', position: '', startDate: '', endDate: '', description: [''] }]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<WorkExperienceSection />)
    await user.click(screen.getByText('+ 添加描述'))
    const { currentResume } = useResumeStore.getState()
    const workExp = getSectionByType(currentResume!.content, 'workExperience')!.content as WorkExperience[]
    expect(workExp[0].description).toHaveLength(2)
  })

  it('删除描述条目', async () => {
    const user = userEvent.setup()
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithWorkExperience([{
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: ['<p>描述一</p>', '<p>描述二</p>'],
        }]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<WorkExperienceSection />)
    const deleteDescButtons = screen.getAllByTitle('删除此条描述')
    await user.click(deleteDescButtons[0])
    const { currentResume } = useResumeStore.getState()
    const workExp = getSectionByType(currentResume!.content, 'workExperience')!.content as WorkExperience[]
    expect(workExp[0].description).toHaveLength(1)
    expect(workExp[0].description[0]).toBe('<p>描述二</p>')
  })

  it('输入描述内容后更新 store', async () => {
    // 直接测试 store 的 updateSection 方法（模拟组件内部行为）
    const { currentResume } = useResumeStore.getState()
    const section = getSectionByType(currentResume!.content, 'workExperience')!
    const workExp = section.content as WorkExperience[]

    // 模拟 RichTextEditor onChange 的效果：更新 description 数组
    const updatedWorkExp: WorkExperience[] = [
      { ...workExp[0], description: ['<p>负责前端架构设计</p>'] },
    ]
    useResumeStore.getState().updateSection(section.id, updatedWorkExp)

    const { currentResume: updated } = useResumeStore.getState()
    const updatedSection = getSectionByType(updated!.content, 'workExperience')!
    expect((updatedSection.content as WorkExperience[])[0].description[0]).toContain('负责前端架构设计')
  })
})
