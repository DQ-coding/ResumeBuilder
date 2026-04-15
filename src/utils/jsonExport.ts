/**
 * jsonExport JSON 导出工具
 *
 * 将 ResumeContent 导出为 JSON 文件下载。
 * 导出格式包含版本号，便于后续导入时格式识别和迁移。
 *
 * @spec phase2-iteration
 */

import type { ResumeContent } from '@/types'

/** 导出格式版本 */
export const EXPORT_VERSION = 2

/** 导出的 JSON 结构 */
export interface ResumeExportData {
  /** 格式版本号 */
  version: number
  /** 简历标题 */
  title: string
  /** 模板 ID */
  templateId: string
  /** 简历内容 */
  content: ResumeContent
}

/**
 * 将简历数据导出为 JSON 并触发下载
 */
export function exportResumeJson(
  title: string,
  templateId: string,
  content: ResumeContent,
): void {
  const data: ResumeExportData = {
    version: EXPORT_VERSION,
    title,
    templateId,
    content,
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${title || 'resume'}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 将 ResumeContent 序列化为 JSON 字符串（用于测试）
 */
export function serializeResumeJson(
  title: string,
  templateId: string,
  content: ResumeContent,
): string {
  const data: ResumeExportData = {
    version: EXPORT_VERSION,
    title,
    templateId,
    content,
  }
  return JSON.stringify(data, null, 2)
}
