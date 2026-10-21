import { getCurrentWindow } from "@tauri-apps/api/window";

export function useWindowTitle() {
  const setTitle = async (title: string) => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.setTitle(title);
    } catch (error) {
      console.error("更新窗口标题失败:", error);
    }
  };

  return { setTitle };
}