/**
 * jsonImport JSON 导入工具
 *
 * 读取 JSON 文件，校验格式，自动迁移旧版本数据。
 *
 * @spec phase2-iteration
 */

import type { ResumeContent, SectionType } from '@/types'
import { migrateResumeContent, generateSectionId } from '@/types'

/** 导入校验结果 */
export interface ImportResult {
  success: boolean
  error?: string
  title?: string
  templateId?: string
  content?: ResumeContent
}

/** 最大文件大小：1MB */
const MAX_FILE_SIZE = 1024 * 1024

/** 有效的 SectionType 集合 */
const VALID_SECTION_TYPES = new Set<SectionType>([
  'basic', 'summary', 'workExperience', 'education', 'skills', 'custom',
])

/**
 * 从文件读取并校验 JSON 简历数据
 */
export function importResumeJson(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    // 文件大小检查
    if (file.size > MAX_FILE_SIZE) {
      resolve({ success: false, error: '文件大小超过 1MB 限制' })
      return
    }

    // 文件类型检查
    if (!file.name.endsWith('.json')) {
      resolve({ success: false, error: '仅支持 .json 文件' })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const result = parseAndValidateJson(text)
        resolve(result)
      } catch {
        resolve({ success: false, error: '文件读取失败' })
      }
    }
    reader.onerror = () => {
      resolve({ success: false, error: '文件读取失败' })
    }
    reader.readAsText(file)
  })
}

/**
 * 解析并校验 JSON 字符串
 */
export function parseAndValidateJson(jsonStr: string): ImportResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any
  try {
    data = JSON.parse(jsonStr)
  } catch {
    return { success: false, error: 'JSON 格式错误' }
  }

  // 校验顶层字段
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: '无效的 JSON 结构' }
  }

  // 检测是否为 v2 格式（含 version 和 content）
  if (data.version === 2 && data.content) {
    const contentResult = validateResumeContent(data.content)
    if (!contentResult.valid) {
      return { success: false, error: contentResult.error }
    }
    return {
      success: true,
      title: data.title || '导入的简历',
      templateId: data.templateId || 'classic',
      content: migrateResumeContent(data.content),
    }
  }

  // 检测旧格式（含 basic/summary/workExperience/education/skills 字段）
  if (data.basic || data.summary || data.workExperience || data.education || data.skills) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const migrated = migrateResumeContent(data as any)
    return {
      success: true,
      title: '导入的简历',
      templateId: 'classic',
      content: migrated,
    }
  }

  // 仅有 sections 字段（无 version）
  if (data.sections && Array.isArray(data.sections)) {
    const contentResult = validateResumeContent(data)
    if (!contentResult.valid) {
      return { success: false, error: contentResult.error }
    }
    return {
      success: true,
      title: data.title || '导入的简历',
      templateId: data.templateId || 'classic',
      content: migrateResumeContent(data),
    }
  }

  return { success: false, error: '无法识别的简历格式' }
}

/**
 * 校验 ResumeContent 结构
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateResumeContent(content: any): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'object') {
    return { valid: false, error: '缺少 content 字段' }
  }

  if (!Array.isArray(content.sections)) {
    return { valid: false, error: '缺少 sections 数组' }
  }

  for (const section of content.sections) {
    if (!section.type || !VALID_SECTION_TYPES.has(section.type)) {
      return { valid: false, error: `无效的模块类型: ${section.type}` }
    }
    if (!section.id || typeof section.id !== 'string') {
      // 自动补充缺失的 id
      section.id = generateSectionId()
    }
  }

  return { valid: true }
}
