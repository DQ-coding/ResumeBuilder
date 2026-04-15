/**
 * 首页（Landing Page）
 *
 * 产品介绍 + CTA 按钮，引导用户登录/注册。
 *
 * @spec frontend-base-arch @spec i18n
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Landing() {
  const { t } = useTranslation()

  const features = [
    {
      title: t('landing.feature1Title'),
      description: t('landing.feature1Desc'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: t('landing.feature2Title'),
      description: t('landing.feature2Desc'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: t('landing.feature3Title'),
      description: t('landing.feature3Desc'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: t('landing.feature4Title'),
      description: t('landing.feature4Desc'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-8">
        <span className="text-xl font-bold text-gray-900">ResumeBuilder</span>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t('common.login')}
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {t('landing.ctaRegister')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center lg:px-8 lg:py-32">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          {t('landing.heroLine1')}
          <br />
          <span className="text-blue-600">{t('landing.heroLine2')}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          {t('landing.heroSub1')}
          {' '}
          {t('landing.heroSub2')}
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {t('landing.ctaStart')}
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('common.login')}
          </Link>
        </div>
      </section>

      {/* 特色功能 */}
      <section className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            {t('landing.whyChoose')}
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4 rounded-xl bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="px-6 py-16 text-center lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900">{t('landing.bottomCtaTitle')}</h2>
        <p className="mt-3 text-gray-600">{t('landing.bottomCtaDesc')}</p>
        <Link
          to="/register"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {t('landing.ctaRegister')}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-500">
        ResumeBuilder
      </footer>
    </div>
  )
}

export default Landing
