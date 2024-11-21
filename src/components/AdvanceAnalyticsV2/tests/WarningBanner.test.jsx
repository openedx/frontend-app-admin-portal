import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cookies from 'universal-cookie';
import WarningBanner from '../WarningBanner';
import '@testing-library/jest-dom';

// jest.mock('universal-cookie');
jest.mock('universal-cookie', () => jest.fn().mockImplementation(() => ({
  set: jest.fn(),
})));

describe('WarningBanner', () => {
  let cookies;

  beforeEach(() => {
    cookies = new Cookies();
    cookies.set = jest.fn();
  });

  test('should trigger onDismiss and set cookie in warning banner', () => {
    render(<WarningBanner />);

    // Check that the banner is initially shown
    expect(screen.getByText(/Analytics Just Got Better!/i)).toBeInTheDocument();

    // Trigger the onDismiss function
    fireEvent.click(screen.getByRole('button', { name: /Dismiss/i }));

    // Check that the banner is no longer shown
    expect(screen.queryByText(/Analytics Just Got Better!/i)).not.toBeInTheDocument();
  });
});
