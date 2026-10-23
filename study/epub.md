在 `epub.js` 中，`inst`（通常指代 **Rendition** 实例）提供了非常丰富的核心方法与事件监听。

以下是 `rendition` 最常用的**核心方法**以及**支持绑定的所有常用事件**清单：

---

### 一、 核心方法大全 (`inst.xxx()`)

#### 1. 导航与翻页

* **`display(target?)`**：显示指定的目标。可以传入 `epubcfi` 字符串、章节 URL 或章节索引（数字）。不传参数时默认显示第一页或当前位置。
* **`next()`**：翻到下一页（或向下滚动一个视口）。返回一个 Promise。
* **`prev()`**：翻到上一页（或向上滚动一个视口）。返回一个 Promise。

#### 2. 尺寸与视图调整

* **`resize(width, height)`**：调整渲染区域的大小（也就是我们前面配合防抖动态调用的核心方法）。
* **`flow(type)`**：动态改变排版流。参数可以是 `"paginated"`（分页模式）或 `"scrolled"` / `"scrolled-doc"`（滚动模式）。

#### 3. 主题与样式

* **`themes.register(name, styles)`**：注册一个自定义主题样式。
* **`themes.select(name)`**：应用/切换当前激活的主题。
* **`themes.fontSize(size)`**：动态调整全局字体大小（如 `"16px"` 或 `"1.2em"`）。
* **`themes.font(family)`**：动态更改全局字体族。

#### 4. 位置与定位

* **`currentLocation()`**：获取当前的定位信息对象（包含 `start` 和 `end` 的 cfi、百分比等）。
* **`location.start` / `location.end**`：获取当前视图起始和结束的 CFI。

#### 5. 批注、高亮与标记 (Annotations)

* **`annotations.add(type, cfiRange, data, cb, className, styles)`**：添加高亮、下划线或标记。
* *常用简写*：`inst.annotations.highlight(cfiRange, data, cb, className, styles)`
* *常用简写*：`inst.annotations.underline(cfiRange, data, cb, className, styles)`


* **`annotations.remove(cfiRange, type)`**：移除指定 CFI 范围的批注。

#### 6. 内容获取与辅助

* **`getContents()`**：获取当前渲染区域内所有已加载章节的 `Contents` 对象（常用于获取 iframe 内部的 DOM、执行 `window.getSelection()` 等）。
* **`getRange(cfiRange)`**：根据 ePubCfi 范围获取标准的 DOM `Range` 对象。

---

### 二、 事件监听大全 (`inst.on("event", callback)`)

`epub.js` 的 Rendition 继承自 EventEmitter，支持通过 `inst.on(...)` 监听丰富的生命周期与交互事件：

#### 1. 核心生命周期事件

* **`"rendered"`**：`inst.on("rendered", (section, view) => { ... })`
* 当一个章节（Section）被成功渲染到 DOM 中时触发。这是向章节内部 DOM 动态注入事件或脚本的最佳时机。


* **`"relocated"`**：`inst.on("relocated", (location) => { ... })`
* **最常用的翻页/定位事件**。无论是点击下一页、滚动还是跳转，只要视口内的阅读位置发生改变，就会触发此事件。返回当前的 `location` 对象。


* **`"resized"`**：`inst.on("resized", (size) => { ... })`
* 当渲染区域大小发生改变时触发。



#### 2. 交互与点击事件

* **`"markClicked"`**：`inst.on("markClicked", (cfiRange, data) => { ... })`
* **用户点击了你通过 `annotations` 添加的高亮、标记或下划线时触发**。参数会带出该标记对应的 `cfiRange` 和自定义 `data`。


* **`"selected"`**：`inst.on("selected", (cfiRange, contents) => { ... })`
* 当用户在阅读器中**用鼠标选中一段文本**时触发。非常适合用来做“划线做笔记”或“划词翻译”的弹出菜单。



#### 3. 鼠标与触控事件（通常需配合内容区）

* **`"click"`**：`inst.on("click", (event, contents) => { ... })`
* 用户点击阅读正文时触发。


* **`"hover"`**：`inst.on("hover", (event, contents) => { ... })`
* 鼠标悬停事件。



---

### 💡 极简示例：监听划词与高亮点击

结合你目前的项目，如果你想处理划线和点击高亮，可以用下面这种经典写法：

```typescript
// 1. 监听用户划词选中文字
inst.on("selected", (cfiRange) => {
  console.log("用户选中的文本范围 CFI:", cfiRange);
  // 可以在这里弹出你的“添加笔记”悬浮按钮
});

// 2. 监听用户点击已有的高亮标记
inst.on("markClicked", (cfiRange, data) => {
  console.log("用户点击了高亮批注:", cfiRange, data);
  // 可以在这里弹出查看或删除该笔记的弹窗
});

```