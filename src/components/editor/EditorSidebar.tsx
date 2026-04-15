/**
 * EditorSidebar 左侧编辑面板容器
 *
 * 包含所有可折叠的编辑模块，支持拖拽排序和自定义模块。
 * 使用 @dnd-kit 实现 section 顺序调整。
 * basic 模块固定首位不可拖拽。
 *
 * @spec frontend-editor @spec phase2-iteration @spec i18n
 */

import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useResumeStore } from '@/store/resumeStore'
import { generateSectionId } from '@/types'
import BasicInfoSection from './BasicInfoSection'
import SummarySection from './SummarySection'
import WorkExperienceSection from './WorkExperienceSection'
import EducationSection from './EducationSection'
import SkillsSection from './SkillsSection'
import CustomSection from './CustomSection'
import SortableSection from './SortableSection'
import Modal from '@/components/ui/Modal'

/** 根据 section type 渲染对应的编辑组件 */
function SectionEditor({ section }: { section: { id: string; type: string; title: string; content: unknown } }) {
  switch (section.type) {
    case 'basic':
      return <BasicInfoSection />
    case 'summary':
      return <SummarySection />
    case 'workExperience':
      return <WorkExperienceSection />
    case 'education':
      return <EducationSection />
    case 'skills':
      return <SkillsSection />
    case 'custom':
      return (
        <CustomSection
          sectionId={section.id}
          title={section.title}
          items={section.content as import('@/types').CustomItem[]}
          visible={(section as import('@/types').ResumeSection).visible !== false}
        />
      )
    default:
      return null
  }
}

function EditorSidebar() {
  const { t } = useTranslation()
  const { currentResume, updateSectionOrder, addSection } = useResumeStore()
  const sections = useMemo(() => currentResume?.content.sections ?? [], [currentResume?.content.sections])
  const [showAddModal, setShowAddModal] = useState(false)

  /** 预设自定义模块类型 */
  const presetCustomTypes = [
    { label: t('editor.presetTypes.project'), title: t('editor.presetTypes.project') },
    { label: t('editor.presetTypes.certificate'), title: t('editor.presetTypes.certificate') },
    { label: t('editor.presetTypes.hobby'), title: t('editor.presetTypes.hobby') },
    { label: t('editor.presetTypes.custom'), title: t('editor.presetTypes.custom') },
  ]

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // 不允许将其他 section 拖到 basic 之前
    if (newIndex === 0 && sections[0].type === 'basic') return

    const newSections = [...sections]
    const [moved] = newSections.splice(oldIndex, 1)
    newSections.splice(newIndex, 0, moved)

    updateSectionOrder(newSections)
  }, [sections, updateSectionOrder])

  const handleAddCustomSection = useCallback((title: string) => {
    addSection({
      id: generateSectionId(),
      type: 'custom',
      title,
      content: [],
    })
    setShowAddModal(false)
  }, [addSection])

  return (
    <div className="w-[420px] shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableSection key={section.id} section={section}>
                <SectionEditor section={section} />
              </SortableSection>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 添加模块按钮 */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="mt-4 w-full rounded-md border-2 border-dashed border-blue-300 py-2.5 text-sm text-blue-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        {t('editor.addSection')}
      </button>

      {/* 添加模块弹窗 */}
      <Modal open={showAddModal} onCancel={() => setShowAddModal(false)} title={t('editor.addSectionTitle')}>
        <div className="space-y-2 p-2">
          {presetCustomTypes.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleAddCustomSection(preset.title)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default EditorSidebar
