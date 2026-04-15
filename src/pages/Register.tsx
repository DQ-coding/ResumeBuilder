/**
 * 注册页面
 *
 * 邮箱 + 密码 + 确认密码表单，支持表单验证、错误提示、loading 状态。
 * 注册成功后跳转简历列表。
 *
 * @spec frontend-auth-pages
 * @spec i18n
 */

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

/** 简单邮箱格式校验 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function Register() {
  const { t } = useTranslation()
  const { register, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [apiError, setApiError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!email) {
      newErrors.email = t('auth.emailRequired')
    } else if (!isValidEmail(email)) {
      newErrors.email = t('auth.emailInvalid')
    }
    if (!password) {
      newErrors.password = t('auth.passwordRequired')
    } else if (password.length < 8) {
      newErrors.password = t('auth.passwordMinLength')
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired')
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch')
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setApiError('')

    if (!validate()) return

    try {
      const result = await register(email, password)
      if (result.needsEmailConfirmation) {
        setEmailSent(true)
      }
      // 无需验证时 useAuth 内部已处理跳转
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError(t('auth.registerFailed'))
      }
    }
  }

  // 注册成功但需要邮箱验证 - 显示引导页
  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">查收验证邮件</h2>
          <p className="mb-1 text-sm text-gray-600">
            验证邮件已发送至
          </p>
          <p className="mb-4 font-medium text-gray-900">{email}</p>
          <p className="mb-6 text-sm text-gray-500">
            点击邮件中的确认链接后，回来登录即可。
          </p>
          <Link
            to="/login"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            前往登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          {t('auth.registerTitle')}
        </h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            id="email"
            label={t('auth.email')}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            id="password"
            label={t('auth.password')}
            type="password"
            placeholder={t('auth.passwordMinLength')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            error={errors.password}
            autoComplete="new-password"
          />

          <Input
            id="confirmPassword"
            label={t('auth.confirmPassword')}
            type="password"
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          {apiError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {apiError}
            </p>
          )}

          <Button type="submit" loading={isLoading} className="mt-2 w-full">
            {t('common.register')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            {t('common.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
