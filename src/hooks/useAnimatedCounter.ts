import { useState, useEffect } from "react";

export function useAnimatedCounter(
  end: number,
  duration = 1800,
  isVisible: boolean,
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    setValue(0);
    const increment = end / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration, isVisible]);

  return value;
}
