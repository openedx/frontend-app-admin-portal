import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';

import CanvasConfig from '../LmsConfigs/CanvasConfig';

const mockOnClick = jest.fn();

describe('<CanvasConfig />', () => {
  test('renders Canvas Config Form', () => {
    render(
      <CanvasConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    screen.getByLabelText('API Client ID');
    screen.getByLabelText('API Client Secret');
    screen.getByLabelText('Canvas Account Number');
    screen.getByLabelText('Canvas Base URL');
  });
  test('test button disable', () => {
    render(
      <CanvasConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    expect(screen.getByText('Submit')).toBeDisabled();

    fireEvent.change(screen.getByLabelText('API Client ID'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('Canvas Account Number'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
      target: { value: 'test4' },
    });

    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
});
