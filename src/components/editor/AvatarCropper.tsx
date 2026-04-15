/**
 * AvatarCropper 头像裁剪组件
 *
 * 基于 react-easy-crop 实现头像裁剪功能。
 * 支持 3:4 一寸照比例裁剪，支持缩放和移动。
 *
 * @spec avatar-crop-upload
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { useTranslation } from 'react-i18next'

interface AvatarCropperProps {
  /** 图片文件 */
  image: File
  /** 裁剪完成回调 */
  onCropComplete: (file: File) => void
  /** 取消回调 */
  onCancel: () => void
}

/** 输出图片尺寸 */
const OUTPUT_WIDTH = 300
const OUTPUT_HEIGHT = 400

/** 一寸照比例 3:4 */
const ASPECT_RATIO = 3 / 4

function AvatarCropper({ image, onCropComplete, onCancel }: AvatarCropperProps) {
  const { t } = useTranslation()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  // 用 useMemo 创建 Object URL，避免在 effect 中调用 setState
  const imageUrl = useMemo(() => {
    return URL.createObjectURL(image)
  }, [image])

  // 仅用于清理 URL，不涉及 setState
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  const onCropChange = useCallback((cropper: { x: number; y: number }) => {
    setCrop(cropper)
  }, [])

  const onCropCompleteHandler = useCallback(
    (_: Area, croppedAreaPixelsValue: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsValue)
    },
    [],
  )

  const createFile = useCallback(async () => {
    if (!croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (error) {
      console.error('Crop image failed:', error)
    }
  }, [image, croppedAreaPixels, onCropComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[340px] rounded-lg bg-white p-4 shadow-xl">
        {/* 标题 */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">
            {t('editor.basicInfo.avatarCropTitle')}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 裁剪区域 */}
        <div className="relative h-[300px] w-full overflow-hidden rounded-md bg-gray-100">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={ASPECT_RATIO}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
              showGrid={false}
            />
          )}
        </div>

        {/* 缩放滑块 */}
        <div className="mt-4">
          <label className="mb-2 block text-xs text-gray-600">
            {t('editor.basicInfo.avatarZoom')}
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 按钮组 */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={createFile}
            className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 创建裁剪后的图片文件
 */
async function getCroppedImg(
  image: File,
  croppedAreaPixels: { x: number; y: number; width: number; height: number },
): Promise<File> {
  return new Promise((resolve, reject) => {
    const imageLoader = new Image()
    const objectUrl = URL.createObjectURL(image)
    imageLoader.src = objectUrl

    imageLoader.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('No 2d context'))
        return
      }

      canvas.width = OUTPUT_WIDTH
      canvas.height = OUTPUT_HEIGHT

      ctx.drawImage(
        imageLoader,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        OUTPUT_WIDTH,
        OUTPUT_HEIGHT,
      )

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }

          const file = new File([blob], 'avatar.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })

          resolve(file)
        },
        'image/jpeg',
        0.9,
      )

      URL.revokeObjectURL(objectUrl)
    }

    imageLoader.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }
  })
}

export default AvatarCropper