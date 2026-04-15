/**
 * ModernTemplate 现代模板预览组件
 *
 * 现代简约风格简历模板：
 * - 左侧深色边栏：姓名、联系方式、技能标签
 * - 右侧主体：个人简介、工作经历、教育背景、自定义模块
 * - 配色：深灰边栏 + 白色主体 + 蓝色强调
 *
 * 按 sections 顺序渲染，支持自定义模块。
 * 空数据模块不渲染，避免空白区块。
 * 第三期迭代：隐藏模块（visible === false）不渲染。
 *
 * @spec phase2-iteration @spec section-visibility
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
} from '@/types'
import { getSectionByType } from '@/types'
import { injectListStyles } from '@/utils/htmlStyleHelper'

/** 格式化月份显示 */
function formatMonth(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr
}

/** 左栏技能标签 */
function SidebarSkill({ skill }: { skill: Skill }) {
  return (
    <div className="mb-2">
      <span className="text-xs text-gray-200">{skill.name}</span>
      {skill.level && (
        <div className="mt-0.5 h-1 w-full rounded-full bg-gray-600">
          <div
            className="h-full rounded-full bg-blue-400"
            style={{
              width: skill.level === 'beginner' ? '33%' : skill.level === 'proficient' ? '66%' : '100%',
            }}
          />
        </div>
      )}
    </div>
  )
}

/** 右栏区块标题 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 border-b-2 border-blue-500 pb-1.5 text-sm font-bold text-gray-900 uppercase tracking-wide">
      {children}
    </h3>
  )
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
      {item.subtitle && <p className="text-xs text-blue-600 font-medium">{item.subtitle}</p>}
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

interface ModernTemplateProps {
  content?: ResumeContent
}

function ModernTemplate({ content }: ModernTemplateProps) {
  const { t } = useTranslation()
  const { currentResume } = useResumeStore()
  const data = content ?? currentResume?.content

  if (!data) return null

  // 分离各类型 section（隐藏模块不渲染）
  const basicSection = getSectionByType(data, 'basic')
  const skillsSection = getSectionByType(data, 'skills')
  const rightSections = data.sections.filter(
    (s) => s.type !== 'basic' && s.type !== 'skills' && s.visible !== false,
  )

  const basic = basicSection?.visible !== false ? (basicSection?.content as BasicInfo | undefined) : undefined
  const skills = skillsSection?.visible !== false ? (skillsSection?.content as Skill[] | undefined) : undefined

  return (
    <div className="flex h-full" data-testid="modern-template">
      {/* 左栏：深色边栏 */}
      <div className="w-[35%] bg-gray-800 px-6 py-10">
        {basic && (basic.avatar || basic.name || basic.title || basic.gender || basic.age || basic.targetCity) && (
          <div className="mb-8">
            {basic.avatar && (
              <div className="mb-4 flex justify-center">
                <img
                  src={basic.avatar}
                  alt={basic.name}
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-600"
                />
              </div>
            )}
            {basic.name && <h1 className="text-xl font-bold text-white">{basic.name}</h1>}
            {basic.title && (
              <p className="mt-1 text-sm text-blue-300 font-medium">{basic.title}</p>
            )}
            {(basic.gender || basic.age || basic.targetCity) && (
              <p className="mt-2 text-xs text-gray-300">
                {[basic.gender, basic.age, basic.targetCity].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        )}

        {basic && (basic.phone || basic.email) && (
          <div className="mb-8">
            <h3 className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wide">{t('preview.contact')}</h3>
            {basic.phone && <p className="text-xs text-gray-300">{basic.phone}</p>}
            {basic.email && <p className="text-xs text-gray-300">{basic.email}</p>}
          </div>
        )}

        {skills && skills.length > 0 && (
          <div>
              <h3 className="mb-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{t('preview.skills')}</h3>
            {skills.map((skill, i) => (
              <SidebarSkill key={i} skill={skill} />
            ))}
          </div>
        )}
      </div>

      {/* 右栏：主体内容 */}
      <div className="w-[65%] px-8 py-10">
        {rightSections.map((section) => {
          switch (section.type) {
            case 'summary': {
              const summary = section.content as string
              if (!summary) return null
              const isHtml = summary.includes('<')
              return (
                <section key={section.id} className="mb-5">
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
                <section key={section.id} className="mb-5">
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
                <section key={section.id} className="mb-5">
                  <SectionTitle>{section.title}</SectionTitle>
                  {education.map((item, i) => (
                    <EducationItem key={i} item={item} />
                  ))}
                </section>
              )
            }
            case 'custom': {
              const items = section.content as CustomItem[]
              if (items.length === 0) return null
              return (
                <section key={section.id} className="mb-5">
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
        })}
      </div>
    </div>
  )
}

export default ModernTemplate
