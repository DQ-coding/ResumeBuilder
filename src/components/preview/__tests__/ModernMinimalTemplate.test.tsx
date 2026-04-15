/**
 * ModernTemplate 和 MinimalTemplate 组件测试
 *
 * @spec phase2-iteration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ModernTemplate from '@/components/preview/ModernTemplate'
import MinimalTemplate from '@/components/preview/MinimalTemplate'
import { useResumeStore } from '@/store/resumeStore'
import {
  createResumeWithBasic,
  createResumeWithSummary,
  createResumeWithWorkExperience,
  createResumeWithEducation,
  createResumeWithSkills,
} from '@/test/helpers'
import { createEmptyResumeContent } from '@/types'

function setStoreContent(content: ReturnType<typeof createEmptyResumeContent>) {
  useResumeStore.setState({
    currentResume: {
      id: '1',
      title: '测试简历',
      templateId: 'modern',
      content,
      userId: 'u1',
      createdAt: '2026-04-12T00:00:00Z',
      updatedAt: '2026-04-12T00:00:00Z',
    },
  })
}

describe('ModernTemplate', () => {
  beforeEach(() => {
    useResumeStore.setState({ currentResume: null, saveStatus: 'saved' })
  })

  it('store 无数据时返回 null', () => {
    const { container } = render(<ModernTemplate />)
    expect(container.firstChild).toBeNull()
  })

  it('渲染基本信息到左栏', () => {
    setStoreContent(
      createResumeWithBasic({ name: '王五', title: '设计师', phone: '139', email: 'w@b.c', avatar: '' }),
    )
    render(<ModernTemplate />)
    expect(screen.getByText('王五')).toBeInTheDocument()
    expect(screen.getByText('设计师')).toBeInTheDocument()
    expect(screen.getByText('139')).toBeInTheDocument()
    expect(screen.getByText('w@b.c')).toBeInTheDocument()
  })

  it('渲染技能到左栏', () => {
    setStoreContent(
      createResumeWithSkills([{ name: 'React', level: 'expert' }]),
    )
    render(<ModernTemplate />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('渲染个人简介到右栏', () => {
    setStoreContent(createResumeWithSummary('3年设计经验'))
    render(<ModernTemplate />)
    expect(screen.getByText('3年设计经验')).toBeInTheDocument()
  })

  it('渲染工作经历到右栏', () => {
    setStoreContent(
      createResumeWithWorkExperience([
        { company: '字节', position: '设计师', startDate: '2021-01', endDate: '2024-01', description: ['UI设计'] },
      ]),
    )
    render(<ModernTemplate />)
    expect(screen.getByText('字节')).toBeInTheDocument()
    expect(screen.getByText('设计师')).toBeInTheDocument()
    expect(screen.getByText('UI设计')).toBeInTheDocument()
  })

  it('空数据模块不渲染', () => {
    setStoreContent(createEmptyResumeContent())
    render(<ModernTemplate />)
    expect(screen.getByTestId('modern-template')).toBeInTheDocument()
    expect(screen.queryByText('个人简介')).not.toBeInTheDocument()
  })
})

describe('MinimalTemplate', () => {
  beforeEach(() => {
    useResumeStore.setState({ currentResume: null, saveStatus: 'saved' })
  })

  it('store 无数据时返回 null', () => {
    const { container } = render(<MinimalTemplate />)
    expect(container.firstChild).toBeNull()
  })

  it('渲染基本信息', () => {
    setStoreContent(
      createResumeWithBasic({ name: '赵六', title: '产品经理', phone: '', email: 'z@b.c', avatar: '' }),
    )
    render(<MinimalTemplate />)
    expect(screen.getByText('赵六')).toBeInTheDocument()
    expect(screen.getByText('产品经理')).toBeInTheDocument()
    expect(screen.getByText('z@b.c')).toBeInTheDocument()
  })

  it('渲染技能为点分隔文本', () => {
    setStoreContent(
      createResumeWithSkills([
        { name: 'Figma', level: 'expert' },
        { name: 'Sketch', level: 'proficient' },
      ]),
    )
    render(<MinimalTemplate />)
    // Minimal 模板技能以 "·" 分隔显示
    expect(screen.getByText(/Figma/)).toBeInTheDocument()
    expect(screen.getByText(/Sketch/)).toBeInTheDocument()
  })

  it('渲染教育背景', () => {
    setStoreContent(
      createResumeWithEducation([
        { school: '复旦大学', major: '设计', degree: '硕士', startDate: '2018-09', endDate: '2021-06' },
      ]),
    )
    render(<MinimalTemplate />)
    expect(screen.getByText('复旦大学')).toBeInTheDocument()
  })

  it('空数据模块不渲染', () => {
    setStoreContent(createEmptyResumeContent())
    render(<MinimalTemplate />)
    expect(screen.getByTestId('minimal-template')).toBeInTheDocument()
    expect(screen.queryByText('个人简介')).not.toBeInTheDocument()
  })
})
