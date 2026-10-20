/**
 * 获取顶部的安全区高度（像素单位，返回数字）
 */
export function getSafeAreaTop(): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  // 创建一个计算用的临时元素
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.height = "env(safe-area-inset-top, 0px)";
  div.style.visibility = "hidden";
  div.style.pointerEvents = "none";
  
  document.body.appendChild(div);
  const safeTopPx = parseFloat(window.getComputedStyle(div).height) || 0;
  document.body.removeChild(div);

  return safeTopPx;
}