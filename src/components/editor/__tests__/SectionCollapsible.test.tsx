/**
 * SectionCollapsible 组件测试
 *
 * @spec frontend-editor @spec section-visibility
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SectionCollapsible from '@/components/editor/SectionCollapsible'

describe('SectionCollapsible', () => {
  it('默认展开时显示子内容', () => {
    render(
      <SectionCollapsible title="测试标题">
        <div>子内容</div>
      </SectionCollapsible>,
    )
    expect(screen.getByText('测试标题')).toBeInTheDocument()
    expect(screen.getByText('子内容')).toBeInTheDocument()
  })

  it('点击标题可折叠内容', async () => {
    const user = userEvent.setup()
    render(
      <SectionCollapsible title="测试标题">
        <div>子内容</div>
      </SectionCollapsible>,
    )
    await user.click(screen.getByText('测试标题'))
    expect(screen.queryByText('子内容')).not.toBeInTheDocument()
  })

  it('再次点击可展开内容', async () => {
    const user = userEvent.setup()
    render(
      <SectionCollapsible title="测试标题">
        <div>子内容</div>
      </SectionCollapsible>,
    )
    await user.click(screen.getByText('测试标题'))
    expect(screen.queryByText('子内容')).not.toBeInTheDocument()
    await user.click(screen.getByText('测试标题'))
    expect(screen.getByText('子内容')).toBeInTheDocument()
  })

  it('defaultOpen=false 时默认折叠', () => {
    render(
      <SectionCollapsible title="测试标题" defaultOpen={false}>
        <div>子内容</div>
      </SectionCollapsible>,
    )
    expect(screen.queryByText('子内容')).not.toBeInTheDocument()
  })

  describe('显隐切换', () => {
    it('传入 onToggleVisibility 时显示眼睛图标按钮', () => {
      render(
        <SectionCollapsible
          title="测试标题"
          visible={true}
          onToggleVisibility={vi.fn()}
        >
          <div>子内容</div>
        </SectionCollapsible>,
      )
      // 眼睛按钮有 title 属性
      const toggleBtn = screen.getByTitle('隐藏该模块（预览和PDF中不显示）')
      expect(toggleBtn).toBeInTheDocument()
    })

    it('visible=false 时显示关闭的眼睛图标', () => {
      render(
        <SectionCollapsible
          title="测试标题"
          visible={false}
          onToggleVisibility={vi.fn()}
        >
          <div>子内容</div>
        </SectionCollapsible>,
      )
      const toggleBtn = screen.getByTitle('显示该模块')
      expect(toggleBtn).toBeInTheDocument()
    })

    it('点击眼睛按钮调用 onToggleVisibility', async () => {
      const onToggle = vi.fn()
      const user = userEvent.setup()
      render(
        <SectionCollapsible
          title="测试标题"
          visible={true}
          onToggleVisibility={onToggle}
        >
          <div>子内容</div>
        </SectionCollapsible>,
      )
      await user.click(screen.getByTitle('隐藏该模块（预览和PDF中不显示）'))
      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('不传 onToggleVisibility 时不显示眼睛按钮', () => {
      render(
        <SectionCollapsible title="测试标题">
          <div>子内容</div>
        </SectionCollapsible>,
      )
      expect(screen.queryByTitle('隐藏该模块（预览和PDF中不显示）')).not.toBeInTheDocument()
      expect(screen.queryByTitle('显示该模块')).not.toBeInTheDocument()
    })

    it('visible=false 时整个区块有半透明效果', () => {
      const { container } = render(
        <SectionCollapsible
          title="测试标题"
          visible={false}
          onToggleVisibility={vi.fn()}
        >
          <div>子内容</div>
        </SectionCollapsible>,
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('opacity-60')
    })
  })
})
