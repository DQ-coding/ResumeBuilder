/**
 * 简历编辑器页面
 *
 * 顶栏 + 左右分栏布局：左侧编辑表单，右侧实时预览。
 * 加载时从后端获取简历详情，失败时跳转列表页。
 * 集成自动保存（3秒防抖 + Ctrl+S + beforeunload 保护）和 PDF 导出。
 * 通过模板注册表动态选择预览和 PDF 渲染组件。
 *
 * @spec frontend-editor @spec frontend-preview @spec frontend-auto-save @spec frontend-pdf-export @spec phase2-iteration
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useResumeStore } from '@/store/resumeStore'
import EditorHeader from '@/components/editor/EditorHeader'
import EditorSidebar from '@/components/editor/EditorSidebar'
import PreviewPanel from '@/components/preview/PreviewPanel'
import { useAutoSave } from '@/hooks/useAutoSave'
import { exportPdf } from '@/utils/exportPdf'
import { exportResumeJson } from '@/utils/jsonExport'
import { toast } from '@/utils/toast'
import { getPreviewComponent } from '@/pdf/templateRegistry'

function Editor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchDetail, clearCurrentResume, currentResume } = useResumeStore()
  const { saveNow } = useAutoSave()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const handleExportPdf = useCallback(async () => {
    const resume = useResumeStore.getState().currentResume
    if (!resume) return
    setExporting(true)
    try {
      await exportPdf(resume.content, resume.templateId, resume.title)
    } catch {
      toast.error('PDF 导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
  }, [])

  const handleSwitchTemplate = useCallback(async (templateId: string) => {
    const resume = useResumeStore.getState().currentResume
    if (!resume || resume.templateId === templateId) return

    // 更新 templateId（仅前端状态变更，保存时一并提交）
    useResumeStore.setState((state) => ({
      currentResume: state.currentResume
        ? { ...state.currentResume, templateId }
        : null,
      saveStatus: 'unsaved',
    }))
  }, [])

  const handleExportJson = useCallback(() => {
    const resume = useResumeStore.getState().currentResume
    if (!resume) return
    exportResumeJson(resume.title, resume.templateId, resume.content)
  }, [])

  useEffect(() => {
    if (!id) {
      navigate('/resumes')
      return
    }

    let cancelled = false

    fetchDetail(id)
      .then(() => {
        if (!cancelled) setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError('加载简历失败，请返回列表重试')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      clearCurrentResume()
    }
  }, [id, fetchDetail, navigate, clearCurrentResume])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error || !currentResume) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-sm text-gray-600">{error ?? '简历不存在'}</p>
        <button
          type="button"
          onClick={() => navigate('/resumes')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          返回列表
        </button>
      </div>
    )
  }

  // 根据 templateId 动态选择预览组件
  const PreviewComponent = getPreviewComponent(currentResume.templateId)

  return (
    <div className="flex h-screen flex-col">
      <EditorHeader
        onSave={saveNow}
        onDownloadPdf={handleExportPdf}
        exportingPdf={exporting}
        onSwitchTemplate={handleSwitchTemplate}
        onExportJson={handleExportJson}
      />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar />
        <PreviewPanel>
          <PreviewComponent />
        </PreviewPanel>
      </div>
    </div>
  )
}

export default Editor
