/**
 * resumeStore 测试
 *
 * @spec section-visibility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useResumeStore } from '@/store/resumeStore'
import type { ResumeDetail } from '@/types'
import { createEmptyResumeContent } from '@/types'

/** 创建测试用简历详情 */
function createTestResumeDetail(overrides?: Partial<ResumeDetail>): ResumeDetail {
  return {
    id: 'test-resume-1',
    title: '测试简历',
    templateId: 'classic',
    content: createEmptyResumeContent(),
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('resumeStore', () => {
  beforeEach(() => {
    useResumeStore.setState({
      resumeList: [],
      currentResume: null,
      saveStatus: 'saved',
      isListLoading: false,
    })
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('toggleSectionVisibility', () => {
    it('将 visible=true 的 section 切换为 visible=false', () => {
      const content = createEmptyResumeContent()
      const summarySection = content.sections.find((s) => s.type === 'summary')!
      expect(summarySection.visible).toBeUndefined()

      useResumeStore.setState({
        currentResume: createTestResumeDetail({ content }),
      })

      useResumeStore.getState().toggleSectionVisibility(summarySection.id)

      const updated = useResumeStore.getState().currentResume!
      const updatedSection = updated.content.sections.find((s) => s.id === summarySection.id)!
      expect(updatedSection.visible).toBe(false)
    })

    it('将 visible=false 的 section 切换为 visible=true', () => {
      const content = createEmptyResumeContent()
      const summarySection = content.sections.find((s) => s.type === 'summary')!
      summarySection.visible = false

      useResumeStore.setState({
        currentResume: createTestResumeDetail({ content }),
      })

      useResumeStore.getState().toggleSectionVisibility(summarySection.id)

      const updated = useResumeStore.getState().currentResume!
      const updatedSection = updated.content.sections.find((s) => s.id === summarySection.id)!
      expect(updatedSection.visible).toBe(true)
    })

    it('不影响其他 section 的 visible 状态', () => {
      const content = createEmptyResumeContent()
      const summarySection = content.sections.find((s) => s.type === 'summary')!
      const skillsSection = content.sections.find((s) => s.type === 'skills')!

      useResumeStore.setState({
        currentResume: createTestResumeDetail({ content }),
      })

      useResumeStore.getState().toggleSectionVisibility(summarySection.id)

      const updated = useResumeStore.getState().currentResume!
      const updatedSkills = updated.content.sections.find((s) => s.id === skillsSection.id)!
      expect(updatedSkills.visible).toBeUndefined()
    })

    it('切换后 saveStatus 变为 unsaved', () => {
      const content = createEmptyResumeContent()
      const summarySection = content.sections.find((s) => s.type === 'summary')!

      useResumeStore.setState({
        currentResume: createTestResumeDetail({ content }),
        saveStatus: 'saved',
      })

      useResumeStore.getState().toggleSectionVisibility(summarySection.id)

      expect(useResumeStore.getState().saveStatus).toBe('unsaved')
    })

    it('currentResume 为 null 时不报错', () => {
      expect(() => {
        useResumeStore.getState().toggleSectionVisibility('nonexistent')
      }).not.toThrow()
    })
  })
})
