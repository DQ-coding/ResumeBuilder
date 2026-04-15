/**
 * TemplateSwitcher 模板切换组件
 *
 * 以缩略图卡片形式展示所有可用模板，用户点击切换。
 * 切换模板仅更换排版，保留已填内容。
 *
 * @spec phase2-iteration
 */

import { useState, useCallback } from 'react'
import { getAllTemplates } from '@/pdf/templateRegistry'
import type { TemplateConfig } from '@/types'
import Modal from '@/components/ui/Modal'

interface TemplateSwitcherProps {
  /** 当前模板 ID */
  currentTemplateId: string
  /** 切换模板回调 */
  onSwitch: (templateId: string) => void
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: TemplateConfig
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center rounded-lg border-2 p-3 transition-all hover:border-blue-400 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      {/* 缩略图 */}
      <div
        className="mb-2 h-28 w-20 rounded shadow-sm"
        style={template.thumbnailStyle}
      >
        <span className="text-xs">{template.name}</span>
      </div>
      {/* 模板名称 */}
      <span className={`text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
        {template.name}
      </span>
      {/* 选中标记 */}
      {isSelected && (
        <span className="mt-1 text-xs text-blue-500">当前使用</span>
      )}
    </button>
  )
}

function TemplateSwitcher({ currentTemplateId, onSwitch }: TemplateSwitcherProps) {
  const [open, setOpen] = useState(false)
  const templates = getAllTemplates()

  const handleSelect = useCallback((templateId: string) => {
    onSwitch(templateId)
    setOpen(false)
  }, [onSwitch])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        title="切换模板"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        切换模板
      </button>

      <Modal open={open} onCancel={() => setOpen(false)} title="选择模板">
        <div className="grid grid-cols-3 gap-4 p-2">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={template.id === currentTemplateId}
              onSelect={() => handleSelect(template.id)}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500 text-center">
          切换模板不会丢失已填内容，仅更换排版样式
        </p>
      </Modal>
    </>
  )
}

export default TemplateSwitcher
