/**
 * PreviewPanel 预览区容器组件
 *
 * 提供 A4 纸张效果容器，等比缩放适配右侧栏宽度。
 * 使用 ResizeObserver 监听容器尺寸变化，动态计算缩放比例。
 *
 * @spec frontend-preview
 */

import { useRef, useState, useEffect, type ReactNode } from 'react'

/** A4 宽度 @96dpi：210mm ≈ 794px */
const A4_WIDTH_PX = 794
/** A4 高度 @96dpi：297mm ≈ 1123px */
const A4_HEIGHT_PX = 1123

interface PreviewPanelProps {
  children: ReactNode
}

function PreviewPanel({ children }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      const containerWidth = container.clientWidth
      // 留出左右 padding（各 32px）
      const availableWidth = containerWidth - 64
      const newScale = Math.min(availableWidth / A4_WIDTH_PX, 1)
      setScale(newScale)
    }

    updateScale()

    const observer = new ResizeObserver(updateScale)
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-gray-100 py-8"
      data-testid="preview-panel"
    >
      <div className="flex justify-center">
        <div
          style={{
            width: `${A4_WIDTH_PX}px`,
            minHeight: `${A4_HEIGHT_PX}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
          className="rounded-lg bg-white shadow-lg"
        >
          {children}
        </div>
      </div>
      {/* 缩放后底部留白补偿，防止内容被截断 */}
      <div style={{ height: `${A4_HEIGHT_PX * (1 - scale)}px` }} />
    </div>
  )
}

export default PreviewPanel
export { A4_WIDTH_PX, A4_HEIGHT_PX }
