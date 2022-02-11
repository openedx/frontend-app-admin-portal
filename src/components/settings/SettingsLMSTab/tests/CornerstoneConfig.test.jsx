import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';

import CornerstoneConfig from '../LmsConfigs/CornerstoneConfig';

const mockOnClick = jest.fn();

describe('<CornerstoneConfig />', () => {
  test('renders Cornerstone Config Form', () => {
    render(
      <CornerstoneConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    screen.getByLabelText('Cornerstone Base URL');
  });
  test('test button disable', () => {
    render(
      <CornerstoneConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    expect(screen.getByText('Submit')).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Cornerstone Base URL'), {
      target: { value: 'test1' },
    });

    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
});
