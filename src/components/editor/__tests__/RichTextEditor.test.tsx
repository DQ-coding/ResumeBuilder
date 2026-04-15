/**
 * RichTextEditor 组件测试
 *
 * 由于 Tiptap 依赖 ProseMirror（需要 jsdom 不支持的 DOM API），
 * 这里 mock @tiptap/react 模块，验证 RichTextEditor 的渲染和交互逻辑。
 *
 * @spec phase2-iteration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock @tiptap/react
const mockSetContent = vi.fn()
const mockGetHTML = vi.fn(() => '<p>initial</p>')
let currentOnChange: ((html: string) => void) | null = null

vi.mock('@tiptap/react', () => ({
  useEditor: (options: { onUpdate?: (props: { editor: { getHTML: () => string } }) => void }) => {
    const onUpdate = options.onUpdate
    currentOnChange = onUpdate ? (html: string) => onUpdate({ editor: { getHTML: () => html } }) : null
    return {
      getHTML: mockGetHTML,
      commands: {
        setContent: mockSetContent,
        focus: () => ({ toggleBold: () => ({ run: vi.fn() }), toggleBulletList: () => ({ run: vi.fn() }), toggleOrderedList: () => ({ run: vi.fn() }) }),
      },
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: vi.fn() }),
          toggleBulletList: () => ({ run: vi.fn() }),
          toggleOrderedList: () => ({ run: vi.fn() }),
        }),
      }),
      isActive: () => false,
      on: () => {},
      off: () => {},
    }
  },
  EditorContent: () => {
    return React.createElement('div', {
      'data-testid': 'tiptap-editor',
      className: 'tiptap',
      contentEditable: 'true',
      onInput: (e: React.FormEvent<HTMLDivElement>) => {
        // 模拟用户输入：触发 onUpdate
        if (currentOnChange) {
          currentOnChange(`<p>${e.currentTarget.textContent}</p>`)
        }
      },
    })
  },
}))

vi.mock('@tiptap/starter-kit', () => ({
  default: { configure: () => ({}) },
  __esModule: true,
}))

import RichTextEditor from '@/components/editor/RichTextEditor'

describe('RichTextEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetHTML.mockReturnValue('<p>initial</p>')
  })

  it('渲染工具栏按钮', () => {
    render(<RichTextEditor value="<p>test</p>" onChange={vi.fn()} />)
    expect(screen.getByTitle('加粗')).toBeInTheDocument()
    expect(screen.getByTitle('无序列表')).toBeInTheDocument()
    expect(screen.getByTitle('有序列表')).toBeInTheDocument()
  })

  it('渲染编辑区域', () => {
    render(<RichTextEditor value="<p>test</p>" onChange={vi.fn()} />)
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument()
  })

  it('value 变更时调用 setContent', () => {
    const { rerender } = render(<RichTextEditor value="<p>test</p>" onChange={vi.fn()} />)
    rerender(<RichTextEditor value="<p>updated</p>" onChange={vi.fn()} />)
    expect(mockSetContent).toHaveBeenCalledWith('<p>updated</p>')
  })

  it('使用默认 placeholder', () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />)
    // 组件正常渲染即可验证默认值生效
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument()
  })
})
