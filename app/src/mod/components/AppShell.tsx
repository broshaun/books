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
  /** 是否启用系统安全区避让，默认 false */
  safeArea?: boolean;
}

function Header(props: SectionProps) {
  return (
    <header
      class="absolute left-0 right-0 z-30 flex items-center box-border"
      style={{
        top: "var(--header-margin)",
        height: "var(--header-size)",
        "padding-top": "var(--header-padding)",
      }}
    >
      <div class="w-full min-w-0">{props.children}</div>
    </header>
  );
}

function Navbar(props: SectionProps) {
  return (
    <nav
      class="absolute z-20 box-border overflow-hidden"
      style={{
        top: "var(--header-total)",
        bottom: "var(--footer-total)",
        left: "var(--navbar-margin)",
        width: "var(--navbar-size)",
        "padding-left": "var(--navbar-padding)",
      }}
    >
      {props.children}
    </nav>
  );
}

function Aside(props: SectionProps) {
  return (
    <aside
      class="absolute z-20 box-border overflow-hidden"
      style={{
        top: "var(--header-total)",
        bottom: "var(--footer-total)",
        right: "var(--aside-margin)",
        width: "var(--aside-size)",
        "padding-right": "var(--aside-padding)",
      }}
    >
      {props.children}
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
      class="absolute left-0 right-0 z-30 flex items-center box-border"
      style={{
        bottom: "var(--footer-margin)",
        height: "var(--footer-size)",
        "padding-bottom": "var(--footer-padding)",
      }}
    >
      <div class="w-full min-w-0">{props.children}</div>
    </footer>
  );
}

export function AppShell(props: AppShellProps) {
  // 💡 对外参数控制：是否启用安全区，默认 false
  const enableSafeArea = props.safeArea ?? false;

  return (
    <div
      class="relative h-dvh w-full flex flex-col overflow-hidden box-border"
      style={{
        // 如果开启，则读取系统的安全区高度；否则为 0px
        "--safe-top": enableSafeArea ? "env(safe-area-inset-top, 0px)" : "0px",
        "--safe-bottom": enableSafeArea ? "env(safe-area-inset-bottom, 0px)" : "0px",

        "--header-margin": `${props.header?.margin ?? 0}px`,
        "--navbar-margin": `${props.navbar?.margin ?? 0}px`,
        "--aside-margin": `${props.aside?.margin ?? 0}px`,
        "--footer-margin": `${props.footer?.margin ?? 0}px`,

        "--header-padding": `${props.header?.padding ?? 0}px`,
        "--navbar-padding": `${props.navbar?.padding ?? 0}px`,
        "--aside-padding": `${props.aside?.padding ?? 0}px`,
        "--footer-padding": `${props.footer?.padding ?? 0}px`,

        "--header-size": `${(props.header?.height ?? 0) + (props.header?.padding ?? 0)}px`,
        "--navbar-size": `${(props.navbar?.width ?? 0) + (props.navbar?.padding ?? 0)}px`,
        "--aside-size": `${(props.aside?.width ?? 0) + (props.aside?.padding ?? 0)}px`,
        "--footer-size": `${(props.footer?.height ?? 0) + (props.footer?.padding ?? 0)}px`,

        // 总高度中按需叠加安全区
        "--header-total": "calc(var(--header-size) + var(--header-margin) + var(--safe-top))",
        "--navbar-total": "calc(var(--navbar-size) + var(--navbar-margin))",
        "--aside-total": "calc(var(--aside-size) + var(--aside-margin))",
        "--footer-total": "calc(var(--footer-size) + var(--footer-margin) + var(--safe-bottom))",

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