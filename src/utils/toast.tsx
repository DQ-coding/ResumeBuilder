/**
 * Toast 命令式调用工具
 *
 * 使用 createRoot API 实现命令式调用，无需在组件树中声明。
 * ToastContent 组件位于 components/ui/ToastContent.tsx，此处仅负责挂载逻辑。
 *
 * @spec frontend-base-arch
 */

import { createRoot } from 'react-dom/client'
import ToastContent from '@/components/ui/ToastContent'
import type { ToastType } from '@/components/ui/ToastContent'

interface ToastConfig {
  type?: ToastType
  duration?: number
}

/** 获取或创建 Toast 容器 */
function getToastContainer(): HTMLDivElement {
  let container = document.getElementById('toast-container') as
    | HTMLDivElement
    | null
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.className =
      'fixed top-4 right-4 z-[100] flex flex-col gap-2'
    document.body.appendChild(container)
  }
  return container
}

/** 显示 Toast 提示 */
function show(message: string, config?: ToastConfig) {
  const { type = 'info', duration = 3000 } = config ?? {}
  const container = getToastContainer()

  const toastEl = document.createElement('div')
  toastEl.className = 'animate-fade-in'
  container.appendChild(toastEl)

  const root = createRoot(toastEl)
  root.render(<ToastContent message={message} type={type} />)

  setTimeout(() => {
    toastEl.classList.add('animate-fade-out')
    toastEl.addEventListener('animationend', () => {
      root.unmount()
      toastEl.remove()
    })
  }, duration)
}

export const toast = {
  success: (message: string, config?: Omit<ToastConfig, 'type'>) =>
    show(message, { ...config, type: 'success' }),
  error: (message: string, config?: Omit<ToastConfig, 'type'>) =>
    show(message, { ...config, type: 'error' }),
  info: (message: string, config?: Omit<ToastConfig, 'type'>) =>
    show(message, { ...config, type: 'info' }),
}
