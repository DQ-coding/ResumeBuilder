/**
 * EducationSection 组件测试
 *
 * @spec frontend-editor @spec phase2-iteration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EducationSection from '@/components/editor/EducationSection'
import { useResumeStore } from '@/store/resumeStore'
import { createEmptyResumeContent, getSectionByType } from '@/types'
import type { Education } from '@/types'
import { createResumeWithEducation } from '@/test/helpers'

describe('EducationSection', () => {
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

  it('显示添加教育背景按钮', () => {
    render(<EducationSection />)
    expect(screen.getByText('+ 添加教育背景')).toBeInTheDocument()
  })

  it('点击添加按钮新增一条教育背景', async () => {
    const user = userEvent.setup()
    render(<EducationSection />)
    await user.click(screen.getByText('+ 添加教育背景'))
    const { currentResume } = useResumeStore.getState()
    const education = getSectionByType(currentResume!.content, 'education')!.content as Education[]
    expect(education).toHaveLength(1)
  })

  it('输入学校名后更新 store', async () => {
    const user = userEvent.setup()
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithEducation([{ school: '', major: '', degree: '', startDate: '', endDate: '' }]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<EducationSection />)
    const inputs = screen.getAllByPlaceholderText('学校名称')
    await user.type(inputs[0], '北京大学')
    const { currentResume } = useResumeStore.getState()
    const education = getSectionByType(currentResume!.content, 'education')!.content as Education[]
    expect(education[0].school).toBe('北京大学')
  })

  it('删除一条教育背景', async () => {
    const user = userEvent.setup()
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithEducation([
          { school: 'A学校', major: 'CS', degree: '本科', startDate: '', endDate: '' },
          { school: 'B学校', major: 'EE', degree: '硕士', startDate: '', endDate: '' },
        ]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<EducationSection />)
    const deleteButtons = screen.getAllByTitle('删除此条教育背景')
    await user.click(deleteButtons[0])
    const { currentResume } = useResumeStore.getState()
    const education = getSectionByType(currentResume!.content, 'education')!.content as Education[]
    expect(education).toHaveLength(1)
    expect(education[0].school).toBe('B学校')
  })

  it('显示已有数据', () => {
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithEducation([
          { school: '清华大学', major: '计算机', degree: '硕士', startDate: '2018-09', endDate: '2021-06' },
        ]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<EducationSection />)
    expect(screen.getByDisplayValue('清华大学')).toBeInTheDocument()
    expect(screen.getByDisplayValue('计算机')).toBeInTheDocument()
    expect(screen.getByDisplayValue('硕士')).toBeInTheDocument()
  })
})
