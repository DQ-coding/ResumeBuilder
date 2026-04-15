/**
 * SummarySection 个人简介编辑组件
 *
 * 使用 RichTextEditor 编辑个人简介，支持富文本（加粗、列表）。
 * 内容以 HTML 格式存储。
 * 支持模块显隐控制。
 *
 * @spec frontend-editor @spec phase2-iteration @spec section-visibility @spec i18n
 */

import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import { getSectionByType } from '@/types'
import SectionCollapsible from './SectionCollapsible'
import RichTextEditor from './RichTextEditor'

function SummarySection() {
  const { t } = useTranslation()
  const { currentResume, updateSection, toggleSectionVisibility } = useResumeStore()
  const summarySection = currentResume ? getSectionByType(currentResume.content, 'summary') : undefined
  const summary = summarySection?.content as string | undefined

  if (summary === undefined || !summarySection) return null

  return (
    <SectionCollapsible
      title={t('editor.sections.summary')}
      visible={summarySection.visible !== false}
      onToggleVisibility={() => toggleSectionVisibility(summarySection.id)}
    >
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {t('editor.summary.label')}
        </label>
        <RichTextEditor
          value={summary}
          onChange={(html) => updateSection(summarySection.id, html)}
        />
      </div>
    </SectionCollapsible>
  )
}

export default SummarySection
