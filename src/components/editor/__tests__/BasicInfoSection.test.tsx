/**
 * BasicInfoSection 组件测试
 *
 * @spec frontend-editor @spec phase2-iteration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BasicInfoSection from '@/components/editor/BasicInfoSection'
import { useResumeStore } from '@/store/resumeStore'
import { createEmptyResumeContent, getSectionByType } from '@/types'
import { createResumeWithBasic } from '@/test/helpers'

describe('BasicInfoSection', () => {
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

  it('渲染所有输入字段', () => {
    render(<BasicInfoSection />)
    expect(screen.getByLabelText('姓名 *')).toBeInTheDocument()
    expect(screen.getByLabelText('职位 *')).toBeInTheDocument()
    expect(screen.getByLabelText('电话')).toBeInTheDocument()
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
    expect(screen.getByLabelText('年龄')).toBeInTheDocument()
    expect(screen.getByLabelText('性别')).toBeInTheDocument()
    expect(screen.getByLabelText('意向城市')).toBeInTheDocument()
  })

  it('输入姓名后更新 store', async () => {
    const user = userEvent.setup()
    render(<BasicInfoSection />)
    const input = screen.getByLabelText('姓名 *')
    await user.type(input, '张三')
    const { currentResume } = useResumeStore.getState()
    const basic = getSectionByType(currentResume!.content, 'basic')!.content as { name: string }
    expect(basic.name).toBe('张三')
  })

  it('输入职位后更新 store', async () => {
    const user = userEvent.setup()
    render(<BasicInfoSection />)
    const input = screen.getByLabelText('职位 *')
    await user.type(input, '前端工程师')
    const { currentResume } = useResumeStore.getState()
    const basic = getSectionByType(currentResume!.content, 'basic')!.content as { title: string }
    expect(basic.title).toBe('前端工程师')
  })

  it('显示已有数据', () => {
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithBasic({
          name: '李四',
          title: '设计师',
          phone: '13800000000',
          email: 'li@test.com',
          avatar: '',
          age: '26',
          gender: '女',
          targetCity: '上海',
        }),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<BasicInfoSection />)
    expect(screen.getByLabelText('姓名 *')).toHaveValue('李四')
    expect(screen.getByLabelText('职位 *')).toHaveValue('设计师')
    expect(screen.getByLabelText('电话')).toHaveValue('13800000000')
    expect(screen.getByLabelText('邮箱')).toHaveValue('li@test.com')
    expect(screen.getByLabelText('年龄')).toHaveValue('26')
    expect(screen.getByLabelText('性别')).toHaveValue('女')
    expect(screen.getByLabelText('意向城市')).toHaveValue('上海')
  })
})
