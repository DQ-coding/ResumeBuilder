/**
 * RichTextEditor 富文本编辑器组件
 *
 * 基于 Tiptap 实现，支持加粗、无序列表、有序列表。
 * 输出 HTML 格式内容，用于个人简介、工作描述等字段。
 *
 * @spec phase2-iteration
 */

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

interface RichTextEditorProps {
  /** 当前 HTML 内容 */
  value: string
  /** 内容变更回调 */
  onChange: (html: string) => void
}

function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        italic: false,
      }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-sm text-gray-900',
      },
    },
  })

  // 外部 value 变更时同步到编辑器
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>')
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="rounded-md border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      {/* 工具栏 */}
      <div className="flex items-center gap-1 border-b border-gray-200 px-2 py-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            editor.isActive('bold')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
          title="加粗"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-xs transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
          title="无序列表"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-xs transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
          title="有序列表"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </button>
      </div>
      {/* 编辑区域 */}
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
