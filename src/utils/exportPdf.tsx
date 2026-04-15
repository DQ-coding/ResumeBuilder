/**
 * PDF 导出工具函数
 *
 * 使用 html2canvas + jsPDF 生成 PDF，直接截取预览组件的 DOM 渲染结果，
 * 实现所见即所得导出，彻底消除预览与导出的样式差异。
 *
 * 重构原因：原先使用 @react-pdf/renderer，其 Yoga 布局引擎与浏览器 CSS
 * 引擎的字体度量、文本换行算法完全不同，导致 PDF 中经常出现提前换行
 * 或超出边界的问题，无法实现所见即所得。
 *
 * @spec pdf-export-refactor
 */

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { getPreviewComponent } from '@/pdf/templateRegistry'
import ClassicTemplate from '@/components/preview/ClassicTemplate'
import type { ResumeContent } from '@/types'

/** A4 宽度 @96dpi：210mm ≈ 794px */
const A4_WIDTH_PX = 794
/** A4 高度 @96dpi：297mm ≈ 1123px */
const A4_HEIGHT_PX = 1123
/** A4 宽度 mm */
const A4_WIDTH_MM = 210
/** A4 高度 mm */
const A4_HEIGHT_MM = 297
/** html2canvas 缩放倍率，2x ≈ 192dpi，保证打印清晰度 */
const RENDER_SCALE = 2

/**
 * 将跨域图片 URL 转换为同源代理路径
 *
 * MinIO 头像 URL 格式：http://localhost:9000/avatar/xxx.jpg
 * 代理路径格式：/minio/avatar/xxx.jpg（通过 Vite proxy 走同源）
 */
function rewriteToProxyUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin)
    // 匹配 MinIO 头像地址（localhost:9000 或其他 MinIO 端口）
    if (parsed.port === '9000' || parsed.pathname.startsWith('/avatar/')) {
      return `/minio${parsed.pathname}`
    }
  } catch {
    // 不是有效 URL，忽略
  }
  return url
}

/**
 * 导出简历为 PDF 文件
 *
 * 在隐藏的离屏容器中以 A4 像素尺寸渲染预览模板组件，
 * 使用 html2canvas 截图后通过 jsPDF 生成 A4 PDF 并自动分页下载。
 *
 * @param content 简历内容
 * @param templateId 模板 ID，默认 'classic'
 * @param fileName 文件名（不含扩展名）
 */
export async function exportPdf(
  content: ResumeContent,
  templateId: string = 'classic',
  fileName?: string,
): Promise<void> {
  // 1. 创建离屏容器，以 A4 像素尺寸渲染模板
  // 注意：使用 position:absolute + z-index:-1 而非 left:-10000px，
  // 因为 html2canvas 对视口外元素渲染可能失败
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: ${A4_WIDTH_PX}px;
    min-height: ${A4_HEIGHT_PX}px;
    background: white;
    z-index: -1;
    pointer-events: none;
  `
  document.body.appendChild(container)

  let root: ReturnType<typeof createRoot> | null = null

  try {
    // 2. 用 React 在容器中渲染预览模板组件
    const TemplateComponent = getPreviewComponent(templateId) ?? ClassicTemplate
    root = createRoot(container)
    root.render(
      <I18nextProvider i18n={i18n}>
        <TemplateComponent content={content} />
      </I18nextProvider>,
    )

    // 3. 等待 React 渲染完成和图片加载
    await waitForRender()
    await waitForImages(container)

    // 4. 将跨域图片 URL 替换为同源代理路径，避免 html2canvas CORS 错误
    rewriteImageSources(container)

    // 5. 等待代理图片加载
    await waitForImages(container)

    // 6. html2canvas 截图
    const canvas = await html2canvas(container, {
      scale: RENDER_SCALE,
      useCORS: true,
      allowTaint: false,
      width: A4_WIDTH_PX,
      windowWidth: A4_WIDTH_PX,
    })

    // 7. 用 jsPDF 生成 A4 PDF，自动分页
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    })

    const imgWidth = A4_WIDTH_MM
    // 按实际内容计算高度
    const contentHeight = (canvas.height * imgWidth) / canvas.width
    // 向上取整到 A4 页面的整数倍，消除浮点误差导致的空白尾页
    // 减去微小 epsilon 避免 297.001mm 这种浮点噪声被取整为两页
    const pageCount = Math.ceil(contentHeight / A4_HEIGHT_MM - 0.01)
    const imgHeight = Math.max(pageCount * A4_HEIGHT_MM, A4_HEIGHT_MM)
    const pageHeight = A4_HEIGHT_MM

    // 将整张图片按 A4 页面高度分页添加
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      0,
      position,
      imgWidth,
      imgHeight,
    )
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position -= pageHeight
      pdf.addPage()
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight,
      )
      heightLeft -= pageHeight
    }

    // 8. 构建文件名并下载
    const basicSection = content.sections.find((s) => s.type === 'basic')
    const basicName = basicSection
      ? (basicSection.content as { name: string }).name
      : ''
    const name = fileName || basicName || '简历'
    pdf.save(`${name}_简历.pdf`)

    // 9. 清理 React root
    root.unmount()
    root = null
  } catch (error) {
    console.error('[exportPdf] PDF 导出失败:', error)
    throw error
  } finally {
    // 确保容器被移除
    if (root) {
      root.unmount()
    }
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  }
}

/**
 * 将容器中所有跨域 <img> 的 src 替换为同源代理路径
 */
function rewriteImageSources(container: HTMLElement): void {
  const images = container.querySelectorAll<HTMLImageElement>('img[src]')
  for (const img of images) {
    const originalSrc = img.getAttribute('src')
    if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.startsWith('/')) {
      continue // data URL 或已经是相对路径，无需转换
    }
    const proxyUrl = rewriteToProxyUrl(originalSrc)
    if (proxyUrl !== originalSrc) {
      img.setAttribute('src', proxyUrl)
    }
  }
}

/** 等待 React 渲染完成（双重 rAF + 延迟确保 DOM 更新） */
function waitForRender(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 300)
      })
    })
  })
}

/** 等待容器内所有图片加载完成 */
function waitForImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img')
  if (images.length === 0) return Promise.resolve()

  return Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
          } else {
            img.onload = () => resolve()
            img.onerror = () => resolve() // 图片加载失败也不阻塞导出
          }
        }),
    ),
  ).then(() => {})
}
