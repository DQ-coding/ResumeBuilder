/**
 * SkillsSection 技能特长编辑组件
 *
 * 支持多条技能记录的增删，每条含名称和熟练度选择。
 * 修改后通过 resumeStore.updateSection 更新 skills section 的 content。
 * 支持模块显隐控制。
 *
 * @spec frontend-editor @spec phase2-iteration @spec section-visibility @spec i18n
 */

import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import type { Skill, SkillLevel } from '@/types'
import { getSectionByType } from '@/types'
import SectionCollapsible from './SectionCollapsible'

function SkillsSection() {
  const { t } = useTranslation()
  const { currentResume, updateSection, toggleSectionVisibility } = useResumeStore()
  const skillsSection = currentResume ? getSectionByType(currentResume.content, 'skills') : undefined
  const skills = skillsSection?.content as Skill[] | undefined

  const skillLevelOptions: { value: SkillLevel; label: string }[] = [
    { value: 'beginner', label: t('editor.skills.beginner') },
    { value: 'proficient', label: t('editor.skills.proficient') },
    { value: 'expert', label: t('editor.skills.expert') },
  ]

  if (!skills || !skillsSection) return null

  const updateSkills = (items: Skill[]) => {
    updateSection(skillsSection.id, items)
  }

  const handleAdd = () => {
    updateSkills([...skills, { name: '', level: 'proficient' }])
  }

  const handleRemove = (index: number) => {
    updateSkills(skills.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof Skill, value: string) => {
    const updated = skills.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    )
    updateSkills(updated)
  }

  return (
    <SectionCollapsible
      title={t('editor.sections.skills')}
      visible={skillsSection.visible !== false}
      onToggleVisibility={() => toggleSectionVisibility(skillsSection.id)}
    >
      <div className="space-y-3">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={skill.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
              placeholder={t('editor.skills.namePlaceholder')}
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={skill.level}
              onChange={(e) => handleChange(index, 'level', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {skillLevelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title={t('editor.skills.deleteSkill')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          {t('editor.skills.addSkill')}
        </button>
      </div>
    </SectionCollapsible>
  )
}

export default SkillsSection
