/**
 * TypeScript 类型定义
 *
 * 根据 PRD 三、数据模型定义，作为前后端共享的类型契约。
 * 原则 1：类型优先，先定义类型再写实现。
 *
 * 第二期迭代：ResumeContent 重构为基于 sections 数组的有序结构，
 * 支持模块拖拽排序、自定义模块。
 *
 * @spec frontend-base-arch @spec phase2-iteration
 */

// ========================
// 简历内容类型
// ========================

/** 技能熟练度 */
export type SkillLevel = 'beginner' | 'proficient' | 'expert'

/** 基本信息 */
export interface BasicInfo {
  name: string
  title: string
  phone: string
  email: string
  avatar: string
  age?: string
  gender?: string
  targetCity?: string
}

/** 个人简介（富文本 HTML） */
export type Summary = string

/** 工作经历条目 */
export interface WorkExperience {
  company: string
  position: string
  startDate: string
  endDate: string
  /** 每条描述为富文本 HTML */
  description: string[]
}

/** 教育背景条目 */
export interface Education {
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
}

/** 技能条目 */
export interface Skill {
  name: string
  level: SkillLevel
}

/** 自定义模块条目 — 通用结构，适配项目经历、证书荣誉等场景 */
export interface CustomItem {
  title: string
  subtitle: string
  startDate: string
  endDate: string
  /** 每条描述为富文本 HTML */
  description: string[]
}

// ========================
// Section 类型（有序模块）
// ========================

/** 模块类型枚举 */
export type SectionType =
  | 'basic'
  | 'summary'
  | 'workExperience'
  | 'education'
  | 'skills'
  | 'custom'

/** 模块标题预设映射 */
export const SECTION_TITLE_MAP: Record<SectionType, string> = {
  basic: '基本信息',
  summary: '个人简介',
  workExperience: '工作经历',
  education: '教育背景',
  skills: '技能特长',
  custom: '自定义模块',
}

/** 简历模块（有序） */
export interface ResumeSection {
  /** 唯一标识，用于拖拽排序 key */
  id: string
  /** 模块类型 */
  type: SectionType
  /** 显示标题（自定义模块可修改） */
  title: string
  /** 模块内容 — 根据 type 决定实际类型 */
  content: BasicInfo | Summary | WorkExperience[] | Education[] | Skill[] | CustomItem[]
  /** 是否在预览/PDF中显示，默认 true。undefined 视为 true，保证旧数据兼容 */
  visible?: boolean
}

/** 根据 SectionType 获取 content 的实际类型 */
export type SectionContentOf<T extends SectionType> =
  T extends 'basic' ? BasicInfo
    : T extends 'summary' ? Summary
      : T extends 'workExperience' ? WorkExperience[]
        : T extends 'education' ? Education[]
          : T extends 'skills' ? Skill[]
            : T extends 'custom' ? CustomItem[]
              : never

/** 简历内容 — 基于 sections 有序数组，支持模块排序和自定义模块 */
export interface ResumeContent {
  sections: ResumeSection[]
}

// ========================
// 旧格式类型（用于迁移兼容）
// ========================

/** 旧格式简历内容（MVP 阶段固定字段结构） */
export interface LegacyResumeContent {
  basic: BasicInfo
  summary: Summary
  workExperience: WorkExperience[]
  education: Education[]
  skills: Skill[]
}

// ========================
// API 类型
// ========================

/** 认证响应 */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserBrief
}

/** 用户简要信息 */
export interface UserBrief {
  id: string
  email: string
}

/** 简历列表项 */
export interface ResumeItem {
  id: string
  title: string
  templateId: string
  updatedAt: string
  createdAt: string
}

/** 简历详情 */
export interface ResumeDetail {
  id: string
  title: string
  templateId: string
  content: ResumeContent
  userId: string
  createdAt: string
  updatedAt: string
}

// ========================
// 请求类型
// ========================

/** 登录请求 */
export interface LoginRequest {
  email: string
  password: string
}

/** 注册请求 */
export interface RegisterRequest {
  email: string
  password: string
}

/** 刷新 Token 请求 */
export interface RefreshTokenRequest {
  refreshToken: string
}

/** 创建简历请求 */
export interface CreateResumeRequest {
  title?: string
  templateId?: string
}

/** 更新简历内容请求 */
export interface UpdateResumeRequest {
  content: ResumeContent
}

/** 重命名简历请求 */
export interface RenameResumeRequest {
  title: string
}

/** 分享状态响应 */
export interface ShareStatus {
  shareToken: string | null
  isPublic: boolean
}

/** 分享开关响应 */
export interface ToggleShareResponse {
  shareToken: string
  isPublic: boolean
}

/** 公开简历响应（无敏感信息） */
export interface PublicResumeResponse {
  title: string
  templateId: string
  content: ResumeContent
}

// ========================
// 通用类型
// ========================

/** 后端统一响应格式 */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/** 保存状态 */
export type SaveStatus = 'saved' | 'saving' | 'unsaved'

/** 模板配置 */
export interface TemplateConfig {
  /** 模板 ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description: string
  /** 缩略图 CSS 类名或内联样式（替代图片 URL，避免外部依赖） */
  thumbnailStyle: React.CSSProperties
  /** DOM 预览组件（PDF 导出直接截取此组件的渲染结果） */
  PreviewComponent: React.FC<{ content?: ResumeContent }>
}

// ========================
// 工厂函数
// ========================

/** 生成唯一 ID */
export function generateSectionId(): string {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** 创建空的简历内容（新格式） */
export function createEmptyResumeContent(): ResumeContent {
  return {
    sections: [
      {
        id: generateSectionId(),
        type: 'basic',
        title: SECTION_TITLE_MAP.basic,
        content: {
          name: '',
          title: '',
          phone: '',
          email: '',
          avatar: '',
          age: '',
          gender: '',
          targetCity: '',
        },
      },
      {
        id: generateSectionId(),
        type: 'summary',
        title: SECTION_TITLE_MAP.summary,
        content: '',
      },
      {
        id: generateSectionId(),
        type: 'workExperience',
        title: SECTION_TITLE_MAP.workExperience,
        content: [],
      },
      {
        id: generateSectionId(),
        type: 'education',
        title: SECTION_TITLE_MAP.education,
        content: [],
      },
      {
        id: generateSectionId(),
        type: 'skills',
        title: SECTION_TITLE_MAP.skills,
        content: [],
      },
    ],
  }
}

/**
 * 将旧格式 ResumeContent 迁移为新格式
 *
 * 旧格式：{ basic, summary, workExperience, education, skills }
 * 新格式：{ sections: [...ResumeSection] }
 *
 * 如果输入已是新格式（包含 sections 字段），直接返回。
 */
export function migrateResumeContent(
  data: ResumeContent | LegacyResumeContent,
): ResumeContent {
  // 已经是新格式
  if ('sections' in data && Array.isArray(data.sections)) {
    return data as ResumeContent
  }

  // 旧格式迁移
  const legacy = data as LegacyResumeContent
  return {
    sections: [
      {
        id: generateSectionId(),
        type: 'basic',
        title: SECTION_TITLE_MAP.basic,
        content: legacy.basic ?? {
          name: '',
          title: '',
          phone: '',
          email: '',
          avatar: '',
          age: '',
          gender: '',
          targetCity: '',
        },
      },
      {
        id: generateSectionId(),
        type: 'summary',
        title: SECTION_TITLE_MAP.summary,
        content: legacy.summary ?? '',
      },
      {
        id: generateSectionId(),
        type: 'workExperience',
        title: SECTION_TITLE_MAP.workExperience,
        content: legacy.workExperience ?? [],
      },
      {
        id: generateSectionId(),
        type: 'education',
        title: SECTION_TITLE_MAP.education,
        content: legacy.education ?? [],
      },
      {
        id: generateSectionId(),
        type: 'skills',
        title: SECTION_TITLE_MAP.skills,
        content: legacy.skills ?? [],
      },
    ],
  }
}

/**
 * 从 ResumeContent 中获取指定类型的 section
 * 预置类型保证存在（未找到返回默认值），自定义类型可能不存在
 */
export function getSectionByType<T extends SectionType>(
  content: ResumeContent,
  type: T,
): ResumeSection | undefined {
  return content.sections.find((s) => s.type === type)
}

/**
 * 从 ResumeContent 中获取指定类型 section 的 content（类型安全）
 */
export function getSectionContent<T extends SectionType>(
  content: ResumeContent,
  type: T,
): SectionContentOf<T> | undefined {
  const section = getSectionByType(content, type)
  return section?.content as SectionContentOf<T> | undefined
}
