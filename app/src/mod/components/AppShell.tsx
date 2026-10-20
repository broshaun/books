import type { JSX } from "solid-js";

interface SectionProps {
  children?: JSX.Element;
}

interface AppShellMainProps extends SectionProps {
  ref?: (el: HTMLElement) => void;
}

interface LayoutConfig {
  padding?: number;
  margin?: number;
}

export interface AppShellProps extends SectionProps {
  header?: LayoutConfig & { height?: number };
  navbar?: LayoutConfig & { width?: number };
  aside?: LayoutConfig & { width?: number };
  footer?: LayoutConfig & { height?: number };
}

function Header(props: SectionProps) {
  return (
    <header
      class="absolute left-0 right-0 z-30 flex flex-col box-border pointer-events-none"
      style={{
        top: "var(--header-margin)", // Margin 区域：绝对透明
        height: "calc(var(--header-size) + var(--header-padding))",
      }}
    >
      {/* 💡 1. Padding 占位区：纯透明，绝不带有任何背景色，让底图透过去 */}
      <div style={{ height: "var(--header-padding)" }} />

      {/* 💡 2. 实际内容区：在这里赋予背景色和点击响应，背景绝不会蔓延到上面的 padding 区域 */}
      <div class="flex-1 flex items-center w-full min-w-0 pointer-events-auto">
        {props.children}
      </div>
    </header>
  );
}

function Navbar(props: SectionProps) {
  return (
    <nav
      class="absolute z-20 box-border flex pointer-events-none"
      style={{
        top: "var(--header-total)",
        bottom: "var(--footer-total)",
        left: "var(--navbar-margin)", // Margin 区域：透明
        width: "calc(var(--navbar-size) + var(--navbar-padding))",
      }}
    >
      {/* Padding 占位区：透明 */}
      <div style={{ width: "var(--navbar-padding)" }} />
      {/* 实际内容区 */}
      <div class="flex-1 h-full overflow-hidden pointer-events-auto">
        {props.children}
      </div>
    </nav>
  );
}

function Aside(props: SectionProps) {
  return (
    <aside
      class="absolute z-20 box-border flex pointer-events-none"
      style={{
        top: "var(--header-total)",
        bottom: "var(--footer-total)",
        right: "var(--aside-margin)", // Margin 区域：透明
        width: "calc(var(--aside-size) + var(--aside-padding))",
      }}
    >
      {/* 实际内容区 */}
      <div class="flex-1 h-full overflow-hidden pointer-events-auto">
        {props.children}
      </div>
      {/* Padding 占位区：透明 */}
      <div style={{ width: "var(--aside-padding)" }} />
    </aside>
  );
}

function Main(props: AppShellMainProps) {
  return (
    <main
      ref={props.ref}
      class="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden"
      style={{
        "margin-left": "var(--navbar-total)",
        "margin-right": "var(--aside-total)",
      }}
    >
      {props.children}
    </main>
  );
}

function Footer(props: SectionProps) {
  return (
    <footer
      class="absolute left-0 right-0 z-30 flex flex-col box-border pointer-events-none"
      style={{
        bottom: "var(--footer-margin)", // Margin 区域：透明
        height: "calc(var(--footer-size) + var(--footer-padding))",
      }}
    >
      {/* 实际内容区 */}
      <div class="flex-1 flex items-center w-full min-w-0 pointer-events-auto">
        {props.children}
      </div>
      {/* Padding 占位区：透明 */}
      <div style={{ height: "var(--footer-padding)" }} />
    </footer>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <div
      class="relative h-dvh w-full flex flex-col overflow-hidden box-border"
      style={{
        "--header-margin": `${props.header?.margin ?? 0}px`,
        "--navbar-margin": `${props.navbar?.margin ?? 0}px`,
        "--aside-margin": `${props.aside?.margin ?? 0}px`,
        "--footer-margin": `${props.footer?.margin ?? 0}px`,

        "--header-padding": `${props.header?.padding ?? 0}px`,
        "--navbar-padding": `${props.navbar?.padding ?? 0}px`,
        "--aside-padding": `${props.aside?.padding ?? 0}px`,
        "--footer-padding": `${props.footer?.padding ?? 0}px`,

        "--header-size": `${props.header?.height ?? 0}px`,
        "--navbar-size": `${props.navbar?.width ?? 0}px`,
        "--aside-size": `${props.aside?.width ?? 0}px`,
        "--footer-size": `${props.footer?.height ?? 0}px`,

        "--header-total": "calc(var(--header-size) + var(--header-padding) + var(--header-margin))",
        "--navbar-total": "calc(var(--navbar-size) + var(--navbar-padding) + var(--navbar-margin))",
        "--aside-total": "calc(var(--aside-size) + var(--aside-padding) + var(--aside-margin))",
        "--footer-total": "calc(var(--footer-size) + var(--footer-padding) + var(--footer-margin))",

        "padding-top": "var(--header-total)",
        "padding-bottom": "var(--footer-total)",
      } as JSX.CSSProperties}
    >
      {props.children}
    </div>
  );
}

AppShell.Header = Header;
AppShell.Navbar = Navbar;
AppShell.Aside = Aside;
AppShell.Main = Main;
AppShell.Footer = Footer;