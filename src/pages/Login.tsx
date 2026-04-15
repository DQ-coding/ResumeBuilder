/**
 * 登录页面
 *
 * 邮箱 + 密码表单，支持表单验证、错误提示、loading 状态。
 * 登录成功后跳转原始页面或简历列表。
 *
 * @spec frontend-auth-pages
 * @spec i18n
 */

import { useState, type FormEvent } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

/** 简单邮箱格式校验 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface LocationState {
  from?: { pathname: string }
}

function Login() {
  const { t } = useTranslation()
  const { login, isLoading } = useAuth()
  const location = useLocation()
  const from = (location.state as LocationState)?.from?.pathname || '/resumes'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [apiError, setApiError] = useState('')

  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!email) {
      newErrors.email = t('auth.emailRequired')
    } else if (!isValidEmail(email)) {
      newErrors.email = t('auth.emailInvalid')
    }
    if (!password) {
      newErrors.password = t('auth.passwordRequired')
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setApiError('')

    if (!validate()) return

    try {
      await login(email, password, from)
      // useAuth.login 内部处理跳转
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError(t('auth.loginFailed'))
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          {t('auth.loginTitle')}
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
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            error={errors.password}
            autoComplete="current-password"
          />

          {apiError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {apiError}
            </p>
          )}

          <Button type="submit" loading={isLoading} className="mt-2 w-full">
            {t('common.login')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700">
            {t('common.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
