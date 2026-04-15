/**
 * ClassicTemplate 经典模板预览组件
 *
 * 按照 PRD 2.4 经典模板规格渲染简历内容：
 * - 顶部居中：姓名 + 职位 + 联系方式
 * - 个人简介段落
 * - 工作经历、教育背景、技能标签
 * - 配色：深灰文字 + 蓝色强调
 *
 * 第二期迭代：适配 ResumeContent sections 数组结构，
 * 按 sections 顺序渲染，支持自定义模块。
 * 空数据模块不渲染，避免空白区块。
 * 第三期迭代：隐藏模块（visible === false）不渲染。
 *
 * @spec frontend-preview @spec phase2-iteration @spec section-visibility
 */

import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import type {
  ResumeContent,
  BasicInfo,
  WorkExperience,
  Education,
  Skill,
  CustomItem,
  ResumeSection,
} from '@/types'
import { getSectionByType } from '@/types'
import { injectListStyles } from '@/utils/htmlStyleHelper'

/** 熟练度等级中文映射 — 使用 i18n */
function useSkillLevelLabel() {
  const { t } = useTranslation()
  return {
    beginner: t('preview.skillLevels.beginner'),
    proficient: t('preview.skillLevels.proficient'),
    expert: t('preview.skillLevels.expert'),
  }
}

/** 格式化月份显示 */
function formatMonth(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr
}

/** 工作经历条目 */
function WorkItem({ item }: { item: WorkExperience }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-gray-900">{item.company}</h4>
        <span className="text-xs text-gray-500">
          {formatMonth(item.startDate)}
          {item.startDate && item.endDate && ' - '}
          {formatMonth(item.endDate)}
        </span>
      </div>
      <p className="text-xs text-blue-600 font-medium">{item.position}</p>
      {item.description.filter(Boolean).length > 0 && (
        <ul className="mt-1 ml-4 list-disc text-xs text-gray-700 space-y-0.5">
          {item.description.filter(Boolean).map((desc, i) => {
            const isHtml = desc.includes('<')
            if (!isHtml) {
              return (
                <li key={i}>
                  {desc}
                </li>
              )
            }
            // 检查是否包含列表
            if (desc.includes('<ul>') || desc.includes('<ol>')) {
              // 为列表添加样式并在容器中渲染
              return (
                <div 
                  key={i}
                  className="list-none ml-0 space-y-0.5"
                  dangerouslySetInnerHTML={{ __html: injectListStyles(desc) }} 
                />
              )
            }
            // 其他 HTML 内容直接渲染
            return (
              <li key={i}>
                <span dangerouslySetInnerHTML={{ __html: desc }} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** 教育背景条目 */
function EducationItem({ item }: { item: Education }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-gray-900">{item.school}</h4>
        <span className="text-xs text-gray-500">
          {formatMonth(item.startDate)}
          {item.startDate && item.endDate && ' - '}
          {formatMonth(item.endDate)}
        </span>
      </div>
      {(item.major || item.degree) && (
        <p className="text-xs text-gray-600">
          {[item.degree, item.major].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  )
}

/** 技能标签 */
function SkillTag({ skill, levelLabel }: { skill: Skill; levelLabel: Record<string, string> }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
      {skill.name}
      {skill.level && (
        <span className="text-blue-400">· {levelLabel[skill.level] ?? skill.level}</span>
      )}
    </span>
  )
}

/** 自定义模块条目 */
function CustomItemView({ item }: { item: CustomItem }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
        <span className="text-xs text-gray-500">
          {formatMonth(item.startDate)}
          {item.startDate && item.endDate && ' - '}
          {formatMonth(item.endDate)}
        </span>
      </div>
      {item.subtitle && (
        <p className="text-xs text-blue-600 font-medium">{item.subtitle}</p>
      )}
      {item.description.filter(Boolean).length > 0 && (
        <ul className="mt-1 ml-4 list-disc text-xs text-gray-700 space-y-0.5">
          {item.description.filter(Boolean).map((desc, i) => {
            const isHtml = desc.includes('<')
            if (!isHtml) {
              return (
                <li key={i}>
                  {desc}
                </li>
              )
            }
            // 检查是否包含列表
            if (desc.includes('<ul>') || desc.includes('<ol>')) {
              // 为列表添加样式并在容器中渲染
              return (
                <div 
                  key={i}
                  className="list-none ml-0 space-y-0.5"
                  dangerouslySetInnerHTML={{ __html: injectListStyles(desc) }} 
                />
              )
            }
            // 其他 HTML 内容直接渲染
            return (
              <li key={i}>
                <span dangerouslySetInnerHTML={{ __html: desc }} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** 区块标题 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 border-b border-gray-200 pb-1.5 text-sm font-bold text-blue-600">
      {children}
    </h3>
  )
}

/** 渲染单个 section */
function SectionRenderer({ section, skillLevelLabel }: { section: ResumeSection; skillLevelLabel: Record<string, string> }) {
  switch (section.type) {
    case 'basic': {
      const basic = section.content as BasicInfo
      const hasName = basic.name || basic.title
      const hasProfile = basic.gender || basic.age || basic.targetCity
      const hasContact = basic.phone || basic.email
      if (!hasName && !basic.avatar) return null
      return (
        <header className="flex items-center mb-6">
          <div className="flex-1 text-center">
            {basic.name && <h1 className="text-2xl font-bold text-gray-900">{basic.name}</h1>}
            {basic.title && (
              <p className="mt-1 text-sm text-blue-600 font-medium">{basic.title}</p>
            )}
            {hasProfile && (
              <p className="mt-2 text-xs text-gray-500">
                {[basic.gender, basic.age, basic.targetCity].filter(Boolean).join(' · ')}
              </p>
            )}
            {hasContact && (
              <p className="mt-1 text-xs text-gray-500">
                {[basic.phone, basic.email].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          {basic.avatar && (
            <div className="shrink-0 ml-4">
              <img
                src={basic.avatar}
                alt={basic.name}
                className="h-24 w-[72px] rounded-md object-cover border-2 border-gray-200"
              />
            </div>
          )}
        </header>
      )
    }

    case 'summary': {
      const summary = section.content as string
      if (!summary) return null
      const isHtml = summary.includes('<')
      return (
        <section className="mb-5">
          <SectionTitle>{section.title}</SectionTitle>
          {isHtml ? (
            <div className="text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: summary }} />
          ) : (
            <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-line">{summary}</p>
          )}
        </section>
      )
    }

    case 'workExperience': {
      const workExperience = section.content as WorkExperience[]
      if (workExperience.length === 0) return null
      return (
        <section className="mb-5">
          <SectionTitle>{section.title}</SectionTitle>
          {workExperience.map((item, i) => (
            <WorkItem key={i} item={item} />
          ))}
        </section>
      )
    }

    case 'education': {
      const education = section.content as Education[]
      if (education.length === 0) return null
      return (
        <section className="mb-5">
          <SectionTitle>{section.title}</SectionTitle>
          {education.map((item, i) => (
            <EducationItem key={i} item={item} />
          ))}
        </section>
      )
    }

    case 'skills': {
      const skills = section.content as Skill[]
      if (skills.length === 0) return null
      return (
        <section className="mb-5">
          <SectionTitle>{section.title}</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <SkillTag key={i} skill={skill} levelLabel={skillLevelLabel} />
            ))}
          </div>
        </section>
      )
    }

    case 'custom': {
      const items = section.content as CustomItem[]
      if (items.length === 0) return null
      return (
        <section className="mb-5">
          <SectionTitle>{section.title}</SectionTitle>
          {items.map((item, i) => (
            <CustomItemView key={i} item={item} />
          ))}
        </section>
      )
    }

    default:
      return null
  }
}

interface ClassicTemplateProps {
  content?: ResumeContent
}

function ClassicTemplate({ content }: ClassicTemplateProps) {
  const { currentResume } = useResumeStore()
  const data = content ?? currentResume?.content
  const skillLevelLabel = useSkillLevelLabel()

  if (!data) return null

  // 确保 basic section 始终在最前面（无论 sections 顺序如何，基本信息始终置顶），隐藏模块不渲染
  const basicSection = getSectionByType(data, 'basic')
  const otherSections = data.sections.filter(
    (s) => s.type !== 'basic' && s.visible !== false,
  )

  return (
    <div className="px-12 py-10" data-testid="classic-template">
      {basicSection && basicSection.visible !== false && <SectionRenderer section={basicSection} skillLevelLabel={skillLevelLabel} />}
      {otherSections.map((section) => (
        <SectionRenderer key={section.id} section={section} skillLevelLabel={skillLevelLabel} />
      ))}
    </div>
  )
}

export default ClassicTemplate
