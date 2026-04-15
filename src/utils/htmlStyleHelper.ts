/**
 * HTML 样式助手 - 处理富文本 HTML 的样式注入
 * 用于在预览层中为动态生成的列表 HTML 添加 Tailwind CSS 类
 *
 * @spec list-consistency
 */

/**
 * 为 HTML 中的列表标签添加 Tailwind CSS 类
 * 确保编辑器生成的 <ul>/<ol> 在预览中正确显示
 */
export function injectListStyles(html: string): string {
  let result = html
  
  // 为 <ul> 添加样式类：list-disc 显示圆点，ml-4 左边距
  result = result.replace(/<ul>/g, '<ul class="list-disc ml-4 m-0 p-0">')
  
  // 为 <ol> 添加样式类：list-decimal 显示数字，ml-4 左边距
  result = result.replace(/<ol>/g, '<ol class="list-decimal ml-4 m-0 p-0">')
  
  // 为 <li> 添加文本样式类，保持与父容器一致
  result = result.replace(/<li>/g, '<li class="text-xs text-gray-700">')
  
  return result
}

/**
 * 为 MinimalTemplate 中的列表添加紧凑样式
 */
export function injectListStylesMinimal(html: string): string {
  let result = html
  
  // 为 <ul> 添加样式类：紧凑版本
  result = result.replace(/<ul>/g, '<ul class="list-disc ml-4 m-0 p-0">')
  
  // 为 <ol> 添加样式类：紧凑版本
  result = result.replace(/<ol>/g, '<ol class="list-decimal ml-4 m-0 p-0">')
  
  // 为 <li> 添加紧凑文本样式
  result = result.replace(/<li>/g, '<li class="text-[10px] text-gray-600">')
  
  return result
}
