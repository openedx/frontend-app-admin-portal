import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import { SSOConfigContext, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';
import NewSSOConfigAlerts from '../NewSSOConfigAlerts';

const store = getMockStore({ contactEmail: 'foobar', ...initialStore });
const mockSetProviderConfig = jest.fn();
const contextValue = {
  ...SSO_INITIAL_STATE,
  setCurrentError: jest.fn(),
  currentError: null,
  dispatchSsoState: jest.fn(),
  ssoState: {
    idp: {
      metadataURL: '',
      entityID: '',
      entryType: '',
      isDirty: false,
    },
    serviceprovider: {
      isSPConfigured: false,
    },
    refreshBool: false,
    providerConfig: {
      id: 1337,
    },
  },
  setProviderConfig: mockSetProviderConfig,
  setRefreshBool: jest.fn(),
};

describe('New SSO Config Alerts Tests', () => {
  test('displays inProgress alert properly', async () => {
    render(
      <IntlProvider locale="en">
        <SSOConfigContext.Provider value={contextValue}>
          <Provider store={store}>
            <NewSSOConfigAlerts
              liveConfigs={[{ display_name: 'live' }]}
              inProgressConfigs={[{ display_name: 'test' }]}
              untestedConfigs={[{ display_name: 'untested' }]}
              notConfigured={[]}
              closeAlerts={jest.fn()}
            />,
          </Provider>
        </SSOConfigContext.Provider>
      </IntlProvider>,
    );
    expect(
      screen.queryByText(
        'Your SSO Integration is in progress',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'You need to test your SSO connection',
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Your SSO integration is live!',
      ),
    ).not.toBeInTheDocument();
  });
  test('inProgress alert accounts for if configured before', () => {
    render(
      <IntlProvider locale="en">
        <SSOConfigContext.Provider value={contextValue}>
          <Provider store={store}>
            <NewSSOConfigAlerts
              liveConfigs={[]}
              inProgressConfigs={[{ display_name: 'test' }]}
              untestedConfigs={[]}
              notConfigured={[{ display_name: 'not configured' }]}
              closeAlerts={jest.fn()}
            />,
          </Provider>
        </SSOConfigContext.Provider>
      </IntlProvider>,
    );
    expect(
      screen.getByText(
        'five minutes',
        { exact: false },
      ),
    ).toBeInTheDocument();
  });
  test('displays untested alert properly', () => {
    render(
      <IntlProvider locale="en">
        <SSOConfigContext.Provider value={contextValue}>
          <Provider store={store}>
            <NewSSOConfigAlerts
              liveConfigs={[{ display_name: 'live' }]}
              inProgressConfigs={[]}
              untestedConfigs={[{ display_name: 'untested' }]}
              notConfigured={[]}
              closeAlerts={jest.fn()}
            />,
          </Provider>
        </SSOConfigContext.Provider>
      </IntlProvider>,
    );
    expect(
      screen.queryByText(
        'You need to test your SSO connection',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Your SSO integration is live!',
      ),
    ).not.toBeInTheDocument();
  });
  test('displays live alert properly', () => {
    render(
      <IntlProvider locale="en">
        <SSOConfigContext.Provider value={contextValue}>
          <Provider store={store}>
            <NewSSOConfigAlerts
              liveConfigs={[{ display_name: 'live' }]}
              inProgressConfigs={[]}
              untestedConfigs={[]}
              notConfigured={[]}
              closeAlerts={jest.fn()}
            />,
          </Provider>
        </SSOConfigContext.Provider>
      </IntlProvider>,
    );
    expect(
      screen.queryByText(
        'Your SSO integration is live!',
      ),
    ).toBeInTheDocument();
  });
  test('calls closeAlerts prop on close', async () => {
    const mockCloseAlerts = jest.fn();
    render(
      <IntlProvider locale="en">
        <SSOConfigContext.Provider value={contextValue}>
          <Provider store={store}>
            <NewSSOConfigAlerts
              liveConfigs={[{ display_name: 'live' }]}
              inProgressConfigs={[]}
              untestedConfigs={[{ display_name: 'untested' }]}
              notConfigured={[]}
              closeAlerts={mockCloseAlerts}
            />,
          </Provider>
        </SSOConfigContext.Provider>
      </IntlProvider>,
    );
    await waitFor(() => {
      userEvent.click(screen.getByText('Dismiss'));
    }, []).then(() => {
      expect(mockCloseAlerts).toHaveBeenCalled();
    });
  });
});
