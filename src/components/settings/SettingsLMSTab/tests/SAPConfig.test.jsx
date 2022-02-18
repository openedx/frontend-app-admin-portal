import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import SAPConfig from '../LMSConfigs/SAPConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';

const mockOnClick = jest.fn();

describe('<SAPConfig />', () => {
  test('renders SAP Config Form', () => {
    render(
      <SAPConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    screen.getByLabelText('Display Name');
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

    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'reallyreallyreallyreallyreallylongname' },
    });
    // bad url, cannot be submitted
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
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText(INVALID_NAME));
    expect(screen.queryByText(INVALID_LINK));
    fireEvent.change(screen.getByLabelText('SAP Base URL'), {
      target: { value: 'https://test2.com' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'test2' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
});
