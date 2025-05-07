import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useSortable } from '@dnd-kit/sortable';
import SortableItem from '../SortableItem';

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn(),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: jest.fn().mockReturnValue('translate3d(0px, 0px, 0px)'),
    },
  },
}));

jest.mock('@openedx/paragon', () => ({
  Icon: jest.fn().mockImplementation(({ src }) => <div data-testid="mock-icon">{src.name}</div>),
}));

jest.mock('@openedx/paragon/icons', () => ({
  DragIndicator: { name: 'DragIndicator' },
}));

describe('SortableItem', () => {
  beforeEach(() => {
    useSortable.mockReturnValue({
      attributes: { 'aria-roledescription': 'sortable' },
      listeners: { onKeyDown: jest.fn() },
      setNodeRef: jest.fn(),
      transform: {
        x: 0, y: 0, scaleX: 1, scaleY: 1,
      },
      transition: 'transform 250ms ease',
      isDragging: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <SortableItem id="test-item" disabled={false}>
        <div data-testid="child-content">Test Content</div>
      </SortableItem>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows drag indicator icon when not disabled', () => {
    render(
      <SortableItem id="test-item" disabled={false}>
        <div>Test Content</div>
      </SortableItem>,
    );

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    expect(screen.getByText('DragIndicator')).toBeInTheDocument();
  });

  it('hides drag indicator icon when disabled', () => {
    render(
      <SortableItem id="test-item" disabled>
        <div>Test Content</div>
      </SortableItem>,
    );

    expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
    expect(screen.queryByText('DragIndicator')).not.toBeInTheDocument();
  });

  it('applies correct styles when dragging', () => {
    useSortable.mockReturnValue({
      attributes: { 'aria-roledescription': 'sortable' },
      listeners: { onKeyDown: jest.fn() },
      setNodeRef: jest.fn(),
      transform: {
        x: 10, y: 20, scaleX: 1, scaleY: 1,
      },
      transition: 'transform 250ms ease',
      isDragging: true,
    });

    const { container } = render(
      <SortableItem id="test-item" disabled={false}>
        <div>Test Content</div>
      </SortableItem>,
    );

    const sortableDiv = container.firstChild;
    expect(sortableDiv).toHaveStyle({
      opacity: '0.8',
      zIndex: '1',
    });
  });
});
