/**
 * ShareView 公开简历查看页面
 *
 * 通过分享令牌（shareToken）访问，无需登录。
 * 渲染简历预览，支持模板切换。
 *
 * @spec share-link
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPublicResume } from '@/services/resumeService'
import type { ResumeContent } from '@/types'

function ShareView() {
  const { t } = useTranslation()
  const { token } = useParams<{ token: string }>()
  const [title, setTitle] = useState('')
  const [templateId, setTemplateId] = useState('classic')
  const [content, setContent] = useState<ResumeContent | null>(null)
  const [loading, setLoading] = useState(token ? true : false)
  const [error, setError] = useState(token ? '' : t('share.invalidLink'))

  useEffect(() => {
    if (!token) {
      return
    }

    getPublicResume(token)
      .then((data) => {
        setTitle(data.title)
        setTemplateId(data.templateId)
        setContent(data.content)
      })
      .catch(() => {
        setError(t('share.invalidLink'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token, t])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-sm text-gray-500">{t('share.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900">{error || t('share.invalidLink')}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('share.invalidHint')}</p>
        </div>
      </div>
    )
  }

  const template = getTemplateConfig(templateId) ?? getTemplateConfig('classic')!
  const PreviewComponent = template.PreviewComponent

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部栏 */}
      <header className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          <span className="text-xs text-gray-400">{t('share.poweredBy')}</span>
        </div>
      </header>

      {/* 简历预览 */}
      <div className="mx-auto max-w-4xl py-8">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <PreviewComponent content={content} />
        </div>
      </div>
    </div>
  )
}

export default ShareView
