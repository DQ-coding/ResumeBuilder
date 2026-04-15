/**
 * MinimalTemplate 极简模板预览组件
 *
 * 极简主义风格简历模板：
 * - 无边框无装饰，纯文字排版，大量留白
 * - 超细分割线，小字号，紧凑布局
 * - 配色：纯灰文字，无彩色强调
 *
 * 按 sections 顺序渲染，支持自定义模块。
 * 空数据模块不渲染，避免空白区块。
 * 第三期迭代：隐藏模块（visible === false）不渲染。
 *
 * @spec phase2-iteration @spec section-visibility
 */

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
import { injectListStylesMinimal } from '@/utils/htmlStyleHelper'

/** 格式化月份显示 */
function formatMonth(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr
}

/** 区块标题 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">
      {children}
    </h3>
  )
}

/** 工作经历条目 */
function WorkItem({ item }: { item: WorkExperience }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-gray-800">{item.company}</span>
        <span className="text-[10px] text-gray-400">
          {formatMonth(item.startDate)}
          {item.startDate && item.endDate && ' – '}
          {formatMonth(item.endDate)}
        </span>
      </div>
      {item.position && <span className="text-[10px] text-gray-500"> {item.position}</span>}
      {item.description.filter(Boolean).length > 0 && (
        <div className="mt-0.5">
          {item.description.filter(Boolean).map((desc, i) => {
            const isHtml = desc.includes('<')
            if (!isHtml) {
              return (
                <span key={i} className="text-[10px] text-gray-600 leading-relaxed">
                  {i > 0 && ' · '}
                  {desc}
                </span>
              )
            }
            // 对于包含列表的 HTML，单独一行显示
            if (desc.includes('<ul>') || desc.includes('<ol>')) {
              return (
                <div
                  key={i}
                  className="text-[10px] text-gray-600 leading-relaxed mt-1"
                  dangerouslySetInnerHTML={{ __html: injectListStylesMinimal(desc) }}
                />
              )
            }
            // 纯 HTML 内容用 · 分隔
            return (
              <span key={i} className="text-[10px] text-gray-600 leading-relaxed">
                {i > 0 && ' · '}
                <span dangerouslySetInnerHTML={{ __html: desc }} />
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** 教育背景条目 */
function EducationItem({ item }: { item: Education }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-gray-800">{item.school}</span>
        <span className="text-[10px] text-gray-400">
          {formatMonth(item.startDate)}
          {item.startDate && item.endDate && ' – '}
          {formatMonth(item.endDate)}
        </span>
      </div>
      {(item.major || item.degree) && (
        <span className="text-[10px] text-gray-500">
          {[item.degree, item.major].filter(Boolean).join(' · ')}
        </span>
      )}
    </div>
  )
}

/** 自定义模块条目 */
function CustomItemView({ item }: { item: CustomItem }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-gray-800">{item.title}</span>
        <span className="text-[10px] text-gray-400">
          {formatMonth(item.startDate)}
          {item.startDate && item.endDate && ' – '}
          {formatMonth(item.endDate)}
        </span>
      </div>
      {item.subtitle && <span className="text-[10px] text-gray-500"> {item.subtitle}</span>}
      {item.description.filter(Boolean).length > 0 && (
        <div className="mt-0.5">
          {item.description.filter(Boolean).map((desc, i) => {
            const isHtml = desc.includes('<')
            if (!isHtml) {
              return (
                <span key={i} className="text-[10px] text-gray-600 leading-relaxed">
                  {i > 0 && ' · '}
                  {desc}
                </span>
              )
            }
            // 对于包含列表的 HTML，单独一行显示
            if (desc.includes('<ul>') || desc.includes('<ol>')) {
              return (
                <div
                  key={i}
                  className="text-[10px] text-gray-600 leading-relaxed mt-1"
                  dangerouslySetInnerHTML={{ __html: injectListStylesMinimal(desc) }}
                />
              )
            }
            // 纯 HTML 内容用 · 分隔
            return (
              <span key={i} className="text-[10px] text-gray-600 leading-relaxed">
                {i > 0 && ' · '}
                <span dangerouslySetInnerHTML={{ __html: desc }} />
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface MinimalTemplateProps {
  content?: ResumeContent
}

function MinimalTemplate({ content }: MinimalTemplateProps) {
  const { currentResume } = useResumeStore()
  const data = content ?? currentResume?.content

  if (!data) return null

  const basicSection = getSectionByType(data, 'basic')
  const otherSections = data.sections.filter(
    (s) => s.type !== 'basic' && s.visible !== false,
  )

  const basic = basicSection?.visible !== false ? (basicSection?.content as BasicInfo | undefined) : undefined

  return (
    <div className="px-14 py-12" data-testid="minimal-template">
      {/* 顶部：姓名 + 职位 + 联系方式 */}
      {basic && (basic.avatar || basic.name || basic.title || basic.gender || basic.age || basic.targetCity) && (
        <header className="mb-6">
          <div className="flex items-center gap-4">
            {basic.avatar && (
              <img
                src={basic.avatar}
                alt={basic.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div>
              {basic.name && <h1 className="text-lg font-light text-gray-900 tracking-wide">{basic.name}</h1>}
              {basic.title && (
                <p className="text-xs text-gray-500">{basic.title}</p>
              )}
            </div>
          </div>
          {(basic.gender || basic.age || basic.targetCity) && (
            <p className="mt-2 text-[10px] text-gray-400">
              {[basic.gender, basic.age, basic.targetCity].filter(Boolean).join(' · ')}
            </p>
          )}
          {(basic.phone || basic.email) && (
            <p className="mt-1 text-[10px] text-gray-400">
              {[basic.phone, basic.email].filter(Boolean).join(' · ')}
            </p>
          )}
        </header>
      )}

      <hr className="border-gray-200 mb-6" />

      {/* 其余模块按顺序渲染 */}
      {otherSections.map((section) => {
        switch (section.type) {
          case 'summary': {
            const summary = section.content as string
            if (!summary) return null
            const isHtml = summary.includes('<')
            return (
              <section key={section.id} className="mb-5">
                <SectionTitle>{section.title}</SectionTitle>
                {isHtml ? (
                  <div className="text-[10px] leading-relaxed text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: summary }} />
                ) : (
                  <p className="text-[10px] leading-relaxed text-gray-600 whitespace-pre-line">{summary}</p>
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
          case 'skills': {
            const skills = section.content as Skill[]
            if (skills.length === 0) return null
            return (
              <section key={section.id} className="mb-5">
                <SectionTitle>{section.title}</SectionTitle>
                <p className="text-[10px] text-gray-600">
                  {skills.map((s) => s.name).join(' · ')}
                </p>
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
  )
}

export default MinimalTemplate
