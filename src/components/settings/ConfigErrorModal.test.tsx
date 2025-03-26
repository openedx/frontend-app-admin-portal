import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import ConfigErrorModal from './ConfigErrorModal';

const mockClose = jest.fn();

const overrideText = 'ayylmao';

const ConfigErrorModalWrapper = ({ children }) => (
  <IntlProvider locale="en">
    {children}
  </IntlProvider>
);

describe('<ConfigErrorModal />', () => {
  test('renders Error Modal', () => {
    render(
      <ConfigErrorModalWrapper>
        <ConfigErrorModal
          isOpen
          close={mockClose}
        />
      </ConfigErrorModalWrapper>,
    );
    expect(screen.queryByText('We were unable to process your request to submit a new LMS configuration. Please try submitting again or contact support for help.'));
    expect(screen.queryByText('Contact Support'));
  });
  test('renders Error Modal with text override', () => {
    render(
      <ConfigErrorModalWrapper>
        <ConfigErrorModal
          isOpen
          close={mockClose}
          configTextOverride={overrideText}
        />,
      </ConfigErrorModalWrapper>,
    );
    expect(screen.queryByText('ayylmao'));
    expect(screen.queryByText('Contact Support'));
  });
});
