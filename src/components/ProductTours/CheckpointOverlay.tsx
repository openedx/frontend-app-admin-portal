import React, { useLayoutEffect, useState, FC } from 'react';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface CheckpointOverlayProps {
  target: string;
}

const CheckpointOverlay: FC<CheckpointOverlayProps> = ({ target }) => {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const targetElement = document.querySelector(target);
      
      if (targetElement) {
        const boundingRect = targetElement.getBoundingClientRect();
        setRect({
          top: boundingRect.top,
          left: boundingRect.left,
          width: boundingRect.width,
          height: boundingRect.height,
        });
      }
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [target]);

  if (!rect) {
    return null;
  }

  return (
    <div
      className="pgn__checkpoint-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
        pointerEvents: 'none',
      }}
    >
      {/* Top overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: rect.top,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      {/* Left overlay */}
      <div
        style={{
          position: 'absolute',
          top: rect.top,
          left: 0,
          width: rect.left,
          height: rect.height,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      {/* Right overlay */}
      <div
        style={{
          position: 'absolute',
          top: rect.top,
          left: rect.left + rect.width,
          right: 0,
          height: rect.height,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      {/* Bottom overlay */}
      <div
        style={{
          position: 'absolute',
          top: rect.top + rect.height,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
    </div>
  );
};

export default CheckpointOverlay; 