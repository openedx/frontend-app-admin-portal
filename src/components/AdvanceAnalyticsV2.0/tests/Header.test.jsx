import React from 'react';
import { render } from '@testing-library/react';
import Header from '../Header';
import '@testing-library/jest-dom';

describe('Header', () => {
  it('renders correctly with both title and subtitle', () => {
    const { container } = render(<Header title="Test Title" subtitle="Test Subtitle" />);
    expect(container.querySelector('.analytics-header-title')).toHaveTextContent('Test Title');
    expect(container.querySelector('.analytics-header-subtitle')).toHaveTextContent('Test Subtitle');
  });

  it('renders correctly with only the title', () => {
    const { container } = render(<Header title="Test Title" />);
    expect(container.querySelector('.analytics-header-title')).toHaveTextContent('Test Title');
    expect(container.querySelector('.analytics-header-subtitle')).not.toBeInTheDocument();
  });
});
