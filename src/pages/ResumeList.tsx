/**
 * 简历列表页面
 *
 * 展示用户所有简历卡片，支持新建、删除（二次确认）、重命名、点击跳转编辑器。
 *
 * @spec frontend-resume-list
 * @spec i18n
 */

import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import { useAuthStore } from '@/store/authStore'
import { getCurrentLanguage } from '@/i18n'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { importResumeJson } from '@/utils/jsonImport'
import * as resumeService from '@/services/resumeService'

/** 格式化时间 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(getCurrentLanguage() === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ResumeList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const {
    resumeList,
    isListLoading,
    fetchList,
    createResume,
    deleteResume,
    renameResume,
  } = useResumeStore()

  // 删除确认弹窗
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    title: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 重命名弹窗
  const [renameTarget, setRenameTarget] = useState<{
    id: string
    title: string
  } | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)

  // JSON 导入
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)

  // 加载列表
  useEffect(() => {
    fetchList().catch(() => {
      toast.error(t('resumeList.loadFailed'))
    })
  }, [fetchList, t])

  // 新建简历
  async function handleCreate() {
    try {
      const id = await createResume()
      toast.success(t('resumeList.createSuccess'))
      navigate(`/resumes/${id}/edit`)
    } catch {
      toast.error(t('resumeList.createFailed'))
    }
  }

  // 删除简历
  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteResume(deleteTarget.id)
      toast.success(t('resumeList.deleteSuccess'))
      setDeleteTarget(null)
    } catch {
      toast.error(t('resumeList.deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }

  // 重命名简历
  async function handleRename() {
    if (!renameTarget) return
    const trimmed = renameValue.trim()
    if (!trimmed) return
    setIsRenaming(true)
    try {
      await renameResume(renameTarget.id, trimmed)
      toast.success(t('resumeList.renameSuccess'))
      setRenameTarget(null)
    } catch {
      toast.error(t('resumeList.renameFailed'))
    } finally {
      setIsRenaming(false)
    }
  }

  function openRenameModal(id: string, currentTitle: string) {
    setRenameTarget({ id, title: currentTitle })
    setRenameValue(currentTitle)
  }

  // 导入 JSON
  async function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    try {
      const result = await importResumeJson(file)
      if (!result.success) {
        toast.error(result.error || t('resumeList.importFailed'))
        return
      }
      // 创建新简历并更新内容
      const detail = await resumeService.createResume({ title: result.title, templateId: result.templateId })
      await resumeService.updateResume(detail.id, { content: result.content! })
      await fetchList()
      toast.success(t('resumeList.importSuccess'))
      navigate(`/resumes/${detail.id}/edit`)
    } catch {
      toast.error(t('resumeList.importFailed'))
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶栏 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">{t('resumeList.title')}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Button variant="secondary" onClick={() => { logout(); navigate('/') }}>
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* 内容区 */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* 新建按钮 */}
        <div className="mb-6 flex items-center gap-3">
          <Button onClick={handleCreate}>{t('resumeList.createNew')}</Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? t('resumeList.importing') : t('resumeList.importJson')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportJson}
          />
        </div>

        {/* 加载状态 */}
        {isListLoading && (
          <p className="text-gray-500">{t('common.loading')}</p>
        )}

        {/* 空状态 */}
        {!isListLoading && resumeList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mb-4 text-lg">{t('resumeList.emptyTitle')}</p>
            <Button onClick={handleCreate}>{t('resumeList.emptyCta')}</Button>
          </div>
        )}

        {/* 简历卡片网格 */}
        {!isListLoading && resumeList.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumeList.map((resume) => (
              <div
                key={resume.id}
                className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                onClick={() => navigate(`/resumes/${resume.id}/edit`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/resumes/${resume.id}/edit`)
                }}
                role="button"
                tabIndex={0}
              >
                <h2 className="truncate text-base font-semibold text-gray-900">
                  {resume.title}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  {t('resumeList.lastEdited')}{formatDate(resume.updatedAt)}
                </p>
                <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    className="text-xs text-blue-600 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      openRenameModal(resume.id, resume.title)
                    }}
                  >
                    {t('common.rename')}
                  </button>
                  <button
                    className="text-xs text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget({ id: resume.id, title: resume.title })
                    }}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 删除确认弹窗 */}
      <Modal
        open={!!deleteTarget}
        title={t('resumeList.deleteConfirmTitle')}
        confirmText={t('common.delete')}
        danger
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        {t('resumeList.deleteConfirmMsg', { title: deleteTarget?.title })}
      </Modal>

      {/* 重命名弹窗 */}
      <Modal
        open={!!renameTarget}
        title={t('resumeList.renameTitle')}
        confirmText={t('common.rename')}
        loading={isRenaming}
        onConfirm={handleRename}
        onCancel={() => setRenameTarget(null)}
      >
        <Input
          id="rename-input"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          placeholder={t('resumeList.renamePlaceholder')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
          }}
        />
      </Modal>
    </div>
  )
}

export default ResumeList
