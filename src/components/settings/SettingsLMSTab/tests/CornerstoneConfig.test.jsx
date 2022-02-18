import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CornerstoneConfig from '../LMSConfigs/CornerstoneConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';

const mockOnClick = jest.fn();

describe('<CornerstoneConfig />', () => {
  test('renders Cornerstone Config Form', () => {
    render(
      <CornerstoneConfig
        id="test-enterprise-id"
        onClick={mockOnClick}
      />,
    );
    screen.getByLabelText('Display Name');
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
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'reallyreallyreallyreallyreallylongname' },
    });
    // bad url not able to be submitted
    fireEvent.change(screen.getByLabelText('Cornerstone Base URL'), {
      target: { value: 'test1' },
    });
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('Cornerstone Base URL'), {
      target: { value: 'https://www.test1.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
});
