interface WindowDimensions {
  width: number;
  height: number;
}

export function winSize(): WindowDimensions {
  if (typeof window === "undefined") {
    return { width: 480, height: 800 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}