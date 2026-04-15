/**
 * Toast 轻提示
 *
 * 重新导出 toast 工具，保持导入路径简洁。
 * 实际实现位于 utils/toast.ts，此处仅为统一导出入口。
 *
 * 用法：
 * ```ts
 * import { toast } from '@/components/ui/Toast'
 * toast.success('操作成功')
 * toast.error('操作失败')
 * ```
 *
 * @spec frontend-base-arch
 */

export { toast } from '@/utils/toast'
