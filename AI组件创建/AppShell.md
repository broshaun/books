## 依赖环境与严格导入规范
1. solid-js: "^1.9.15"
2. @tabler/icons-react: ^3.20.0
3. tailwindcss: "^4.3.3"
4. typescript: ^6.0.3

## UI组件开发强制规范
1. 使用 **Tailwind CSS + HTML** 编写 Solid 组件，不使用其他样式方案。
2. 图标统一使用 `@tabler/icons-react`，尺寸与颜色一律通过 `props` 控制。
3. 组件必须**独立、自包含**，仅通过 Props 驱动渲染，不依赖外部状态或副作用。
4. 布局遵循**移动端优先、紧凑留白**的设计原则。

## Task 生成要求
1. 严格遵循上方全部依赖、样式、TS、主题规范，输出纯展示型UI组件，严格按照组件接口功能实现。
2. 完整可运行TSX代码，包含全部导入、类型定义、组件实现；底部必须使用 export default 导出组件。
3. 代码整洁、类型无any、缩进统一，注释精简必要说明。

## 根据以上条件实现 AppShell 组件
```sh
 <AppShell 
    header={{ height: 50 + top }} 
    footer={{ height: 50 + bottom }}
 >
    <AppShell.Header pt={top}>
        <div>头部内容</div>
    </AppShell.Header>
    <AppShell.Main>
        <div>主题内容</div>
    </AppShell.Main>
    <AppShell.Footer pb={bottom}>
        <div>底部内容</div>
    </AppShell.Footer>

</AppShell>

```

