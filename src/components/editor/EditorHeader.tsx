/**
 * EditorHeader 顶栏组件
 *
 * 显示 Logo、返回列表按钮、简历标题、模板切换、保存状态指示器、手动保存按钮、语言切换、分享按钮、下载 PDF 按钮。
 *
 * @spec frontend-editor @spec frontend-auto-save @spec frontend-pdf-export @spec phase2-iteration @spec i18n @spec share-link
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import { changeLanguage, getCurrentLanguage, SUPPORTED_LANGS, type LangCode } from '@/i18n'
import type { SaveStatus } from '@/types'
import TemplateSwitcher from './TemplateSwitcher'
import ShareModal from './ShareModal'

interface EditorHeaderProps {
  onSave?: () => void
  onDownloadPdf?: () => void
  exportingPdf?: boolean
  /** 模板切换回调 */
  onSwitchTemplate?: (templateId: string) => void
  /** 导出 JSON 回调 */
  onExportJson?: () => void
}

function EditorHeader({ onSave, onDownloadPdf, exportingPdf = false, onSwitchTemplate, onExportJson }: EditorHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentResume, saveStatus } = useResumeStore()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const currentLang = getCurrentLanguage()

  const saveStatusConfig: Record<SaveStatus, { label: string; className: string }> = {
    saved: { label: t('editor.saveStatusSaved'), className: 'text-green-600' },
    saving: { label: t('editor.saveStatusSaving'), className: 'text-yellow-600' },
    unsaved: { label: t('editor.saveStatusUnsaved'), className: 'text-red-600' },
  }

  const status = saveStatusConfig[saveStatus]

  const handleSwitchTemplate = useCallback((templateId: string) => {
    if (onSwitchTemplate) {
      onSwitchTemplate(templateId)
    }
  }, [onSwitchTemplate])

  const handleLangChange = (lang: LangCode) => {
    changeLanguage(lang)
    setShowLangMenu(false)
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* 左侧：返回 + 标题 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/resumes')}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('editor.backToList')}
        </button>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
          {currentResume?.title ?? t('editor.title')}
        </span>
      </div>

      {/* 右侧：模板切换 + 保存状态 + 保存按钮 + 语言切换 + 导出JSON + 下载PDF */}
      <div className="flex items-center gap-4">
        {currentResume && onSwitchTemplate && (
          <TemplateSwitcher
            currentTemplateId={currentResume.templateId}
            onSwitch={handleSwitchTemplate}
          />
        )}
        <span className={`text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
        {saveStatus === 'unsaved' && onSave && (
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('common.save')}
          </button>
        )}

        {/* 语言切换 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {SUPPORTED_LANGS.find((l) => l.code === currentLang)?.label}
          </button>
          {showLangMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 w-28 rounded-md border border-gray-200 bg-white shadow-lg py-1">
              {SUPPORTED_LANGS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLangChange(lang.code)}
                  className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 transition-colors ${currentLang === lang.code ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {onExportJson && (
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            title={t('editor.exportJson')}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t('editor.exportJson')}
          </button>
        )}
        {/* 分享按钮 */}
        {currentResume && (
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            title={t('editor.share.title')}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            {t('editor.share.title')}
          </button>
        )}
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={exportingPdf}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {exportingPdf ? t('editor.exporting') : t('editor.downloadPdf')}
        </button>
      </div>

      {/* 分享弹窗 */}
      {currentResume && (
        <ShareModal
          open={showShareModal}
          resumeId={currentResume.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </header>
  )
}

export default EditorHeader
