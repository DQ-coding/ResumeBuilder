/**
 * JSON 导出/导入工具测试
 *
 * @spec phase2-iteration
 */

import { describe, it, expect, vi } from 'vitest'
import { createEmptyResumeContent } from '@/types'
import { exportResumeJson, serializeResumeJson, EXPORT_VERSION } from '@/utils/jsonExport'
import { parseAndValidateJson } from '@/utils/jsonImport'
import type { ResumeExportData } from '@/utils/jsonExport'
import { createResumeWithSummary } from '@/test/helpers'

describe('jsonExport', () => {
  it('serializeResumeJson 生成正确的 JSON 结构', () => {
    const content = createResumeWithSummary('测试简介')
    const json = serializeResumeJson('我的简历', 'classic', content)
    const data: ResumeExportData = JSON.parse(json)

    expect(data.version).toBe(EXPORT_VERSION)
    expect(data.title).toBe('我的简历')
    expect(data.templateId).toBe('classic')
    expect(data.content.sections).toBeDefined()
    expect(Array.isArray(data.content.sections)).toBe(true)
  })

  it('exportResumeJson 触发文件下载', () => {
    const createElementSpy = vi.spyOn(document, 'createElement')
    const content = createEmptyResumeContent()

    // Mock DOM APIs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockLink: any = {
      href: '', download: '', click: vi.fn(), style: {},
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createElementSpy.mockReturnValue(mockLink as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    exportResumeJson('测试简历', 'modern', content)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(mockLink.download).toBe('测试简历.json')
    expect(mockLink.click).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')

    createElementSpy.mockRestore()
    vi.restoreAllMocks()
  })
})

describe('jsonImport - parseAndValidateJson', () => {
  it('正确解析 v2 格式 JSON', () => {
    const content = createEmptyResumeContent()
    const exportData: ResumeExportData = {
      version: 2,
      title: '导出的简历',
      templateId: 'modern',
      content,
    }
    const result = parseAndValidateJson(JSON.stringify(exportData))

    expect(result.success).toBe(true)
    expect(result.title).toBe('导出的简历')
    expect(result.templateId).toBe('modern')
    expect(result.content?.sections).toBeDefined()
  })

  it('正确解析旧格式 JSON', () => {
    const legacyData = {
      basic: { name: '张三', title: '', phone: '', email: '', avatar: '' },
      summary: '简介',
      workExperience: [],
      education: [],
      skills: [],
    }
    const result = parseAndValidateJson(JSON.stringify(legacyData))

    expect(result.success).toBe(true)
    expect(result.title).toBe('导入的简历')
    expect(result.templateId).toBe('classic')
    expect(result.content?.sections).toBeDefined()
    expect(result.content!.sections.length).toBeGreaterThan(0)
  })

  it('正确解析仅含 sections 的 JSON（无 version）', () => {
    const content = createEmptyResumeContent()
    const data = { sections: content.sections, title: '无版本号', templateId: 'minimal' }
    const result = parseAndValidateJson(JSON.stringify(data))

    expect(result.success).toBe(true)
    expect(result.title).toBe('无版本号')
    expect(result.templateId).toBe('minimal')
  })

  it('拒绝无效 JSON', () => {
    const result = parseAndValidateJson('not json{{{')
    expect(result.success).toBe(false)
    expect(result.error).toContain('JSON 格式错误')
  })

  it('拒绝无法识别的格式', () => {
    const result = parseAndValidateJson('{"foo": "bar"}')
    expect(result.success).toBe(false)
    expect(result.error).toContain('无法识别')
  })

  it('拒绝 sections 不是数组的格式', () => {
    const result = parseAndValidateJson('{"version": 2, "content": {"sections": "not array"}}')
    expect(result.success).toBe(false)
    expect(result.error).toContain('sections 数组')
  })

  it('拒绝包含无效 section type 的格式', () => {
    const data = {
      version: 2,
      content: {
        sections: [
          { id: '1', type: 'invalid', title: '无效', content: '' },
        ],
      },
    }
    const result = parseAndValidateJson(JSON.stringify(data))
    expect(result.success).toBe(false)
    expect(result.error).toContain('无效的模块类型')
  })

  it('自动补充缺失的 section id', () => {
    const content = createEmptyResumeContent()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const sections = content.sections.map(({ id: _, ...rest }) => rest as any)
    const data = { version: 2, content: { sections } }
    const result = parseAndValidateJson(JSON.stringify(data))

    expect(result.success).toBe(true)
    result.content!.sections.forEach((s) => {
      expect(s.id).toBeTruthy()
    })
  })
})
