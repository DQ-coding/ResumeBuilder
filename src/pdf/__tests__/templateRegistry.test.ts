/**
 * 模板注册表单元测试
 *
 * 验证模板注册、查询、回退逻辑。
 *
 * @spec phase2-iteration @spec pdf-export-refactor
 */

import { describe, it, expect } from 'vitest'
import {
  registerTemplate,
  getTemplateConfig,
  getAllTemplates,
  getPreviewComponent,
} from '@/pdf/templateRegistry'
import type { ResumeContent } from '@/types'

describe('模板注册表', () => {
  it('Classic 模板已注册', () => {
    const config = getTemplateConfig('classic')
    expect(config).toBeDefined()
    expect(config!.id).toBe('classic')
    expect(config!.name).toBe('经典')
  })

  it('getAllTemplates 返回包含 Classic 的列表', () => {
    const templates = getAllTemplates()
    expect(templates.length).toBeGreaterThanOrEqual(1)
    expect(templates.some((t) => t.id === 'classic')).toBe(true)
  })

  it('getPreviewComponent 返回 Classic 预览组件', () => {
    const component = getPreviewComponent('classic')
    expect(component).toBeDefined()
    expect(typeof component).toBe('function')
  })

  it('查询不存在的模板返回 undefined', () => {
    const config = getTemplateConfig('nonexistent')
    expect(config).toBeUndefined()
  })

  it('getPreviewComponent 对未知模板回退到 Classic', () => {
    const component = getPreviewComponent('nonexistent')
    expect(component).toBeDefined()
    // 应该回退到 Classic 模板
    const classicComponent = getPreviewComponent('classic')
    expect(component).toBe(classicComponent)
  })

  it('可以注册新模板（无 PDFComponent）', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const FakePreview = ({ content: _ }: { content?: ResumeContent }) => null

    registerTemplate({
      id: 'test-template',
      name: '测试模板',
      description: '测试用',
      thumbnailStyle: {},
      PreviewComponent: FakePreview,
    })

    const config = getTemplateConfig('test-template')
    expect(config).toBeDefined()
    expect(config!.name).toBe('测试模板')
    expect(config!.PreviewComponent).toBe(FakePreview)
  })
})
