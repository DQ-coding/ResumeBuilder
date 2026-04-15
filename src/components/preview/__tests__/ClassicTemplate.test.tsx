/**
 * ClassicTemplate 经典模板测试
 *
 * @spec frontend-preview @spec phase2-iteration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClassicTemplate from '@/components/preview/ClassicTemplate'
import { useResumeStore } from '@/store/resumeStore'
import type { ResumeContent } from '@/types'
import { createEmptyResumeContent } from '@/types'
import {
  createResumeWithBasic,
  createResumeWithSummary,
  createResumeWithWorkExperience,
  createResumeWithEducation,
  createResumeWithSkills,
} from '@/test/helpers'

function setStoreContent(content: ResumeContent) {
  useResumeStore.setState({
    currentResume: {
      id: '1',
      title: '测试简历',
      templateId: 'classic',
      content,
      userId: 'u1',
      createdAt: '2026-04-12T00:00:00Z',
      updatedAt: '2026-04-12T00:00:00Z',
    },
  })
}

describe('ClassicTemplate', () => {
  beforeEach(() => {
    useResumeStore.setState({ currentResume: null, saveStatus: 'saved' })
  })

  it('store 无数据时返回 null', () => {
    const { container } = render(<ClassicTemplate />)
    expect(container.firstChild).toBeNull()
  })

  it('通过 content prop 渲染数据', () => {
    const content = createResumeWithBasic({ name: '张三', title: '工程师', phone: '', email: '', avatar: '' })
    render(<ClassicTemplate content={content} />)
    expect(screen.getByText('张三')).toBeInTheDocument()
    expect(screen.getByText('工程师')).toBeInTheDocument()
  })

  it('渲染基本信息（姓名 + 职位 + 联系方式）', () => {
    setStoreContent(
      createResumeWithBasic({ name: '李四', title: '设计师', phone: '13800000000', email: 'li@test.com', avatar: '' }),
    )
    render(<ClassicTemplate />)
    expect(screen.getByText('李四')).toBeInTheDocument()
    expect(screen.getByText('设计师')).toBeInTheDocument()
    expect(screen.getByText(/13800000000/)).toBeInTheDocument()
    expect(screen.getByText(/li@test.com/)).toBeInTheDocument()
  })

  it('姓名和职位为空时不渲染头部', () => {
    setStoreContent(
      createResumeWithBasic({ name: '', title: '', phone: '13800000000', email: '', avatar: '' }),
    )
    render(<ClassicTemplate />)
    // phone 不会单独渲染（没有 name/title 就不渲染整个 header）
    expect(screen.queryByText(/13800000000/)).not.toBeInTheDocument()
  })

  it('渲染个人简介', () => {
    setStoreContent(createResumeWithSummary('5年前端开发经验，精通 React'))
    render(<ClassicTemplate />)
    expect(screen.getByText('5年前端开发经验，精通 React')).toBeInTheDocument()
    expect(screen.getByText('个人简介')).toBeInTheDocument()
  })

  it('个人简介为空时不渲染该区块', () => {
    setStoreContent(createResumeWithSummary(''))
    render(<ClassicTemplate />)
    expect(screen.queryByText('个人简介')).not.toBeInTheDocument()
  })

  it('渲染工作经历', () => {
    setStoreContent(
      createResumeWithWorkExperience([
        { company: '腾讯', position: '前端工程师', startDate: '2020-01', endDate: '2023-06', description: ['负责前端开发', '性能优化'] },
      ]),
    )
    render(<ClassicTemplate />)
    expect(screen.getByText('工作经历')).toBeInTheDocument()
    expect(screen.getByText('腾讯')).toBeInTheDocument()
    expect(screen.getByText('前端工程师')).toBeInTheDocument()
    expect(screen.getByText('2020-01 - 2023-06')).toBeInTheDocument()
    expect(screen.getByText('负责前端开发')).toBeInTheDocument()
    expect(screen.getByText('性能优化')).toBeInTheDocument()
  })

  it('工作经历描述为空时不渲染描述列表', () => {
    setStoreContent(
      createResumeWithWorkExperience([
        { company: '阿里', position: '开发', startDate: '', endDate: '', description: ['', ''] },
      ]),
    )
    render(<ClassicTemplate />)
    expect(screen.getByText('阿里')).toBeInTheDocument()
    // 无有效描述，不应有 list
    const list = screen.queryByRole('list')
    expect(list).not.toBeInTheDocument()
  })

  it('渲染教育背景', () => {
    setStoreContent(
      createResumeWithEducation([
        { school: '北京大学', major: '计算机', degree: '硕士', startDate: '2017-09', endDate: '2020-06' },
      ]),
    )
    render(<ClassicTemplate />)
    expect(screen.getByText('教育背景')).toBeInTheDocument()
    expect(screen.getByText('北京大学')).toBeInTheDocument()
    expect(screen.getByText(/硕士 · 计算机/)).toBeInTheDocument()
    expect(screen.getByText('2017-09 - 2020-06')).toBeInTheDocument()
  })

  it('渲染技能标签', () => {
    setStoreContent(
      createResumeWithSkills([
        { name: 'React', level: 'expert' },
        { name: 'TypeScript', level: 'proficient' },
      ]),
    )
    render(<ClassicTemplate />)
    expect(screen.getByText('技能特长')).toBeInTheDocument()
    expect(screen.getByText(/React/)).toBeInTheDocument()
    expect(screen.getByText(/精通/)).toBeInTheDocument()
    expect(screen.getByText(/TypeScript/)).toBeInTheDocument()
    expect(screen.getByText(/熟练/)).toBeInTheDocument()
  })

  it('空数据模块不渲染', () => {
    setStoreContent(createEmptyResumeContent())
    render(<ClassicTemplate />)
    // 有 classic-template 容器但没有区块标题
    expect(screen.getByTestId('classic-template')).toBeInTheDocument()
    expect(screen.queryByText('个人简介')).not.toBeInTheDocument()
    expect(screen.queryByText('工作经历')).not.toBeInTheDocument()
    expect(screen.queryByText('教育背景')).not.toBeInTheDocument()
    expect(screen.queryByText('技能特长')).not.toBeInTheDocument()
  })
})
