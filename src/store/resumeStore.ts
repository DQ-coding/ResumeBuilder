/**
 * 简历状态管理 Store
 *
 * 管理简历列表、当前编辑简历、保存状态。
 * updateSection 时同步写 localStorage 缓存；saveContent 将内容同步到后端。
 *
 * 第二期迭代：ResumeContent 重构为 sections 数组结构，
 * 新增 updateSection / updateSectionOrder / addSection / removeSection 等操作。
 *
 * @spec frontend-base-arch @spec frontend-auto-save @spec phase2-iteration
 */

import { create } from 'zustand'
import type {
  ResumeItem,
  ResumeDetail,
  ResumeContent,
  ResumeSection,
  SaveStatus,
} from '@/types'
import { migrateResumeContent } from '@/types'
import * as resumeService from '@/services/resumeService'

/** localStorage 缓存 key 前缀 */
const DRAFT_PREFIX = 'resume:draft:'

/** 写入 localStorage 草稿缓存 */
function saveDraft(id: string, content: ResumeContent): void {
  try {
    localStorage.setItem(`${DRAFT_PREFIX}${id}`, JSON.stringify(content))
  } catch {
    // localStorage 写入失败（如配额溢出）不影响编辑流程
  }
}

/** 读取 localStorage 草稿缓存 */
export function loadDraft(id: string): ResumeContent | null {
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${id}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // 旧格式自动迁移
    return migrateResumeContent(parsed)
  } catch {
    return null
  }
}

/** 清除 localStorage 草稿缓存 */
function clearDraft(id: string): void {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${id}`)
  } catch {
    // ignore
  }
}

interface ResumeState {
  /** 简历列表 */
  resumeList: ResumeItem[]
  /** 当前编辑中的简历详情 */
  currentResume: ResumeDetail | null
  /** 保存状态 */
  saveStatus: SaveStatus
  /** 是否正在加载列表 */
  isListLoading: boolean

  /** 获取简历列表 */
  fetchList: () => Promise<void>
  /** 获取简历详情 */
  fetchDetail: (id: string) => Promise<void>
  /** 新建简历，返回新建的简历 ID */
  createResume: (title?: string) => Promise<string>
  /** 更新当前简历中某个 section 的 content */
  updateSection: (sectionId: string, content: ResumeSection['content']) => void
  /** 更新 sections 数组的顺序（拖拽排序） */
  updateSectionOrder: (sections: ResumeSection[]) => void
  /** 新增一个 section */
  addSection: (section: ResumeSection) => void
  /** 删除一个 section（仅允许删除自定义模块） */
  removeSection: (sectionId: string) => void
  /** 更新某个 section 的 title */
  updateSectionTitle: (sectionId: string, title: string) => void
  /** 切换某个 section 的显示/隐藏状态 */
  toggleSectionVisibility: (sectionId: string) => void
  /** 将当前简历内容同步到后端 */
  saveContent: () => Promise<void>
  /** 删除简历 */
  deleteResume: (id: string) => Promise<void>
  /** 重命名简历 */
  renameResume: (id: string, title: string) => Promise<void>
  /** 清空当前简历 */
  clearCurrentResume: () => void
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumeList: [],
  currentResume: null,
  saveStatus: 'saved',
  isListLoading: false,

  fetchList: async () => {
    set({ isListLoading: true })
    try {
      const list = await resumeService.getResumeList()
      set({ resumeList: list, isListLoading: false })
    } catch (error) {
      set({ isListLoading: false })
      throw error
    }
  },

  fetchDetail: async (id) => {
    try {
      const detail = await resumeService.getResumeDetail(id)
      // 旧格式自动迁移
      const migratedContent = migrateResumeContent(detail.content)
      set({ currentResume: { ...detail, content: migratedContent }, saveStatus: 'saved' })
    } catch {
      // 后端请求失败时，尝试从 localStorage 降级读取
      const draft = loadDraft(id)
      if (draft) {
        set({
          currentResume: {
            id,
            title: 'Draft (not synced)',
            templateId: 'classic',
            content: draft,
            userId: '',
            createdAt: '',
            updatedAt: '',
          },
          saveStatus: 'unsaved',
        })
        return
      }
      throw new Error('Failed to load resume')
    }
  },

  createResume: async (title) => {
    const detail = await resumeService.createResume(
      title ? { title } : undefined,
    )
    // 刷新列表
    await get().fetchList()
    return detail.id
  },

  updateSection: (sectionId, content) => {
    const current = get().currentResume
    if (!current) return

    const newSections = current.content.sections.map((s) =>
      s.id === sectionId ? { ...s, content } : s,
    )
    const newContent = { ...current.content, sections: newSections }
    set({
      currentResume: { ...current, content: newContent },
      saveStatus: 'unsaved',
    })
    saveDraft(current.id, newContent)
  },

  updateSectionOrder: (sections) => {
    const current = get().currentResume
    if (!current) return

    const newContent = { ...current.content, sections }
    set({
      currentResume: { ...current, content: newContent },
      saveStatus: 'unsaved',
    })
    saveDraft(current.id, newContent)
  },

  addSection: (section) => {
    const current = get().currentResume
    if (!current) return

    const newSections = [...current.content.sections, section]
    const newContent = { ...current.content, sections: newSections }
    set({
      currentResume: { ...current, content: newContent },
      saveStatus: 'unsaved',
    })
    saveDraft(current.id, newContent)
  },

  removeSection: (sectionId) => {
    const current = get().currentResume
    if (!current) return

    const newSections = current.content.sections.filter((s) => s.id !== sectionId)
    const newContent = { ...current.content, sections: newSections }
    set({
      currentResume: { ...current, content: newContent },
      saveStatus: 'unsaved',
    })
    saveDraft(current.id, newContent)
  },

  updateSectionTitle: (sectionId, title) => {
    const current = get().currentResume
    if (!current) return

    const newSections = current.content.sections.map((s) =>
      s.id === sectionId ? { ...s, title } : s,
    )
    const newContent = { ...current.content, sections: newSections }
    set({
      currentResume: { ...current, content: newContent },
      saveStatus: 'unsaved',
    })
    saveDraft(current.id, newContent)
  },

  toggleSectionVisibility: (sectionId) => {
    const current = get().currentResume
    if (!current) return

    const newSections = current.content.sections.map((s) =>
      s.id === sectionId ? { ...s, visible: s.visible !== false ? false : true } : s,
    )
    const newContent = { ...current.content, sections: newSections }
    set({
      currentResume: { ...current, content: newContent },
      saveStatus: 'unsaved',
    })
    saveDraft(current.id, newContent)
  },

  saveContent: async () => {
    const current = get().currentResume
    if (!current) return

    set({ saveStatus: 'saving' })
    try {
      await resumeService.updateResume(current.id, { content: current.content })
      set({ saveStatus: 'saved' })
      // 保存成功后清除草稿缓存（后端已持久化）
      clearDraft(current.id)
    } catch (error) {
      set({ saveStatus: 'unsaved' })
      throw error
    }
  },

  deleteResume: async (id) => {
    await resumeService.deleteResume(id)
    // 如果删除的是当前编辑的简历，清空
    if (get().currentResume?.id === id) {
      set({ currentResume: null })
    }
    clearDraft(id)
    await get().fetchList()
  },

  renameResume: async (id, title) => {
    await resumeService.renameResume(id, { title })
    // 更新列表中对应项
    set((state) => ({
      resumeList: state.resumeList.map((r) =>
        r.id === id ? { ...r, title } : r,
      ),
      currentResume:
        state.currentResume?.id === id
          ? { ...state.currentResume, title }
          : state.currentResume,
    }))
  },

  clearCurrentResume: () => {
    set({ currentResume: null, saveStatus: 'saved' })
  },
}))
