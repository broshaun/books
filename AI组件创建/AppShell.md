## 依赖环境与严格导入规范
1. solid-js: "^1.9.15"
2. @tabler/icons-solidjs: ^3.20.0
3. tailwindcss: "^4.3.3"
4. typescript: ^6.0.3

## UI组件开发强制规范
1. 使用 **Tailwind CSS + HTML** 编写 Solid 组件，不使用其他样式方案。
2. 图标统一使用 `@tabler/icons-solidjs`，尺寸与颜色一律通过 `props` 控制。
3. 组件必须**独立、自包含**，仅通过 Props 驱动渲染，不依赖外部状态或副作用。


## 主题规范
```css
   变量说明：
   1. 背景与容器系列：
      - --bg-main        : 页面主背景（含渲染视图与安全区）
      - --bg-surface     : 卡片、顶栏、侧边栏背景
      - --bg-input       : 输入框/表单控件背景
      - --bg-button-hover: 按钮或可点击控件的悬停背景
      - --bg-active      : 列表项或菜单项的点击/激活/选中背景
      - --scrollbar-color: 滚动条滑块颜色（随主题自动适配）

   2. 文本与排版系列：
      - --text-title     : 标题文本颜色（最高层级，如大标题、抽屉名）
      - --text-main      : 主文本颜色（正文、常规内容）
      - --text-secondary : 次级文本颜色（辅助说明、时间、提示）
      - --text-link-color: 可点击的链接/高亮交互颜色

   3. 边框与阴影系列：
      - --border-color   : 通用分割线与边框颜色
      - --shadow-sm/md/lg: 复合立体阴影系统（适配深浅色与复古纸张质感）
   ========================================================================== */

:root, html {
  /* 💡 默认主背景设为柔和干净的浅灰色，告别刺眼的纯白 */
  --bg-main: #f3f4f6;
  --bg-surface: #ffffff;
  --bg-input: #ffffff;
  --bg-button-hover: #e5e7eb;
  --bg-active: #d1d5db;
  --scrollbar-color: #cbd5e1;
  
  --text-title: #111827;
  --text-main: #374151;
  --text-secondary: #6b7280;
  --text-link-color: #2563eb;
  
  --border-color: #e5e7eb;
  
  --shadow-sm: 0 1px 2px 0 rgba(0,0,0,.04);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,.04), 0 2px 4px -1px rgba(0,0,0,.02);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.06), 0 4px 6px -2px rgba(0,0,0,.03);
}

```

## Task 生成要求
1. 严格遵循上方全部依赖、样式、TS、主题规范，输出纯展示型UI组件，严格按照组件接口功能实现。
2. 完整可运行TSX代码，包含全部导入、类型定义、组件实现。
3. 代码整洁、类型无any、缩进统一，注释精简必要说明。

## 根据以上条件实现 AppShell 组件
```tsx
 <AppShell 
    header={{ height: 50 }} 
    footer={{ height: 50 }}
 >
    <AppShell.Header>
        <div>头部内容</div>
    </AppShell.Header>
    <AppShell.Main>
        <div>主题内容</div>
    </AppShell.Main>
    <AppShell.Footer>
        <div>底部内容</div>
    </AppShell.Footer>

</AppShell>

```

