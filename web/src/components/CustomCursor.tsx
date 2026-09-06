import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const cursorSmooth = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on pointer-capable desktop devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Check if mouse is hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = target.closest(
          'a, button, input, textarea, select, [role="button"], .btn, .plan-card, .price-card, .story-card, .story, .portrait, .linkline, .ticker, .nav-menu-toggle, .calc-preset-btn, .orbit-core'
        );
        setHovered(Boolean(isInteractive));
      }
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    const onMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth physics loop (lerp)
    const render = () => {
      const ease = 0.18;
      cursorSmooth.current.x += (mousePos.current.x - cursorSmooth.current.x) * ease;
      cursorSmooth.current.y += (mousePos.current.y - cursorSmooth.current.y) * ease;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorSmooth.current.x}px, ${cursorSmooth.current.y}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className={`cursor ${hovered ? 'hovered' : ''}`}
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className={`cursor-dot ${hovered ? 'hovered' : ''}`}
        aria-hidden="true"
      />
    </>
  );
}
