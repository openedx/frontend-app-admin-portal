import React, { useLayoutEffect, useState, FC } from 'react';
import { ALLOCATE_LEARNING_BUDGETS_TARGETS } from './AdminOnboardingTours/constants';

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
      // Determine if target is a class or ID selector
      const isClassSelector = target.startsWith('.');
      const isIdSelector = target.startsWith('#');

      const selector = isClassSelector || isIdSelector ? target : `#${target}`;

      // Check if the selector might return multiple elements (like nth-child)
      const hasMultipleElements = selector.includes('nth-child') || selector.includes('nth-of-type');

      if (hasMultipleElements) {
        const targetElements = document.querySelectorAll(selector);

        if (targetElements.length > 0) {
          // Create a bounding box that encompasses all elements
          let minTop = Infinity;
          let minLeft = Infinity;
          let maxBottom = -Infinity;
          let maxRight = -Infinity;

          targetElements.forEach((element) => {
            const boundingRect = element.getBoundingClientRect();
            minTop = Math.min(minTop, boundingRect.top);
            minLeft = Math.min(minLeft, boundingRect.left);
            maxBottom = Math.max(maxBottom, boundingRect.bottom);
            maxRight = Math.max(maxRight, boundingRect.right);
          });

          setRect({
            top: minTop,
            left: minLeft,
            width: maxRight - minLeft,
            height: maxBottom - minTop,
          });
        }
      } else {
        // Add timeout for assignment-budget-detail-card to wait for page loading
        const findAndSetElement = () => {
          const targetElement = document.querySelector(selector);
          if (targetElement) {
            const boundingRect = targetElement.getBoundingClientRect();
            setRect({
              top: boundingRect.top - 10,
              left: boundingRect.left - 10,
              width: boundingRect.width + 20,
              height: boundingRect.height + 20,
            });
          }
        };

        if (selector === `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_DETAIL_CARD}`) {
          setTimeout(findAndSetElement, 0);
        } else {
          findAndSetElement();
        }
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
      data-testid="checkpoint-overlay"
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
