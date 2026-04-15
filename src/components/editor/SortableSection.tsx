/**
 * SortableSection 可排序模块包装组件
 *
 * 使用 @dnd-kit/sortable 实现单个 section 的拖拽排序。
 * 提供拖拽手柄，basic 模块固定首位不可拖拽。
 *
 * @spec phase2-iteration
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ResumeSection } from '@/types'

interface SortableSectionProps {
  section: ResumeSection
  children: React.ReactNode
}

function SortableSection({ section, children }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: section.type === 'basic' })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* 拖拽手柄：basic 不可拖拽 */}
      {section.type !== 'basic' && (
        <button
          type="button"
          className="absolute -left-1 top-3 z-10 flex h-6 w-6 cursor-grab items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          title="拖拽排序"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      )}
      <div className={section.type !== 'basic' ? 'pl-5' : ''}>
        {children}
      </div>
    </div>
  )
}

export default SortableSection
