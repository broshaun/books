# SolidJS 2.0 现代化开发完整指南

SolidJS 2.0 代表了高性能、精细化响应式框架的一次架构级跃迁。它在保持零虚拟 DOM（Virtual DOM）和极致运行速度的同时，将**异步处理提升为一等公民**，并彻底优化了底层调度与开发者体验。

---

## 一、 核心心智模型与架构变革

1. **组件只运行一次（Run-once）**：
与 React 每次状态改变都要重新执行整个组件函数不同，Solid 的组件函数在生命周期中**只在初始化时执行一次**。状态变化时，响应式图会直接精准更新对应的真实 DOM 节点。
2. **异步进入响应式图（First-class Async）**：
移除了旧版的 `createResource`。在 2.0 中，任何常规计算（Memo）都可以直接返回 `Promise`，框架会自动接管挂起与恢复流程。
3. **独立的底层渲染器（@solidjs/web）**：
核心的响应式系统（Signals、Store）被拆分至纯净的 `solid-js` 中，而 DOM 渲染、浏览器水合（Hydration）及 Web 控制流则由 `@solidjs/web` 独立承载。

---

## 二、 基础响应式：Signals 与派生状态

### 1. `createSignal`（状态声明）

使用 `createSignal` 定义状态，通过调用函数读取值，通过返回的 setter 改变值：

```tsx
import { createSignal } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count()}
    </button>
  );
}

```

### 2. `createMemo`（派生计算）

当需要根据现有状态计算出新值时使用 `createMemo`，它具备缓存特性，只有依赖项改变时才会重新计算：

```tsx
import { createSignal, createMemo } from "solid-js";

function PriceCalculator() {
  const [price, setPrice] = createSignal(100);
  const [quantity, setQuantity] = createSignal(2);

  const total = createMemo(() => price() * quantity());

  return <div>Total: {total()}</div>;
}

```

---

## 三、 现代异步处理与边界（Async & Loading/Suspense）

### 1. 原生异步计算

在 Solid 2.0 中，`createMemo` 可以直接写成 `async` 函数或返回 `Promise`：

```tsx
import { createMemo, Loading } from "solid-js";

function UserProfile(props: { id: number }) {
  // 异步计算直接进入响应式图
  const user = createMemo(async () => {
    const res = await fetch(`/api/user/${props.id}`);
    return res.json();
  });

  return (
    <Loading fallback={<div>正在加载用户资料...</div>}>
      <div>
        <h1>{user()?.name}</h1>
      </div>
    </Loading>
  );
}

```

### 2. 异步边界组件：`Loading` 与 `Suspense`

* **`<Loading>`**：专责处理初次加载边界。在第一次挂载、且无旧内容可展示时呈现 `fallback`；后续数据重新验证（Refetching）时保持旧 UI 稳定，避免闪烁。
* **`<Suspense>`**：负责更广泛的异步协调与服务端流式传输（Streaming）管理。

---

## 四、 草稿优先（Draft-first）的 Store 状态管理

Solid 2.0 的全局/局部复杂状态（Store）修改默认采用直观的**草稿模式**（类似旧版 `produce`），告别了繁琐的路径字符串拼接：

```tsx
import { createStore } from "solid-js/store";

function AppState() {
  const [state, setState] = createStore({
    user: { name: "Alice", stats: { posts: 5 } },
    todos: []
  });

  const updateProfile = () => {
    // 直接修改草稿对象，极简且高效
    setState(s => {
      s.user.name = "Bob";
      s.user.stats.posts += 1;
    });
  };

  return <button onClick={updateProfile}>Update Name</button>;
}

```

---

## 五、 列表渲染与控制流

Solid 2.0 对列表组件进行了精简与性能优化，统一通过 `<For>` 进行高效渲染：

```tsx
import { For, createSignal } from "solid-js";

function TodoList() {
  const [todos, setTodos] = createSignal(["学习 Solid 2", "构建全栈应用"]);

  return (
    <ul>
      <For each={todos()}>
        {(item, index) => (
          <li>
            {index() + 1}: {item}
          </li>
        )}
      </For>
    </ul>
  );
}

```

---

## 六、 生命周期与副作用：`createEffect` 与 `onSettled`

### 1. 拆分的 `createEffect`

Solid 2.0 将副作用拆分为**计算阶段**和**应用阶段**，彻底解决了旧版容易出现的依赖遗漏或闭包陈旧问题：

```tsx
import { createSignal, createEffect } from "solid-js";

const [count, setCount] = createSignal(0);

// 第一个参数负责追踪依赖，第二个参数负责消费结果
createEffect(
  () => count(),
  (val) => {
    console.log("Count changed to:", val);
  }
);

```

### 2. `onSettled`（替代传统 `onMount`）

在异步流时代，传统的 `onMount` 无法感知数据的真正落定。**`onSettled`** 会在 DOM 挂载并且**所有关联的异步计算、Promise 以及边界稳定落地（Settled）后**才执行，非常适合用于初始化依赖真实 DOM 和数据的第三方库：

```tsx
import { onSettled, createMemo } from "solid-js";

function Chart(props: { id: number }) {
  const data = createMemo(async () => {
    const res = await fetch(`/api/chart/${props.id}`);
    return res.json();
  });

  onSettled(() => {
    // 此时 DOM 已经就绪，且异步数据已经稳定返回
    console.log("安全初始化图表:", data());
  });

  return <div class="chart-container" />;
}

```

---

## 七、 Solid 1.x 升级 2.0 速查对照表

| Solid 1.x 特性 | Solid 2.0 对应写法 / 变化 |
| --- | --- |
| `createResource` | 废弃，直接在 `createMemo` 中返回 `Promise` |
| `createEffect(fn)` | 拆分为 `createEffect(compute, apply)` |
| `onMount` | 替换为感知异步的 `onSettled` |
| `setState('path', val)` | 默认改为草稿修改 `setState(s => { s.path = val })` |
| `batch` / `startTransition` | 废弃，系统默认微任务自动批量处理 |
| `@solidjs/web` 依赖 | 独立包，DOM 渲染与核心响应式系统解耦 |