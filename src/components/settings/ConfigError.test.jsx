import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ConfigError from './ConfigError';

const mockClose = jest.fn();

const overrideText = 'ayylmao';

describe('<ConfigError />', () => {
  test('renders Error Modal', () => {
    render(
      <ConfigError
        isOpen
        close={mockClose}
      />,
    );
    expect(screen.queryByText('We were unable to process your request to submit a new LMS configuration. Please try submitting again or contact support for help.'));
    expect(screen.queryByText('Contact Support'));
  });
  test('renders Error Modal with text override', () => {
    render(
      <ConfigError
        isOpen
        close={mockClose}
        configTextOverride={overrideText}
      />,
    );
    expect(screen.queryByText('ayylmao'));
    expect(screen.queryByText('Contact Support'));
  });
});
