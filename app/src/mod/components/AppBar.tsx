import { createContext, useContext, children, type JSX } from "solid-js";

type AppBarContextType = {
  title: string;
};

const AppBarContext = createContext<AppBarContextType>({
  title: "",
});

interface AppBarRootProps {
  title: string;
  children?: JSX.Element;
}

interface AppBarSideProps {
  enable?: boolean;
  icon?: JSX.Element;
}

const AppBarLeft = (props: AppBarSideProps) => {
  if (props.enable === false) return null;
  return <>{props.icon}</>;
};

const AppBarRight = (props: AppBarSideProps) => {
  if (props.enable === false) return null;
  return <>{props.icon}</>;
};

function AppBarRoot(props: AppBarRootProps) {
  const resolved = children(() => props.children);

  let leftNode: JSX.Element = null;
  let rightNode: JSX.Element = null;

  const nodes = resolved();
  const list = Array.isArray(nodes) ? nodes : [nodes];

  for (const node of list) {
    if (node && typeof node === "object" && "localName" in node) {
      // 可以在此处根据属性或自定义标识分离 Left / Right
    }
  }

  // 或者如果你通过组合或直接按位置/类型传递，Solid 中通常更推荐显式属性或组件拆分。
  // 简化的方案可以直接遍历过滤其子元素：
  for (const child of list) {
    if (child && typeof child === "object" && "type" in child) {
      if (child.type === AppBarLeft) {
        leftNode = child;
      } else if (child.type === AppBarRight) {
        rightNode = child;
      }
    }
  }

  return (
    <AppBarContext.Provider value={{ title: props.title }}>
      <div class="grid grid-cols-12 items-center p-3.5 w-full">
        {/* 左侧 */}
        <div class="col-span-2 flex items-center justify-start">
          {leftNode}
        </div>

        {/* 中间标题 */}
        <div class="col-span-8 flex items-center justify-center">
          <h1 class="text-base font-semibold truncate">
            {props.title}
          </h1>
        </div>

        {/* 右侧 */}
        <div class="col-span-2 flex items-center justify-end">
          {rightNode}
        </div>
      </div>
    </AppBarContext.Provider>
  );
}

export const AppBar = Object.assign(AppBarRoot, {
  Left: AppBarLeft,
  Right: AppBarRight,
});