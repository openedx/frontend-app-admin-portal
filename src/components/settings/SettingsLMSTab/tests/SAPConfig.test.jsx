import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';

import SAPConfig from '../LmsConfigs/SAPConfig';

const mockOnClick = jest.fn();

describe('<SAPConfig />', () => {
  test('renders SAP Config Form', () => {
    render(
      <SAPConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    screen.getByLabelText('Client ID');
    screen.getByLabelText('SAP Base URL');
    screen.getByLabelText('SAP Company ID');
    screen.getByLabelText('SAP User ID');
    screen.getByLabelText('OAuth Client ID');
    screen.getByLabelText('OAuth Client Secret');
    screen.getByLabelText('SAP User Type');
  });
  test('test button disable', () => {
    render(
      <SAPConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    expect(screen.getByText('Submit')).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Client ID'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('SAP Base URL'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('SAP Company ID'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('SAP User ID'), {
      target: { value: 'test4' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client ID'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client Secret'), {
      target: { value: 'test6' },
    });
    // don't have to change userType, will default to user
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
});
