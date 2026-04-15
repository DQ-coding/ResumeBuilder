/**
 * 简历 CRUD API 服务
 *
 * 使用 Supabase 直接访问数据库
 * RLS 策略自动确保用户只能访问自己的简历
 *
 * @spec supabase-migration
 */

import { supabase } from './supabase'
import type {
  CreateResumeRequest,
  UpdateResumeRequest,
  RenameResumeRequest,
  ResumeItem,
  ResumeDetail,
  ResumeContent,
} from '@/types'
import { createEmptyResumeContent } from '@/types'

/** 获取当前用户的简历列表 */
export async function getResumeList(): Promise<ResumeItem[]> {
  const { data, error } = await supabase
    .from('resumes')
    .select('id, title, template_id, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    data?.map((row) => ({
      id: row.id,
      title: row.title,
      templateId: row.template_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) ?? []
  )
}

/** 获取简历详情 */
export async function getResumeDetail(id: string): Promise<ResumeDetail> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('简历不存在')
  }

  // 解析 content，兼容旧格式
  let content: ResumeContent
  if (typeof data.content === 'string') {
    content = JSON.parse(data.content)
  } else {
    content = data.content
  }

  return {
    id: data.id,
    title: data.title,
    templateId: data.template_id,
    content,
    userId: data.user_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/** 新建简历 */
export async function createResume(
  data?: CreateResumeRequest,
): Promise<ResumeDetail> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('请先登录')
  }

  const { data: newResume, error } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      title: data?.title ?? '我的简历',
      template_id: data?.templateId ?? 'classic',
      content: createEmptyResumeContent(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // 解析 content
  let content: ResumeContent
  if (typeof newResume.content === 'string') {
    content = JSON.parse(newResume.content)
  } else {
    content = newResume.content
  }

  return {
    id: newResume.id,
    title: newResume.title,
    templateId: newResume.template_id,
    content,
    userId: newResume.user_id,
    createdAt: newResume.created_at,
    updatedAt: newResume.updated_at,
  }
}

/** 更新简历内容 */
export async function updateResume(
  id: string,
  data: UpdateResumeRequest,
): Promise<ResumeDetail> {
  const { data: updated, error } = await supabase
    .from('resumes')
    .update({
      content: data.content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  let content: ResumeContent
  if (typeof updated.content === 'string') {
    content = JSON.parse(updated.content)
  } else {
    content = updated.content
  }

  return {
    id: updated.id,
    title: updated.title,
    templateId: updated.template_id,
    content,
    userId: updated.user_id,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  }
}

/** 删除简历 */
export async function deleteResume(id: string): Promise<void> {
  const { error } = await supabase.from('resumes').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

/** 重命名简历 */
export async function renameResume(
  id: string,
  data: RenameResumeRequest,
): Promise<ResumeDetail> {
  const { data: updated, error } = await supabase
    .from('resumes')
    .update({
      title: data.title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  let content: ResumeContent
  if (typeof updated.content === 'string') {
    content = JSON.parse(updated.content)
  } else {
    content = updated.content
  }

  return {
    id: updated.id,
    title: updated.title,
    templateId: updated.template_id,
    content,
    userId: updated.user_id,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  }
}

/** 获取简历分享状态 */
export async function getShareStatus(id: string): Promise<{
  shareToken: string | null
  isPublic: boolean
}> {
  const { data, error } = await supabase
    .from('resumes')
    .select('share_token, is_public')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    shareToken: data.share_token ?? null,
    isPublic: data.is_public ?? false,
  }
}

/** 开启简历分享 */
export async function enableShare(
  id: string,
): Promise<{ shareToken: string; isPublic: boolean }> {
  const shareToken = `share_${Date.now()}_${Math.random().toString(36).slice(2)}`

  const { data, error } = await supabase
    .from('resumes')
    .update({
      share_token: shareToken,
      is_public: true,
    })
    .eq('id', id)
    .select('share_token, is_public')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    shareToken: data.share_token!,
    isPublic: data.is_public!,
  }
}

/** 关闭简历分享 */
export async function disableShare(
  id: string,
): Promise<{ shareToken: string; isPublic: boolean }> {
  const { error } = await supabase
    .from('resumes')
    .update({
      share_token: null,
      is_public: false,
    })
    .eq('id', id)
    .select('share_token, is_public')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    shareToken: '',
    isPublic: false,
  }
}

/** 获取公开简历（无需登录） */
export async function getPublicResume(
  shareToken: string,
): Promise<{ title: string; templateId: string; content: ResumeContent }> {
  const { data, error } = await supabase
    .from('resumes')
    .select('title, template_id, content')
    .eq('share_token', shareToken)
    .eq('is_public', true)
    .single()

  if (error || !data) {
    throw new Error('简历不存在或未开启分享')
  }

  let content: ResumeContent
  if (typeof data.content === 'string') {
    content = JSON.parse(data.content)
  } else {
    content = data.content
  }

  return {
    title: data.title,
    templateId: data.template_id,
    content,
  }
}
