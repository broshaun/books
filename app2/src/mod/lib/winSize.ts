export interface WindowDimensions {
  width: number;
  height: number;
}

/**
 * 纯函数：直接获取当前环境的宽高
 * 兼容浏览器、Node.js (SSR)、小程序等各种平台
 */
export function winSize(): WindowDimensions {
  if (typeof window !== "undefined") {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  
  // 非浏览器环境（如服务端渲染）的兜底默认值
  return { width: 480, height: 800 };
}