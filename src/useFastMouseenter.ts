import { useCallback, useEffect, useRef, useState } from "react";

export function useFastMouseenter(distance: number = 15) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  const lastEl = useRef<Element | null>(null);

  const updateEl = useCallback((x: number, y: number) => {
    const el = document.elementFromPoint(x, y);
    if (el && el !== lastEl.current) {
      lastEl.current = el;

      var evt = new CustomEvent("fastmouseenter");
      el.dispatchEvent(evt);
    }
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {

    if (!lastEl.current) {
      updateEl(event.clientX, event.clientY)
    }

    if (!mousePos.current) {
      mousePos.current = { x: event.clientX, y: event.clientY };
      return;
    }

    // https://math.stackexchange.com/a/1630886
    const { x: x1, y: y1 } = mousePos.current;
    mousePos.current = { x: event.clientX, y: event.clientY };
    const { clientX: x2, clientY: y2 } = event;

    var dx = x2 - x1;
    var dy = y2 - y1;

    var d = Math.sqrt(dx * dx + dy * dy);

    if (d < distance) {
      updateEl(event.clientX, event.clientY);
      return;
    }

    const t = distance / d;

    const stepX = Math.trunc(t * dx);
    const stepY = Math.trunc(t * dy);

    const clampX = createClamp(x2, stepX);
    const clampY = createClamp(y2, stepY);

    let simulatedX = clampX(x1 + stepX);
    let simulatedY = clampY(y1 + stepY);

    while (simulatedX !== x2 || simulatedY !== y2) {
      updateEl(simulatedX, simulatedY);

      simulatedX = clampX(simulatedX + stepX);
      simulatedY = clampY(simulatedY + stepY);
    }
  }, [updateEl, distance]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    } else {
      mousePos.current = null;
      lastEl.current = null;
    }
  }, [enabled, handleMouseMove]);

  const hook = useCallback((enable: boolean, e?: MouseEvent) => {
    setEnabled(enable);

    if (enable && e) {
      updateEl(e.clientX, e.clientY);
      mousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [updateEl]) as {
    (enable: true, e: MouseEvent): void;
    (enable: false): void;
  };

  return hook;
}

function createClamp(p2: number, delta: number): (p1: number) => number {
  if (delta > 0) {
    return (p1: number) => Math.min(p1, p2);
  } else if (delta < 0) {
    return (p1: number) => Math.max(p1, p2);
  } else {
    return (p1: number) => p2;
  }
};