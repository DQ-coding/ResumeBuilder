/**
 * Modal 组件
 *
 * 通用弹窗，支持标题、内容、确认/取消操作。
 * 点击遮罩层不关闭（防止误操作）。
 *
 * @spec frontend-base-arch
 */

import { useEffect, type ReactNode } from 'react'
import Button from './Button'

interface ModalProps {
  /** 是否显示 */
  open: boolean
  /** 标题 */
  title: string
  /** 内容 */
  children: ReactNode
  /** 确认按钮文本，不传则不显示确认按钮 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮是否为危险操作 */
  danger?: boolean
  /** 确认按钮 loading 状态 */
  loading?: boolean
  /** 点击确认 */
  onConfirm?: () => void
  /** 点击取消或关闭 */
  onCancel: () => void
}

function Modal({
  open,
  title,
  children,
  confirmText,
  cancelText = '取消',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ModalProps) {
  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  // 打开时禁止背景滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      />
      {/* 弹窗内容 */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="mt-4 text-sm text-gray-600">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          {confirmText && onConfirm && (
            <Button
              variant={danger ? 'danger' : 'primary'}
              loading={loading}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
