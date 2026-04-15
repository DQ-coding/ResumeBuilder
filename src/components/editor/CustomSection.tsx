/**
 * CustomSection 自定义模块编辑组件
 *
 * 用户可自定义标题的模块，支持多条记录增删，
 * 每条记录含 title、subtitle、日期范围、描述列表。
 * 支持修改模块标题和删除整个模块。
 * 支持模块显隐控制。
 *
 * @spec phase2-iteration @spec section-visibility @spec i18n
 */

import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import type { CustomItem } from '@/types'
import SectionCollapsible from './SectionCollapsible'
import RichTextEditor from './RichTextEditor'

interface CustomSectionProps {
  sectionId: string
  title: string
  items: CustomItem[]
  visible?: boolean
}

function CustomSection({ sectionId, title, items, visible = true }: CustomSectionProps) {
  const { t } = useTranslation()
  const { updateSection, removeSection, updateSectionTitle, toggleSectionVisibility } = useResumeStore()

  const updateItems = (newItems: CustomItem[]) => {
    updateSection(sectionId, newItems)
  }

  const handleAdd = () => {
    updateItems([
      ...items,
      { title: '', subtitle: '', startDate: '', endDate: '', description: [''] },
    ])
  }

  const handleRemove = (index: number) => {
    updateItems(items.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof CustomItem, value: string | string[]) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    )
    updateItems(updated)
  }

  const handleAddDescription = (index: number) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, description: [...item.description, ''] } : item,
    )
    updateItems(updated)
  }

  const handleRemoveDescription = (itemIndex: number, descIndex: number) => {
    const updated = items.map((item, i) =>
      i === itemIndex
        ? { ...item, description: item.description.filter((_, di) => di !== descIndex) }
        : item,
    )
    updateItems(updated)
  }

  const handleChangeDescription = (itemIndex: number, descIndex: number, value: string) => {
    const updated = items.map((item, i) =>
      i === itemIndex
        ? { ...item, description: item.description.map((d, di) => (di === descIndex ? value : d)) }
        : item,
    )
    updateItems(updated)
  }

  const handleTitleChange = (newTitle: string) => {
    updateSectionTitle(sectionId, newTitle)
  }

  const handleDeleteSection = () => {
    removeSection(sectionId)
  }

  return (
    <SectionCollapsible
      title={title}
      visible={visible}
      onToggleVisibility={() => toggleSectionVisibility(sectionId)}
    >
      <div className="space-y-4">
        {/* 模块标题编辑 + 删除按钮 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('editor.customSection.titlePlaceholder')}
          />
          <button
            type="button"
            onClick={handleDeleteSection}
            className="text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap"
          >
            {t('editor.customSection.deleteSection')}
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="relative rounded-md border border-gray-200 p-3">
            {/* 删除条目按钮 */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-colors"
              title={t('editor.customSection.deleteItem')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-3 pr-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('editor.customSection.itemTitle')}</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleChange(index, 'title', e.target.value)}
                    placeholder={t('editor.customSection.itemTitlePlaceholder')}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('editor.customSection.subtitle')}</label>
                  <input
                    type="text"
                    value={item.subtitle}
                    onChange={(e) => handleChange(index, 'subtitle', e.target.value)}
                    placeholder={t('editor.customSection.subtitlePlaceholder')}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('common.startDate')}</label>
                  <input
                    type="month"
                    value={item.startDate}
                    onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('common.endDate')}</label>
                  <input
                    type="month"
                    value={item.endDate}
                    onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 描述列表 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('common.description')}</label>
                <div className="space-y-2">
                  {item.description.map((desc, descIndex) => (
                    <div key={descIndex}>
                      <RichTextEditor
                        value={desc}
                        onChange={(html) => handleChangeDescription(index, descIndex, html)}
                        placeholder={t('common.descPlaceholder')}
                        rows={2}
                      />
                      {item.description.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDescription(index, descIndex)}
                          className="mt-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                          title={t('common.deleteDescription')}
                        >
                          {t('common.deleteDescription')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddDescription(index)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('common.addDescription')}
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          {t('editor.customSection.addItem')}
        </button>
      </div>
    </SectionCollapsible>
  )
}

export default CustomSection
