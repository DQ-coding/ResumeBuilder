/**
 * exportPdf 模块测试
 *
 * 验证 html2canvas + jsPDF 导出流程的核心逻辑。
 * 由于 html2canvas 和 jsPDF 依赖浏览器 DOM，
 * 测试重点验证辅助函数和导出函数的调用结构。
 *
 * @spec pdf-export-refactor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock 外部依赖 — 必须在 import 前
const mockAddImage = vi.fn()
const mockAddPage = vi.fn()
const mockSave = vi.fn()

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,test'),
    width: 1588,
    height: 2246,
  }),
}))

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(function () {
    return {
      addImage: mockAddImage,
      addPage: mockAddPage,
      save: mockSave,
    }
  }),
}))

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn().mockReturnValue({
    render: vi.fn(),
    unmount: vi.fn(),
  }),
}))

vi.mock('react-i18next', () => ({
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/i18n', () => ({
  default: { language: 'zh' },
}))

vi.mock('@/pdf/templateRegistry', () => ({
  getPreviewComponent: vi.fn().mockReturnValue(function () {
    return null
  }),
}))

vi.mock('@/components/preview/ClassicTemplate', () => ({
  default: function () {
    return null
  },
}))

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { createRoot } from 'react-dom/client'
import { exportPdf } from '@/utils/exportPdf'
import { createEmptyResumeContent } from '@/types'

describe('exportPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('创建离屏容器并渲染模板组件', async () => {
    const content = createEmptyResumeContent()
    await exportPdf(content)

    // 验证 createRoot 被调用（说明在离屏容器中渲染了模板）
    expect(createRoot).toHaveBeenCalled()

    // 验证 html2canvas 被调用以截图
    expect(html2canvas).toHaveBeenCalled()

    // 验证 jsPDF 被创建用于生成 PDF
    expect(jsPDF).toHaveBeenCalledWith(
      expect.objectContaining({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      }),
    )
  })

  it('html2canvas 使用正确的 A4 尺寸和缩放', async () => {
    const content = createEmptyResumeContent()
    await exportPdf(content)

    expect(html2canvas).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        scale: 2,
        useCORS: true,
        allowTaint: false,
        width: 794,
        windowWidth: 794,
      }),
    )
  })

  it('导出后清理离屏容器', async () => {
    const content = createEmptyResumeContent()
    const initialDomCount = document.body.children.length

    await exportPdf(content)

    // 容器应被移除，DOM 节点数量恢复
    expect(document.body.children.length).toBe(initialDomCount)
  })

  it('生成 PDF 时调用 addImage 和 save', async () => {
    const content = createEmptyResumeContent()

    await exportPdf(content)

    expect(mockAddImage).toHaveBeenCalled()
    expect(mockSave).toHaveBeenCalled()
  })

  it('使用自定义 fileName 参数', async () => {
    const content = createEmptyResumeContent()

    await exportPdf(content, 'classic', '自定义文件名')

    expect(mockSave).toHaveBeenCalledWith('自定义文件名_简历.pdf')
  })

  it('无姓名时使用默认文件名', async () => {
    const content = createEmptyResumeContent()

    await exportPdf(content)

    expect(mockSave).toHaveBeenCalledWith('简历_简历.pdf')
  })
})
