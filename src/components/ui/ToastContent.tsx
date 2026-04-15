/**
 * Toast 内容展示组件
 * @spec frontend-base-arch
 */

import type { ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
}

const typeIcons: Record<ToastType, ReactNode> = {
  success: (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  info: (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
      />
    </svg>
  ),
}

function ToastContent({
  message,
  type = 'info',
}: {
  message: string
  type: ToastType
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${typeStyles[type]}`}
    >
      {typeIcons[type]}
      <span>{message}</span>
    </div>
  )
}

export default ToastContent
export type { ToastType }
