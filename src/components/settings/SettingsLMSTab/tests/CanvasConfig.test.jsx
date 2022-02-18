import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CanvasConfig from '../LMSConfigs/CanvasConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';

const mockOnClick = jest.fn();

describe('<CanvasConfig />', () => {
  test('renders Canvas Config Form', () => {
    render(
      <CanvasConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    screen.getByLabelText('Display Name');
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

    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'reallyreallyreallyreallyreallylongname' },
    });
    fireEvent.change(screen.getByLabelText('API Client ID'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('Canvas Account Number'), {
      target: { value: '3' },
    });
    // bad url is not able to be submitted
    fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
      target: { value: 'test4' },
    });
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
      target: { value: 'https://www.test4.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
});
