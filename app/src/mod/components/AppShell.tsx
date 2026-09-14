import { type JSX, children, splitProps } from "solid-js";

export interface AppShellHeaderProps {
  pt?: number;
  class?: string;
  children: JSX.Element;
}

export interface AppShellMainProps {
  class?: string;
  children: JSX.Element;
}

export interface AppShellFooterProps {
  pb?: number;
  class?: string;
  children: JSX.Element;
}

export interface AppShellProps {
  header?: { height: number };
  footer?: { height: number };
  class?: string;
  children: JSX.Element;
}

function AppShellHeader(props: AppShellHeaderProps) {
  const [local, others] = splitProps(props, ["pt", "class", "children"]);
  const resolvedChildren = children(() => local.children);

  return (
    <header
      class={`fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 flex items-center px-4 shadow-xs ${
        local.class || ""
      }`}
      style={{
        height: `${props.pt !== undefined ? props.pt : 50}px`,
        "padding-top": local.pt ? `${local.pt - 50}px` : "0px",
      }}
      {...others}
    >
      <div class="w-full">{resolvedChildren()}</div>
    </header>
  );
}

function AppShellMain(props: AppShellMainProps) {
  const [local, others] = splitProps(props, ["class", "children"]);
  const resolvedChildren = children(() => local.children);

  return (
    <main
      class={`flex-1 flex flex-col min-h-screen p-4 md:p-6 max-w-7xl mx-auto w-full ${
        local.class || ""
      }`}
      {...others}
    >
      {resolvedChildren()}
    </main>
  );
}

function AppShellFooter(props: AppShellFooterProps) {
  const [local, others] = splitProps(props, ["pb", "class", "children"]);
  const resolvedChildren = children(() => local.children);

  return (
    <footer
      class={`fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 flex items-center px-4 text-xs text-slate-500 ${
        local.class || ""
      }`}
      style={{
        height: `${props.pb !== undefined ? props.pb : 50}px`,
        "padding-bottom": local.pb ? `${local.pb - 50}px` : "0px",
      }}
      {...others}
    >
      <div class="w-full">{resolvedChildren()}</div>
    </footer>
  );
}

export function AppShell(props: AppShellProps) {
  const [local, others] = splitProps(props, ["header", "footer", "class", "children"]);
  const resolvedChildren = children(() => local.children);

  const headerHeight = local.header?.height ?? 50;
  const footerHeight = local.footer?.height ?? 50;

  return (
    <div
      class={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${local.class || ""}`}
      style={{
        "padding-top": `${headerHeight}px`,
        "padding-bottom": `${footerHeight}px`,
      }}
      {...others}
    >
      {resolvedChildren()}
    </div>
  );
}

AppShell.Header = AppShellHeader;
AppShell.Main = AppShellMain;
AppShell.Footer = AppShellFooter;