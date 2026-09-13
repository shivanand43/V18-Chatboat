import { useState, useEffect, useCallback, useRef } from "react";

export function useDraggable({ initialX = 0, initialY = 0, enabled = true } = {}) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    if (!enabled || typeof window === "undefined" || window.innerWidth <= 768 || e.button !== 0) return;
    if (e.target.closest("button") || e.target.closest("input")) return;

    setIsDragging(true);
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  }, [enabled, position.x, position.y]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const nextX = e.clientX - dragStartOffset.current.x;
    const nextY = e.clientY - dragStartOffset.current.y;
    setPosition({ x: nextX, y: nextY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return { position, isDragging, handleMouseDown };
}