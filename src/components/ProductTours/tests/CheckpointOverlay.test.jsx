import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckpointOverlay from '../CheckpointOverlay';

describe('CheckpointOverlay', () => {
  const mockTarget = '#test-target';
  const mockRect = {
    top: 100,
    left: 200,
    width: 300,
    height: 400,
  };

  let mockTargetElement;
  let getBoundingClientRectSpy;

  beforeEach(() => {
    mockTargetElement = {
      getBoundingClientRect: jest.fn(() => mockRect),
    };
    document.querySelector = jest.fn(() => mockTargetElement);
    getBoundingClientRectSpy = jest.spyOn(mockTargetElement, 'getBoundingClientRect');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when target element is not found', () => {
    document.querySelector.mockReturnValueOnce(null);
    const { container } = render(<CheckpointOverlay target={mockTarget} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders overlay with correct positioning when target element is found', () => {
    render(<CheckpointOverlay target={mockTarget} />);
    const overlay = screen.getByTestId('checkpoint-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('pgn__checkpoint-overlay');
    expect(overlay).toHaveStyle({
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1050,
      pointerEvents: 'none',
    });
  });

  it('updates position on scroll', () => {
    render(<CheckpointOverlay target={mockTarget} />);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(getBoundingClientRectSpy).toHaveBeenCalledTimes(2);
  });

  it('updates position on resize', () => {
    render(<CheckpointOverlay target={mockTarget} />);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(getBoundingClientRectSpy).toHaveBeenCalledTimes(2);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<CheckpointOverlay target={mockTarget} />);
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('renders overlay sections with correct dimensions', () => {
    render(<CheckpointOverlay target={mockTarget} />);
    const overlay = screen.getByTestId('checkpoint-overlay');
    const sections = overlay.children;

    // Check top section
    expect(sections[0]).toHaveStyle({
      position: 'absolute',
      top: '0px',
      left: '0px',
      right: '0px',
      height: `${mockRect.top}px`,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    });

    // Check left section
    expect(sections[1]).toHaveStyle({
      position: 'absolute',
      top: `${mockRect.top}px`,
      left: '0px',
      width: `${mockRect.left}px`,
      height: `${mockRect.height}px`,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    });

    // Check right section
    expect(sections[2]).toHaveStyle({
      position: 'absolute',
      top: `${mockRect.top}px`,
      left: `${mockRect.left + mockRect.width}px`,
      right: '0px',
      height: `${mockRect.height}px`,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    });

    // Check bottom section
    expect(sections[3]).toHaveStyle({
      position: 'absolute',
      top: `${mockRect.top + mockRect.height}px`,
      left: '0px',
      right: '0px',
      bottom: '0px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    });
  });
});
