import {
  Children,
  createContext,
  isValidElement,
  type ReactNode,
} from "react";
import { Center, Grid, Title } from "@mantine/core";

// ====================== 上下文 ======================
type AppBarContextType = {
  title: string;
};

const AppBarContext = createContext<AppBarContextType>({
  title: "",
});

// ====================== AppBar 主组件类型 ======================
interface AppBarRootProps {
  title: string;
  children?: ReactNode;
}

// ====================== Left / Right 子组件类型 ======================
interface AppBarSideProps {
  enable?: boolean;
  icon?: ReactNode;
}

// ====================== AppBar.Left 子组件 ======================
const AppBarLeft = ({
  enable = true,
  icon,
}: AppBarSideProps) => {
  if (!enable) return null;

  return <>{icon}</>;
};

// ====================== AppBar.Right 子组件 ======================
const AppBarRight = ({
  enable = true,
  icon,
}: AppBarSideProps) => {
  if (!enable) return null;

  return <>{icon}</>;
};

// ====================== 主 AppBar 组件 ======================
function AppBarRoot({
  title,
  children,
}: AppBarRootProps) {
  let leftNode: ReactNode = null;
  let rightNode: ReactNode = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === AppBarLeft) {
      leftNode = child;
    }
    if (child.type === AppBarRight) {
      rightNode = child;
    }
  });

  return (
    <AppBarContext.Provider value={{ title }}>
      <Grid p={15} >
        {/* 左侧 */}
        <Grid.Col span={2} >
          {leftNode}
        </Grid.Col>

        {/* 中间标题 */}
        <Grid.Col span={8}>
          <Center>
            <Title order={5} >
              {title}
            </Title>
          </Center>
        </Grid.Col>

        {/* 右侧 */}
        <Grid.Col span={2}>
          {rightNode}
        </Grid.Col>
      </Grid>
    </AppBarContext.Provider>
  );
}

/**
 * <AppBar title={title} >
 * <AppBar.Left enable={true} icon={<ActionIcon variant="subtle" color="gray" onClick={() => console.log('+++++++')}><IconChevronLeft /></ActionIcon>} />
 * <AppBar.Right enable={true} icon={<ActionIcon variant="subtle" color="gray" onClick={() => console.log('+++++++')}><IconUser /></ActionIcon>} />
 * </AppBar>
 */
export const AppBar = Object.assign(AppBarRoot, {
  Left: AppBarLeft,
  Right: AppBarRight,
});