/**
 * 测试辅助函数
 *
 * 提供在测试中构建 ResumeContent 数据的便捷方法，
 * 适配第二期 sections 数组结构。
 *
 * @spec phase2-iteration
 */

import type {
  ResumeContent,
  ResumeSection,
  BasicInfo,
  WorkExperience,
  Education,
  Skill,
  CustomItem,
} from '@/types'
import { createEmptyResumeContent, generateSectionId } from '@/types'

/** 获取指定类型 section 的内容（断言非空） */
export function getSectionContent<T extends ResumeSection['type']>(
  content: ResumeContent,
  type: T,
): ResumeSection['content'] {
  const section = content.sections.find((s) => s.type === type)
  if (!section) throw new Error(`Section "${type}" not found`)
  return section.content
}

/** 更新 ResumeContent 中指定类型 section 的 content */
export function setSectionContent(
  content: ResumeContent,
  type: ResumeSection['type'],
  newContent: ResumeSection['content'],
): ResumeContent {
  return {
    sections: content.sections.map((s) =>
      s.type === type ? { ...s, content: newContent } : s,
    ),
  }
}

/** 创建带自定义 basic 数据的 ResumeContent */
export function createResumeWithBasic(basic: Partial<BasicInfo>): ResumeContent {
  const content = createEmptyResumeContent()
  return {
    sections: content.sections.map((s) =>
      s.type === 'basic'
        ? { ...s, content: { ...(s.content as BasicInfo), ...basic } }
        : s,
    ),
  }
}

/** 创建带自定义 summary 的 ResumeContent */
export function createResumeWithSummary(summary: string): ResumeContent {
  const content = createEmptyResumeContent()
  return {
    sections: content.sections.map((s) =>
      s.type === 'summary' ? { ...s, content: summary } : s,
    ),
  }
}

/** 创建带自定义 workExperience 的 ResumeContent */
export function createResumeWithWorkExperience(items: WorkExperience[]): ResumeContent {
  const content = createEmptyResumeContent()
  return {
    sections: content.sections.map((s) =>
      s.type === 'workExperience' ? { ...s, content: items } : s,
    ),
  }
}

/** 创建带自定义 education 的 ResumeContent */
export function createResumeWithEducation(items: Education[]): ResumeContent {
  const content = createEmptyResumeContent()
  return {
    sections: content.sections.map((s) =>
      s.type === 'education' ? { ...s, content: items } : s,
    ),
  }
}

/** 创建带自定义 skills 的 ResumeContent */
export function createResumeWithSkills(items: Skill[]): ResumeContent {
  const content = createEmptyResumeContent()
  return {
    sections: content.sections.map((s) =>
      s.type === 'skills' ? { ...s, content: items } : s,
    ),
  }
}

/** 创建带自定义模块的 ResumeContent */
export function createResumeWithCustomSection(
  title: string,
  items: CustomItem[],
): ResumeContent {
  const content = createEmptyResumeContent()
  return {
    sections: [
      ...content.sections,
      {
        id: generateSectionId(),
        type: 'custom',
        title,
        content: items,
      },
    ],
  }
}
