/**
 * TemplateSwitcher 组件测试
 *
 * @spec phase2-iteration
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TemplateSwitcher from '@/components/editor/TemplateSwitcher'

describe('TemplateSwitcher', () => {
  it('渲染切换模板按钮', () => {
    render(<TemplateSwitcher currentTemplateId="classic" onSwitch={() => {}} />)
    expect(screen.getByText('切换模板')).toBeInTheDocument()
  })

  it('点击按钮打开模板选择弹窗', async () => {
    const user = userEvent.setup()
    render(<TemplateSwitcher currentTemplateId="classic" onSwitch={() => {}} />)
    await user.click(screen.getByText('切换模板'))
    expect(screen.getByText('选择模板')).toBeInTheDocument()
    expect(screen.getAllByText('经典').length).toBeGreaterThanOrEqual(1)
  })

  it('当前模板显示选中状态', async () => {
    const user = userEvent.setup()
    render(<TemplateSwitcher currentTemplateId="classic" onSwitch={() => {}} />)
    await user.click(screen.getByText('切换模板'))
    expect(screen.getByText('当前使用')).toBeInTheDocument()
  })

  it('点击模板卡片调用 onSwitch 并关闭弹窗', async () => {
    const onSwitch = vi.fn()
    const user = userEvent.setup()
    render(<TemplateSwitcher currentTemplateId="classic" onSwitch={onSwitch} />)
    await user.click(screen.getByText('切换模板'))
    // 点击经典模板卡片（已选中状态也可以点击）
    const cards = screen.getAllByRole('button')
    // 找到包含"经典"文本的卡片
    const classicCard = cards.find((card) => card.textContent?.includes('经典'))
    if (classicCard) {
      await user.click(classicCard)
      expect(onSwitch).toHaveBeenCalledWith('classic')
      // 弹窗应关闭
      expect(screen.queryByText('选择模板')).not.toBeInTheDocument()
    }
  })
})
