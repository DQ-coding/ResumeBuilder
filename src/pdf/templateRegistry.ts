/**
 * 模板注册表
 *
 * 统一管理所有简历模板的配置信息，包括预览组件。
 * 新增模板只需在此注册，无需修改其他文件。
 *
 * 重构：移除 PDFComponent 字段，PDF 导出改为直接截取预览组件 DOM，
 * 不再需要单独的 @react-pdf/renderer 组件。
 *
 * @spec phase2-iteration @spec pdf-export-refactor
 */

import type { TemplateConfig, ResumeContent } from '@/types'

/** 懒加载模板组件，避免未使用的模板影响首屏加载 */
const templateRegistry: Map<string, TemplateConfig> = new Map()

/** 注册一个模板 */
export function registerTemplate(config: TemplateConfig): void {
  templateRegistry.set(config.id, config)
}

/** 获取指定模板配置 */
export function getTemplateConfig(id: string): TemplateConfig | undefined {
  return templateRegistry.get(id)
}

/** 获取所有已注册模板 */
export function getAllTemplates(): TemplateConfig[] {
  return Array.from(templateRegistry.values())
}

/** 获取指定模板的预览组件 */
export function getPreviewComponent(templateId: string): React.FC<{ content?: ResumeContent }> {
  const config = templateRegistry.get(templateId)
  if (!config) {
    // 回退到 Classic
    const classic = templateRegistry.get('classic')
    return classic?.PreviewComponent ?? (() => null)
  }
  return config.PreviewComponent
}

// ========================
// 注册 Classic 模板
// ========================

import ClassicTemplate from '@/components/preview/ClassicTemplate'

registerTemplate({
  id: 'classic',
  name: '经典',
  description: '传统商务风格，适合正式求职场景',
  thumbnailStyle: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#64748b',
  },
  PreviewComponent: ClassicTemplate,
})

// ========================
// 注册 Modern 模板
// ========================

import ModernTemplate from '@/components/preview/ModernTemplate'

registerTemplate({
  id: 'modern',
  name: '现代',
  description: '左侧深色边栏 + 右侧主体，现代简约风格',
  thumbnailStyle: {
    background: 'linear-gradient(90deg, #1f2937 35%, #f9fafb 35%)',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#64748b',
  },
  PreviewComponent: ModernTemplate,
})

// ========================
// 注册 Minimal 模板
// ========================

import MinimalTemplate from '@/components/preview/MinimalTemplate'

registerTemplate({
  id: 'minimal',
  name: '极简',
  description: '无边框纯文字排版，大量留白，极简主义',
  thumbnailStyle: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#9ca3af',
  },
  PreviewComponent: MinimalTemplate,
})
