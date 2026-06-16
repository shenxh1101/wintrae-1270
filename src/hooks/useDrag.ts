import { useCallback, useEffect, useRef, useState } from "react";

export interface DragState {
  isDragging: boolean;
  dx: number;
  dy: number;
  clientX: number;
  clientY: number;
}

const INITIAL: DragState = {
  isDragging: false,
  dx: 0,
  dy: 0,
  clientX: 0,
  clientY: 0,
};

export function useDrag(onDrop?: (clientX: number, clientY: number) => void) {
  const [state, setState] = useState<DragState>(INITIAL);
  const startRef = useRef({ x: 0, y: 0 });
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    startRef.current = { x: e.clientX, y: e.clientY };
    setState({
      isDragging: true,
      dx: 0,
      dy: 0,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  }, []);

  useEffect(() => {
    if (!state.isDragging) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      setState((s) => ({
        ...s,
        dx: e.clientX - startRef.current.x,
        dy: e.clientY - startRef.current.y,
        clientX: e.clientX,
        clientY: e.clientY,
      }));
    };
    const up = (e: PointerEvent) => {
      onDropRef.current?.(e.clientX, e.clientY);
      setState(INITIAL);
    };
    const cancel = () => setState(INITIAL);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [state.isDragging]);

  return { state, onPointerDown };
}
