/**
 * CustomSection 组件测试
 *
 * @spec phase2-iteration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomSection from '@/components/editor/CustomSection'
import { useResumeStore } from '@/store/resumeStore'
import type { CustomItem } from '@/types'
import { createResumeWithCustomSection } from '@/test/helpers'

describe('CustomSection', () => {
  const customTitle = '项目经历'
  const customItems: CustomItem[] = [
    { title: '项目A', subtitle: '前端开发', startDate: '2022-01', endDate: '2023-01', description: ['负责开发'] },
  ]

  beforeEach(() => {
    useResumeStore.setState({
      currentResume: {
        id: '1',
        title: '测试简历',
        templateId: 'classic',
        content: createResumeWithCustomSection(customTitle, customItems),
        userId: 'u1',
        createdAt: '2026-04-12T00:00:00Z',
        updatedAt: '2026-04-12T00:00:00Z',
      },
      saveStatus: 'saved',
    })
  })

  it('渲染模块标题和已有数据', () => {
    render(
      <CustomSection sectionId={useResumeStore.getState().currentResume!.content.sections.find(s => s.type === 'custom')!.id} title={customTitle} items={customItems} />,
    )
    expect(screen.getByDisplayValue('项目经历')).toBeInTheDocument()
    expect(screen.getByDisplayValue('项目A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('前端开发')).toBeInTheDocument()
  })

  it('显示添加记录按钮', () => {
    render(
      <CustomSection sectionId="test" title="自定义" items={[]} />,
    )
    expect(screen.getByText('+ 添加记录')).toBeInTheDocument()
  })

  it('点击添加记录新增一条', async () => {
    const user = userEvent.setup()
    const sectionId = useResumeStore.getState().currentResume!.content.sections.find(s => s.type === 'custom')!.id
    render(
      <CustomSection sectionId={sectionId} title={customTitle} items={customItems} />,
    )
    await user.click(screen.getByText('+ 添加记录'))
    const { currentResume } = useResumeStore.getState()
    const customSection = currentResume!.content.sections.find(s => s.type === 'custom')!
    expect((customSection.content as CustomItem[])).toHaveLength(2)
  })

  it('显示删除模块按钮', () => {
    render(
      <CustomSection sectionId="test" title="自定义" items={[]} />,
    )
    expect(screen.getByText('删除模块')).toBeInTheDocument()
  })

  it('点击删除模块调用 removeSection', async () => {
    const user = userEvent.setup()
    const sectionId = useResumeStore.getState().currentResume!.content.sections.find(s => s.type === 'custom')!.id
    render(
      <CustomSection sectionId={sectionId} title={customTitle} items={customItems} />,
    )
    await user.click(screen.getByText('删除模块'))
    const { currentResume } = useResumeStore.getState()
    expect(currentResume!.content.sections.find(s => s.type === 'custom')).toBeUndefined()
  })
})
