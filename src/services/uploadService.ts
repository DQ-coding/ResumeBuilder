/**
 * 头像上传 API 封装
 *
 * 使用 Supabase Storage 替代后端上传
 *
 * @spec supabase-migration
 */

import { supabase } from './supabase'

/**
 * 上传头像文件到 Supabase Storage
 * @param file 图片文件（JPG/PNG/WebP，≤ 2MB）
 * @returns 上传后的可访问 URL
 */
export async function uploadAvatar(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('请先登录')
  }

  // 生成唯一文件名
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}_${Date.now()}.${fileExt}`

  // 上传到 avatars 桶
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '31536000', // 1 年缓存
      upsert: true, // 覆盖同名文件
    })

  if (error) {
    throw new Error(`上传失败: ${error.message}`)
  }

  // 获取公开访问 URL
  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path)

  return urlData.publicUrl
}
