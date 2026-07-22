import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Drag-to-resize hook for side panels.
 *
 * @param {number} defaultWidth  — initial width in px
 * @param {number} minWidth      — minimum allowed width (default 180)
 * @param {number} maxWidth      — maximum allowed width (default 500)
 * @param {string} direction     — 'right' (handle on right edge, default) or 'left' (handle on left edge)
 * @returns {{ width, dragProps }}
 *   width    — current panel width
 *   dragProps — spread on the drag handle: { onMouseDown, className, style }
 */
export function usePanelResize(defaultWidth, minWidth = 180, maxWidth = 500, direction = 'right') {
  const [width, setWidth] = useState(defaultWidth);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const delta = (direction === 'left' ? -1 : 1) * (e.clientX - startX.current);
      const next = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));
      setWidth(next);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [minWidth, maxWidth]);

  const dragProps = {
    onMouseDown,
    className: 'absolute top-0 bottom-0 w-1 hover:bg-blue-400/40 active:bg-blue-400/60 cursor-col-resize z-10 transition-colors',
  };

  return { width, dragProps };
}
