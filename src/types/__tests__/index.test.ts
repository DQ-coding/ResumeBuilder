/**
 * 类型定义和迁移函数的单元测试
 *
 * 验证：
 * - createEmptyResumeContent 返回正确的新格式结构
 * - migrateResumeContent 正确处理旧格式迁移
 * - migrateResumeContent 对新格式数据直接返回
 * - getSectionByType / getSectionContent 正确获取 section
 * - generateSectionId 生成唯一 ID
 * - SECTION_TITLE_MAP 包含所有预置类型
 *
 * @spec phase2-iteration
 */

import {
  createEmptyResumeContent,
  migrateResumeContent,
  generateSectionId,
  getSectionByType,
  getSectionContent,
  SECTION_TITLE_MAP,
  type ResumeContent,
  type LegacyResumeContent,
  type SectionType,
} from '@/types'

describe('createEmptyResumeContent', () => {
  it('返回包含 5 个预置 section 的新格式结构', () => {
    const content = createEmptyResumeContent()

    expect(content.sections).toHaveLength(5)
    expect(content.sections.map((s) => s.type)).toEqual([
      'basic',
      'summary',
      'workExperience',
      'education',
      'skills',
    ])
  })

  it('每个 section 有唯一 id', () => {
    const content = createEmptyResumeContent()
    const ids = content.sections.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('每个 section 的 title 与 SECTION_TITLE_MAP 一致', () => {
    const content = createEmptyResumeContent()
    for (const section of content.sections) {
      expect(section.title).toBe(SECTION_TITLE_MAP[section.type as SectionType])
    }
  })

  it('basic section 的 content 有全部字段', () => {
    const content = createEmptyResumeContent()
    const basic = content.sections.find((s) => s.type === 'basic')!
    expect(basic.content).toEqual({
      name: '',
      title: '',
      phone: '',
      email: '',
      avatar: '',
      age: '',
      gender: '',
      targetCity: '',
    })
  })

  it('summary section 的 content 为空字符串', () => {
    const content = createEmptyResumeContent()
    const summary = content.sections.find((s) => s.type === 'summary')!
    expect(summary.content).toBe('')
  })

  it('数组类型的 section content 为空数组', () => {
    const content = createEmptyResumeContent()
    const workExp = content.sections.find((s) => s.type === 'workExperience')!
    const education = content.sections.find((s) => s.type === 'education')!
    const skills = content.sections.find((s) => s.type === 'skills')!

    expect(workExp.content).toEqual([])
    expect(education.content).toEqual([])
    expect(skills.content).toEqual([])
  })
})

describe('migrateResumeContent', () => {
  it('旧格式完整数据正确迁移为新格式', () => {
    const legacy: LegacyResumeContent = {
      basic: { name: '张三', title: '工程师', phone: '138', email: 'a@b.c', avatar: '' },
      summary: '我是张三',
      workExperience: [{ company: 'A公司', position: '开发', startDate: '2020-01', endDate: '2023-06', description: ['负责开发'] }],
      education: [{ school: '北大', major: 'CS', degree: '本科', startDate: '2016-09', endDate: '2020-06' }],
      skills: [{ name: 'React', level: 'proficient' }],
    }

    const result = migrateResumeContent(legacy)

    expect(result.sections).toHaveLength(5)
    expect(result.sections[0].type).toBe('basic')
    expect(result.sections[0].content).toEqual(legacy.basic)
    expect(result.sections[1].type).toBe('summary')
    expect(result.sections[1].content).toBe('我是张三')
    expect(result.sections[2].type).toBe('workExperience')
    expect(result.sections[2].content).toEqual(legacy.workExperience)
    expect(result.sections[3].type).toBe('education')
    expect(result.sections[3].content).toEqual(legacy.education)
    expect(result.sections[4].type).toBe('skills')
    expect(result.sections[4].content).toEqual(legacy.skills)
  })

  it('旧格式空数据迁移时使用默认值', () => {
    const legacy = {} as LegacyResumeContent

    const result = migrateResumeContent(legacy)

    expect(result.sections).toHaveLength(5)
    const basic = result.sections.find((s) => s.type === 'basic')!
    expect(basic.content).toEqual({
      name: '',
      title: '',
      phone: '',
      email: '',
      avatar: '',
      age: '',
      gender: '',
      targetCity: '',
    })
    const summary = result.sections.find((s) => s.type === 'summary')!
    expect(summary.content).toBe('')
  })

  it('新格式数据直接返回，不做转换', () => {
    const newFormat: ResumeContent = createEmptyResumeContent()
    newFormat.sections[0].content = {
      name: '李四',
      title: '设计师',
      phone: '',
      email: '',
      avatar: '',
      age: '',
      gender: '',
      targetCity: '',
    }

    const result = migrateResumeContent(newFormat)

    expect(result).toBe(newFormat)
    expect(result.sections[0].content).toEqual({
      name: '李四',
      title: '设计师',
      phone: '',
      email: '',
      avatar: '',
      age: '',
      gender: '',
      targetCity: '',
    })
  })

  it('迁移后每个 section 有唯一 id', () => {
    const legacy: LegacyResumeContent = {
      basic: { name: '', title: '', phone: '', email: '', avatar: '' },
      summary: '',
      workExperience: [],
      education: [],
      skills: [],
    }

    const result = migrateResumeContent(legacy)
    const ids = result.sections.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

describe('generateSectionId', () => {
  it('生成以 "section-" 开头的字符串', () => {
    const id = generateSectionId()
    expect(id).toMatch(/^section-/)
  })

  it('多次调用生成不同 ID', () => {
    const id1 = generateSectionId()
    const id2 = generateSectionId()
    expect(id1).not.toBe(id2)
  })
})

describe('getSectionByType', () => {
  it('返回指定类型的 section', () => {
    const content = createEmptyResumeContent()
    const basic = getSectionByType(content, 'basic')
    expect(basic).toBeDefined()
    expect(basic!.type).toBe('basic')
  })

  it('不存在的自定义类型返回 undefined', () => {
    const content = createEmptyResumeContent()
    const custom = getSectionByType(content, 'custom')
    expect(custom).toBeUndefined()
  })
})

describe('getSectionContent', () => {
  it('返回 basic section 的 BasicInfo 内容', () => {
    const content = createEmptyResumeContent()
    const basicInfo = getSectionContent(content, 'basic')
    expect(basicInfo).toEqual({
      name: '',
      title: '',
      phone: '',
      email: '',
      avatar: '',
      age: '',
      gender: '',
      targetCity: '',
    })
  })

  it('返回 summary section 的字符串内容', () => {
    const content = createEmptyResumeContent()
    const summary = getSectionContent(content, 'summary')
    expect(summary).toBe('')
  })

  it('返回 workExperience section 的数组内容', () => {
    const content = createEmptyResumeContent()
    const workExp = getSectionContent(content, 'workExperience')
    expect(workExp).toEqual([])
  })
})

describe('SECTION_TITLE_MAP', () => {
  it('包含所有预置类型的中文标题', () => {
    const presetTypes: SectionType[] = ['basic', 'summary', 'workExperience', 'education', 'skills', 'custom']
    for (const type of presetTypes) {
      expect(SECTION_TITLE_MAP[type]).toBeTruthy()
      expect(typeof SECTION_TITLE_MAP[type]).toBe('string')
    }
  })
})
