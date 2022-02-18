import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import DegreedConfig from '../LMSConfigs/DegreedConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';

const mockOnClick = jest.fn();

describe('<DegreedConfig />', () => {
  test('renders Degreed Config Form', () => {
    render(
      <DegreedConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('API Client ID');
    screen.getByLabelText('API Client Secret');
    screen.getByLabelText('Degreed Organization Code');
    screen.getByLabelText('Degreed Base URL');
    screen.getByLabelText('Degreed User ID');
    screen.getByLabelText('Degreed User Password');
  });
  test('test button disable', () => {
    render(
      <DegreedConfig
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
    fireEvent.change(screen.getByLabelText('Degreed Organization Code'), {
      target: { value: 'test3' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: 'test4' },
    });
    fireEvent.change(screen.getByLabelText('Degreed User ID'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('Degreed User Password'), {
      target: { value: 'test5' },
    });
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: 'https://test1.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
});
