/**
 * i18n 初始化配置
 *
 * 使用 i18next + react-i18next 实现中英文界面切换。
 * 语言偏好持久化到 localStorage。
 *
 * @spec i18n
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './locales/zh.json'
import en from './locales/en.json'

/** localStorage 中存储语言偏好的 key */
const LANG_STORAGE_KEY = 'i18n-lang'

/** 支持的语言列表 */
export const SUPPORTED_LANGS = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
] as const

export type LangCode = (typeof SUPPORTED_LANGS)[number]['code']

/** 获取存储的语言偏好，默认中文 */
function getStoredLang(): LangCode {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') return stored
  } catch {
    // ignore
  }
  return 'zh'
}

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: getStoredLang(),
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false, // React 已自带 XSS 防护
  },
})

export default i18n

/** 切换语言并持久化偏好 */
export function changeLanguage(lang: LangCode): void {
  i18n.changeLanguage(lang)
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // ignore
  }
}

/** 获取当前语言 */
export function getCurrentLanguage(): LangCode {
  return (i18n.language as LangCode) || 'zh'
}
