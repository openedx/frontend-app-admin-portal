import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ConfigError from '../ConfigError';

const mockSubmit = jest.fn();
const mockClose = jest.fn();

const testCode1 = 400;
const testCode2 = 500;
const overrideText = 'ayylmao';

describe('<ConfigError />', () => {
  test('renders 400 Error Modal', () => {
    render(
      <ConfigError
        isOpen
        close={mockClose}
        submit={mockSubmit}
        code={testCode1}
      />,
    );
    expect(screen.queryByText('We were unable to process your request to submit a new LMS configuration. Please try submitting again or contact support for help.'));
    expect(screen.queryByText('Contact Support'));
    expect(screen.queryByText('Try Again'));
  });
  test('renders 500 Error Modal', () => {
    render(
      <ConfigError
        isOpen
        close={mockClose}
        submit={mockSubmit}
        code={testCode2}
      />,
    );
    expect(screen.queryByText('We were unable to process your request to submit a new LMS configuration. Please try submitting again later or contact support for help.'));
    expect(screen.queryByText('Contact Support'));
    expect(screen.queryByText('Try Again')).toBeFalsy();
  });
  test('renders Error Modal with text override', () => {
    render(
      <ConfigError
        isOpen
        close={mockClose}
        submit={mockSubmit}
        configTextOverride={overrideText}
      />,
    );
    expect(screen.queryByText('ayylmao'));
    expect(screen.queryByText('Contact Support'));
    expect(screen.queryByText('Try Again'));
  });
});
