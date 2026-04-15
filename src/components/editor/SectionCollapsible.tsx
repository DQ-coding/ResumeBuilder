/**
 * SectionCollapsible 可折叠区块组件
 *
 * 提供模块标题 + 折叠/展开交互，各编辑模块通用容器。
 * 支持模块显隐切换（visible/onToggleVisibility）。
 * 折叠状态由组件内部管理，保持简单。
 *
 * @spec frontend-editor @spec section-visibility
 */

import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface SectionCollapsibleProps {
  /** 模块标题 */
  title: string
  /** 子内容 */
  children: ReactNode
  /** 默认是否展开 */
  defaultOpen?: boolean
  /** 是否在预览中显示，默认 true */
  visible?: boolean
  /** 显隐切换回调 */
  onToggleVisibility?: () => void
}

function SectionCollapsible({
  title,
  children,
  defaultOpen = true,
  visible = true,
  onToggleVisibility,
}: SectionCollapsibleProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`border border-gray-200 rounded-lg bg-white ${!visible ? 'opacity-60' : ''}`}>
      <div className="flex w-full items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center justify-between text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors -mx-1 px-1 py-0 rounded"
        >
          <span>{title}</span>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            title={visible ? t('editor.hideSection') : t('editor.showSection')}
          >
            {visible ? (
              /* 眼睛打开图标 */
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              /* 眼睛关闭图标 */
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        )}
      </div>
      {open && <div className="border-t border-gray-200 px-4 py-3">{children}</div>}
    </div>
  )
}

export default SectionCollapsible
