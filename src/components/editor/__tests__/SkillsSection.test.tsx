/**
 * SkillsSection 组件测试
 *
 * @spec frontend-editor @spec phase2-iteration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SkillsSection from '@/components/editor/SkillsSection'
import { useResumeStore } from '@/store/resumeStore'
import { createEmptyResumeContent, getSectionByType } from '@/types'
import type { Skill } from '@/types'
import { createResumeWithSkills } from '@/test/helpers'

describe('SkillsSection', () => {
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

  it('显示添加技能按钮', () => {
    render(<SkillsSection />)
    expect(screen.getByText('+ 添加技能')).toBeInTheDocument()
  })

  it('点击添加按钮新增一条技能', async () => {
    const user = userEvent.setup()
    render(<SkillsSection />)
    await user.click(screen.getByText('+ 添加技能'))
    const { currentResume } = useResumeStore.getState()
    const skills = getSectionByType(currentResume!.content, 'skills')!.content as Skill[]
    expect(skills).toHaveLength(1)
  })

  it('输入技能名称后更新 store', async () => {
    const user = userEvent.setup()
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithSkills([{ name: '', level: 'proficient' }]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<SkillsSection />)
    const inputs = screen.getAllByPlaceholderText('技能名称')
    await user.type(inputs[0], 'React')
    const { currentResume } = useResumeStore.getState()
    const skills = getSectionByType(currentResume!.content, 'skills')!.content as Skill[]
    expect(skills[0].name).toBe('React')
  })

  it('删除一条技能', async () => {
    const user = userEvent.setup()
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithSkills([
          { name: 'React', level: 'proficient' },
          { name: 'Vue', level: 'expert' },
        ]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<SkillsSection />)
    const deleteButtons = screen.getAllByTitle('删除此技能')
    await user.click(deleteButtons[0])
    const { currentResume } = useResumeStore.getState()
    const skills = getSectionByType(currentResume!.content, 'skills')!.content as Skill[]
    expect(skills).toHaveLength(1)
    expect(skills[0].name).toBe('Vue')
  })

  it('显示已有数据', () => {
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithSkills([{ name: 'TypeScript', level: 'proficient' }]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<SkillsSection />)
    expect(screen.getByDisplayValue('TypeScript')).toBeInTheDocument()
  })

  it('熟练度选项包含了解/熟练/精通', () => {
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithSkills([{ name: 'JS', level: 'proficient' }]),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
    })
    render(<SkillsSection />)
    const select = screen.getByDisplayValue('熟练')
    expect(select).toBeInTheDocument()
    const options = select.querySelectorAll('option')
    expect(options).toHaveLength(3)
    expect(Array.from(options).map((o) => o.textContent)).toEqual(['了解', '熟练', '精通'])
  })
})
