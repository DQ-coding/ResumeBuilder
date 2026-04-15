/**
 * WorkExperienceSection 工作经历编辑组件
 *
 * 支持多条工作记录的增删，每条记录内含公司名、职位、起止时间、描述列表。
 * 描述列表支持多条增删。
 * 修改后通过 resumeStore.updateSection 更新 workExperience section 的 content。
 * 支持模块显隐控制。
 *
 * @spec frontend-editor @spec phase2-iteration @spec section-visibility @spec i18n
 */

import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import type { WorkExperience } from '@/types'
import { getSectionByType } from '@/types'
import SectionCollapsible from './SectionCollapsible'
import RichTextEditor from './RichTextEditor'

function WorkExperienceSection() {
  const { t } = useTranslation()
  const { currentResume, updateSection, toggleSectionVisibility } = useResumeStore()
  const workSection = currentResume ? getSectionByType(currentResume.content, 'workExperience') : undefined
  const workExperience = workSection?.content as WorkExperience[] | undefined

  if (!workExperience || !workSection) return null

  const updateWorkExperience = (items: WorkExperience[]) => {
    updateSection(workSection.id, items)
  }

  const handleAdd = () => {
    updateWorkExperience([
      ...workExperience,
      { company: '', position: '', startDate: '', endDate: '', description: [''] },
    ])
  }

  const handleRemove = (index: number) => {
    updateWorkExperience(workExperience.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof WorkExperience, value: string | string[]) => {
    const updated = workExperience.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    )
    updateWorkExperience(updated)
  }

  const handleAddDescription = (index: number) => {
    const updated = workExperience.map((item, i) =>
      i === index ? { ...item, description: [...item.description, ''] } : item,
    )
    updateWorkExperience(updated)
  }

  const handleRemoveDescription = (expIndex: number, descIndex: number) => {
    const updated = workExperience.map((item, i) =>
      i === expIndex
        ? { ...item, description: item.description.filter((_, di) => di !== descIndex) }
        : item,
    )
    updateWorkExperience(updated)
  }

  const handleChangeDescription = (expIndex: number, descIndex: number, value: string) => {
    const updated = workExperience.map((item, i) =>
      i === expIndex
        ? {
            ...item,
            description: item.description.map((d, di) => (di === descIndex ? value : d)),
          }
        : item,
    )
    updateWorkExperience(updated)
  }

  return (
    <SectionCollapsible
      title={t('editor.sections.workExperience')}
      visible={workSection.visible !== false}
      onToggleVisibility={() => toggleSectionVisibility(workSection.id)}
    >
      <div className="space-y-4">
        {workExperience.map((exp, index) => (
          <div key={index} className="relative rounded-md border border-gray-200 p-3">
            {/* 删除按钮 */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-colors"
              title={t('editor.workExperience.deleteWork')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-3 pr-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('editor.workExperience.company')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleChange(index, 'company', e.target.value)}
                    placeholder={t('editor.workExperience.companyPlaceholder')}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('editor.workExperience.position')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleChange(index, 'position', e.target.value)}
                    placeholder={t('editor.workExperience.positionPlaceholder')}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('common.startDate')}</label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('common.endDate')}</label>
                  <input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 描述列表 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('editor.workExperience.description')}</label>
                <div className="space-y-2">
                  {exp.description.map((desc, descIndex) => (
                    <div key={descIndex}>
                      <RichTextEditor
                        value={desc}
                        onChange={(html) => handleChangeDescription(index, descIndex, html)}
                        placeholder={t('common.descPlaceholder')}
                        rows={2}
                      />
                      {exp.description.length > 1 && (
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
          {t('editor.workExperience.addWork')}
        </button>
      </div>
    </SectionCollapsible>
  )
}

export default WorkExperienceSection
