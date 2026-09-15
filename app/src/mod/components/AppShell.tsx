import { type JSX, splitProps } from "solid-js";

export interface AppShellHeaderProps extends JSX.HTMLAttributes<HTMLElement> {
  height?: number;
  pt?: number; // 顶部安全区计算高度/内边距
  children?: JSX.Element;
}

export interface AppShellMainProps extends JSX.HTMLAttributes<HTMLElement> {
  children?: JSX.Element;
}

export interface AppShellFooterProps extends JSX.HTMLAttributes<HTMLElement> {
  height?: number;
  pb?: number; // 底部安全区计算高度/内边距
  children?: JSX.Element;
}

export interface AppShellProps extends JSX.HTMLAttributes<HTMLDivElement> {
  header?: { height: number };
  footer?: { height: number };
  children?: JSX.Element;
}

function AppShellHeader(props: AppShellHeaderProps) {
  const [local, others] = splitProps(props as Record<string, any>, ["height", "pt", "children", "style"]);
  
  const totalHeight = local.pt !== undefined ? local.pt : (local.height ?? 50);
  const paddingTop = local.pt !== undefined ? Math.max(0, local.pt - 50) : 0;

  return (
    <header
      class="fixed top-0 left-0 right-0 z-30 flex items-center"
      style={{
        height: `${totalHeight}px`,
        "padding-top": `${paddingTop}px`,
        ...local.style,
      }}
      {...others}
    >
      <div class="w-full">{local.children}</div>
    </header>
  );
}

function AppShellMain(props: AppShellMainProps) {
  const [local, others] = splitProps(props as Record<string, any>, ["children"]);

  return (
    <main class="flex-1 flex flex-col w-full" {...others}>
      {local.children}
    </main>
  );
}

function AppShellFooter(props: AppShellFooterProps) {
  const [local, others] = splitProps(props as Record<string, any>, ["height", "pb", "children", "style"]);
  
  const totalHeight = local.pb !== undefined ? local.pb : (local.height ?? 50);
  const paddingBottom = local.pb !== undefined ? Math.max(0, local.pb - 50) : 0;

  return (
    <footer
      class="fixed bottom-0 left-0 right-0 z-30 flex items-center"
      style={{
        height: `${totalHeight}px`,
        "padding-bottom": `${paddingBottom}px`,
        ...local.style,
      }}
      {...others}
    >
      <div class="w-full">{local.children}</div>
    </footer>
  );
}

export function AppShell(props: AppShellProps) {
  const [local, others] = splitProps(props as Record<string, any>, ["header", "footer", "children", "style"]);
  
  const headerHeight = local.header?.height ?? 50;
  const footerHeight = local.footer?.height ?? 50;

  return (
    <div
      class="min-h-screen flex flex-col w-full"
      style={{
        "padding-top": `${headerHeight}px`,
        "padding-bottom": `${footerHeight}px`,
        ...local.style,
      }}
      {...others}
    >
      {local.children}
    </div>
  );
}

AppShell.Header = AppShellHeader;
AppShell.Main = AppShellMain;
AppShell.Footer = AppShellFooter;