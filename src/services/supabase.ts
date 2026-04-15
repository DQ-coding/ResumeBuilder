/**
 * Supabase 客户端配置
 *
 * 使用 @supabase/supabase-js 连接 Supabase 服务
 * 包含认证、数据访问、文件存储
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 导出方便的类型
export type SupabaseClient = typeof supabase
