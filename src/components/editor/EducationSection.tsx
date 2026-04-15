/**
 * EducationSection 教育背景编辑组件
 *
 * 支持多条教育记录的增删，每条记录含学校名、专业、学历、起止时间。
 * 修改后通过 resumeStore.updateSection 更新 education section 的 content。
 * 支持模块显隐控制。
 *
 * @spec frontend-editor @spec phase2-iteration @spec section-visibility @spec i18n
 */

import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import type { Education } from '@/types'
import { getSectionByType } from '@/types'
import SectionCollapsible from './SectionCollapsible'

function EducationSection() {
  const { t } = useTranslation()
  const { currentResume, updateSection, toggleSectionVisibility } = useResumeStore()
  const eduSection = currentResume ? getSectionByType(currentResume.content, 'education') : undefined
  const education = eduSection?.content as Education[] | undefined

  if (!education || !eduSection) return null

  const updateEducation = (items: Education[]) => {
    updateSection(eduSection.id, items)
  }

  const handleAdd = () => {
    updateEducation([
      ...education,
      { school: '', major: '', degree: '', startDate: '', endDate: '' },
    ])
  }

  const handleRemove = (index: number) => {
    updateEducation(education.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof Education, value: string) => {
    const updated = education.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    )
    updateEducation(updated)
  }

  return (
    <SectionCollapsible
      title={t('editor.sections.education')}
      visible={eduSection.visible !== false}
      onToggleVisibility={() => toggleSectionVisibility(eduSection.id)}
    >
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={index} className="relative rounded-md border border-gray-200 p-3">
            {/* 删除按钮 */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-colors"
              title={t('editor.education.deleteEducation')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-3 pr-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('editor.education.school')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => handleChange(index, 'school', e.target.value)}
                  placeholder={t('editor.education.schoolPlaceholder')}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('editor.education.major')}</label>
                  <input
                    type="text"
                    value={edu.major}
                    onChange={(e) => handleChange(index, 'major', e.target.value)}
                    placeholder={t('editor.education.majorPlaceholder')}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('editor.education.degree')}</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleChange(index, 'degree', e.target.value)}
                    placeholder={t('editor.education.degreePlaceholder')}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('common.startDate')}</label>
                  <input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('common.endDate')}</label>
                  <input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          {t('editor.education.addEducation')}
        </button>
      </div>
    </SectionCollapsible>
  )
}

export default EducationSection
