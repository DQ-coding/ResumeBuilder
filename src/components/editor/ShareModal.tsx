/**
 * ShareModal 分享弹窗组件
 *
 * 展示简历分享链接、复制按钮、开启/关闭分享开关。
 *
 * @spec share-link
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '@/components/ui/Modal'
import { getShareStatus, enableShare, disableShare } from '@/services/resumeService'
import { toast } from '@/utils/toast'

interface ShareModalProps {
  /** 是否显示 */
  open: boolean
  /** 简历 ID */
  resumeId: string
  /** 关闭回调 */
  onClose: () => void
}

function ShareModal({ open, resumeId, onClose }: ShareModalProps) {
  const { t } = useTranslation()
  const [isPublic, setIsPublic] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  // 获取当前分享状态
  useEffect(() => {
    if (!open) return
    getShareStatus(resumeId)
      .then((status) => {
        setIsPublic(status.isPublic)
        setShareToken(status.shareToken)
      })
      .catch(() => {
        toast.error(t('toast.shareStatusError'))
      })
  }, [open, resumeId, t])

  const shareUrl = shareToken
    ? `${window.location.origin}/share/${shareToken}`
    : ''

  const handleToggle = useCallback(async () => {
    setLoading(true)
    try {
      if (isPublic) {
        const result = await disableShare(resumeId)
        setIsPublic(result.isPublic)
      } else {
        const result = await enableShare(resumeId)
        setIsPublic(result.isPublic)
        setShareToken(result.shareToken)
      }
    } catch {
      toast.error(t('toast.shareToggleError'))
    } finally {
      setLoading(false)
    }
  }, [isPublic, resumeId, t])

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareUrl])

  return (
    <Modal
      open={open}
      title={t('editor.share.title')}
      onCancel={onClose}
      cancelText={t('common.close')}
    >
      <div className="space-y-4">
        {/* 开关 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">{t('editor.share.enableShare')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isPublic ? 'bg-blue-600' : 'bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 分享链接 */}
        {isPublic && shareUrl && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t('editor.share.shareLink')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {copied ? t('editor.share.copied') : t('editor.share.copy')}
              </button>
            </div>
          </div>
        )}

        {/* 提示信息 */}
        {!isPublic && (
          <p className="text-xs text-gray-400">{t('editor.share.disabledHint')}</p>
        )}
        {isPublic && (
          <p className="text-xs text-gray-400">{t('editor.share.enabledHint')}</p>
        )}
      </div>
    </Modal>
  )
}

export default ShareModal
