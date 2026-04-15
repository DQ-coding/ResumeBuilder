/**
 * BasicInfoSection 基本信息编辑组件
 *
 * 编辑姓名、职位、电话、邮箱字段，支持头像上传和裁剪。
 * 修改后通过 resumeStore.updateSection 更新 basic section 的 content。
 * 支持模块显隐控制。
 *
 * @spec frontend-editor @spec phase2-iteration @spec section-visibility @spec i18n @spec avatar-upload @spec avatar-crop-upload
 */

import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useResumeStore } from '@/store/resumeStore'
import type { BasicInfo } from '@/types'
import { getSectionByType } from '@/types'
import { uploadAvatar } from '@/services/uploadService'
import { toast } from '@/utils/toast'
import SectionCollapsible from './SectionCollapsible'
import AvatarCropper from './AvatarCropper'

/** 最大文件大小 2MB */
const MAX_FILE_SIZE = 2 * 1024 * 1024

/** 允许的图片类型 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function BasicInfoSection() {
  const { t } = useTranslation()
  const { currentResume, updateSection, toggleSectionVisibility } = useResumeStore()
  const basicSection = currentResume ? getSectionByType(currentResume.content, 'basic') : undefined
  const basic = basicSection?.content as BasicInfo | undefined

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [cropImage, setCropImage] = useState<File | null>(null)

  // 处理字段变更
  const handleChange = useCallback(
    (field: keyof BasicInfo, value: string) => {
      if (basicSection && basic) {
        updateSection(basicSection.id, { ...basic, [field]: value } as BasicInfo)
      }
    },
    [basicSection, basic, updateSection],
  )

  // 处理文件选择
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // 校验文件类型
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(t('editor.basicInfo.avatarTypeError'))
        return
      }

      // 校验文件大小
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t('editor.basicInfo.avatarSizeError'))
        return
      }

      // 先打开裁剪弹窗
      setCropImage(file)

      // 重置 input 以便再次选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [t],
  )

  // 处理裁剪完成
  const handleCropComplete = useCallback(
    async (croppedFile: File) => {
      setCropImage(null)
      try {
        setUploading(true)
        const url = await uploadAvatar(croppedFile)
        handleChange('avatar', url)
      } catch {
        toast.error(t('editor.basicInfo.avatarUploadError'))
      } finally {
        setUploading(false)
      }
    },
    [t, handleChange],
  )

  // 处理裁剪取消
  const handleCropCancel = useCallback(() => {
    setCropImage(null)
  }, [])

  // 处理删除头像
  const handleRemoveAvatar = useCallback(() => {
    handleChange('avatar', '')
  }, [handleChange])

  if (!basic || !basicSection) return null

  return (
    <>
      <SectionCollapsible
        title={t('editor.sections.basic')}
        visible={basicSection.visible !== false}
        onToggleVisibility={() => toggleSectionVisibility(basicSection.id)}
      >
        <div className="space-y-3">
          {/* 头像上传 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative h-20 w-[60px] shrink-0 rounded-md bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden hover:border-blue-400 transition-colors disabled:opacity-50"
            >
              {basic.avatar ? (
                <img
                  src={basic.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14l7-3h-4l-3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l-7-3h4l3 3z" />
                  </svg>
                </div>
              )}
            </button>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {uploading ? t('editor.basicInfo.avatarUploading') : t('editor.basicInfo.avatarUpload')}
              </button>
              {basic.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="ml-3 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  {t('editor.basicInfo.avatarRemove')}
                </button>
              )}
              <p className="mt-1 text-[10px] text-gray-400">
                {t('editor.basicInfo.avatarHint')}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div>
            <label htmlFor="basic-name" className="block text-xs font-medium text-gray-700 mb-1">
              {t('editor.basicInfo.name')} <span className="text-red-500">*</span>
            </label>
            <input
              id="basic-name"
              type="text"
              value={basic.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={t('editor.basicInfo.namePlaceholder')}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="basic-title" className="block text-xs font-medium text-gray-700 mb-1">
              {t('editor.basicInfo.title')} <span className="text-red-500">*</span>
            </label>
            <input
              id="basic-title"
              type="text"
              value={basic.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('editor.basicInfo.titlePlaceholder')}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="basic-phone" className="block text-xs font-medium text-gray-700 mb-1">
              {t('editor.basicInfo.phone')}
            </label>
            <input
              id="basic-phone"
              type="text"
              value={basic.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder={t('editor.basicInfo.phonePlaceholder')}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="basic-email" className="block text-xs font-medium text-gray-700 mb-1">
              {t('editor.basicInfo.email')}
            </label>
            <input
              id="basic-email"
              type="text"
              value={basic.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder={t('editor.basicInfo.emailPlaceholder')}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="basic-age" className="block text-xs font-medium text-gray-700 mb-1">
                {t('editor.basicInfo.age')}
              </label>
              <input
                id="basic-age"
                type="text"
                value={basic.age ?? ''}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder={t('editor.basicInfo.agePlaceholder')}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="basic-gender" className="block text-xs font-medium text-gray-700 mb-1">
                {t('editor.basicInfo.gender')}
              </label>
              <input
                id="basic-gender"
                type="text"
                value={basic.gender ?? ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                placeholder={t('editor.basicInfo.genderPlaceholder')}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="basic-target-city" className="block text-xs font-medium text-gray-700 mb-1">
                {t('editor.basicInfo.targetCity')}
              </label>
              <input
                id="basic-target-city"
                type="text"
                value={basic.targetCity ?? ''}
                onChange={(e) => handleChange('targetCity', e.target.value)}
                placeholder={t('editor.basicInfo.targetCityPlaceholder')}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </SectionCollapsible>
      {cropImage && (
        <AvatarCropper
          image={cropImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  )
}

export default BasicInfoSection