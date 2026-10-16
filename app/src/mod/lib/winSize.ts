
export interface WindowDimensions {
  width: number;
  height: number;
}

export function winSize(): WindowDimensions {
  if (typeof window === "undefined") {
    return { width: 480, height: 800 };
  }

  const element = document.createElement("div");

  element.style.cssText = `
    position: absolute;
    width: 100dvw;
    height: 100dvh;
    visibility: hidden;
    pointer-events: none;
  `;

  document.body.appendChild(element);

  const { width, height } =
    element.getBoundingClientRect();

  element.remove();

  return {
    width: width || window.innerWidth,
    height: height || window.innerHeight,
  };
}
