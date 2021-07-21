import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import LicenseAllocationBanner, { ALLOCATION_BANNER_TEXT } from '../../licenses/LicenseAllocationBanner';

describe('<LicenseAllocationBanner />', () => {
  test('render component', () => {
    render(<LicenseAllocationBanner />);
    expect(screen.queryByText(ALLOCATION_BANNER_TEXT)).toBeTruthy();
  });

  test('component closes', () => {
    render(<LicenseAllocationBanner />);
    expect(screen.queryByText(ALLOCATION_BANNER_TEXT)).toBeTruthy();
    fireEvent(
      screen.getByText('Dismiss'),
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    expect(screen.queryByText(ALLOCATION_BANNER_TEXT)).toBeFalsy();
  });
});
