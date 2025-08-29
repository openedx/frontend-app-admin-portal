import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import FloatingCollapsible from './index';

// Mock Paragon components
jest.mock('@openedx/paragon', () => {
  const OriginalModule = jest.requireActual('@openedx/paragon');
  return {
    ...OriginalModule,
    Icon: ({ src }) => {
      const IconComponent = src;
      return <IconComponent data-testid="icon" />;
    },
    ActionRow: ({ children }) => <div data-testid="action-row">{children}</div>,
    Button: ({ children, variant, onClick }) => (
      <button type="button" data-testid={`button-${variant}`} onClick={onClick}>
        {children}
      </button>
    ),
  };
});

// Mock Paragon icons
jest.mock('@openedx/paragon/icons', () => ({
  KeyboardArrowUp: () => <div data-testid="keyboard-arrow-up-icon" />,
  KeyboardArrowDown: () => <div data-testid="keyboard-arrow-down-icon" />,
}));

const mockStore = configureStore([]);
const defaultState = {
  portalConfiguration: {
    enterpriseBranding: {},
  },
  enterpriseCustomerAdmin: {
    onboardingTourDismissed: false,
    uuid: 'test-uuid',
  },
};

const setup = (props = {}) => {
  const store = mockStore(defaultState);

  const defaultProps = {
    title: 'Test Title',
    children: <div>Test Content</div>,
    onDismiss: jest.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };

  return {
    store,
    props: mergedProps,
    ...render(
      <IntlProvider locale="en" messages={{}}>
        <Provider store={store}>
          <FloatingCollapsible {...mergedProps} />
        </Provider>
      </IntlProvider>,
    ),
  };
};

describe('FloatingCollapsible', () => {
  it('renders with the correct title', () => {
    setup();
    expect(screen.queryByText('Test Title')).toBeTruthy();
  });

  it('renders with the collapsible initially open', () => {
    setup();
    expect(screen.queryByText('Test Content')).toBeTruthy();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const onDismiss = jest.fn();
    setup({ onDismiss });

    fireEvent.click(screen.getByTestId('button-tertiary'));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByText('Test Content')).toBeFalsy();
    });
  });

  it('closes the collapsible when cancel button is clicked', async () => {
    setup();

    // Click cancel button to close collapsible
    fireEvent.click(screen.getByTestId('button-primary'));

    await waitFor(() => {
      expect(screen.queryByText('Test Content')).toBeFalsy();
    });
  });
});
