/**
 * useAutoSave 自动保存 Hook
 *
 * 监听 saveStatus 变化，3 秒防抖后自动同步到后端。
 * 支持 Ctrl+S 手动保存，同步失败时 toast 提示。
 *
 * @spec frontend-auto-save @spec i18n
 */

import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import { toast } from '@/utils/toast'

/** 防抖延迟（毫秒） */
const DEBOUNCE_MS = 3000

export function useAutoSave() {
  const { t } = useTranslation()
  const { currentResume, saveStatus, saveContent } = useResumeStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** 立即保存（手动保存 / Ctrl+S） */
  const saveNow = useCallback(async () => {
    // 取消防抖定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    try {
      await saveContent()
    } catch {
      toast.error(t('toast.saveFailed'))
    }
  }, [saveContent, t])

  // 防抖自动保存
  useEffect(() => {
    if (saveStatus !== 'unsaved' || !currentResume) return

    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      timerRef.current = null
      try {
        await saveContent()
      } catch {
        toast.error(t('toast.saveFailed'))
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [saveStatus, currentResume, saveContent, t])

  // Ctrl+S 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (useResumeStore.getState().saveStatus === 'unsaved') {
          saveNow()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [saveNow])

  // beforeunload 页面离开保护
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useResumeStore.getState().saveStatus === 'unsaved') {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return { saveNow }
}
