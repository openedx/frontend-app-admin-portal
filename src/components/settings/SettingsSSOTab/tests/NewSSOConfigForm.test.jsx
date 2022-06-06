import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { Provider } from 'react-redux';
import NewSSOConfigForm from '../NewSSOConfigForm';
import { SSOConfigContext, SSO_INITIAL_STATE } from '../SSOConfigContext';
import LmsApiService from '../../../../data/services/LmsApiService';
import { getMockStore, initialStore } from '../testutils';
import handleErrors from '../../utils';

jest.mock('../../utils');
jest.mock('../hooks', () => {
  const originalModule = jest.requireActual('../hooks');
  return {
    ...originalModule,
    useExistingSSOConfigs: () => [[{ hehe: 'haha' }], null, true],
  };
});

const enterpriseId = 'an-id-1';
const store = getMockStore({ ...initialStore });

const mockSetPRovderConfig = jest.fn();
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
  setProviderConfig: mockSetPRovderConfig,
  setRefreshBool: jest.fn(),
};

describe('SAML Config Tab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('canceling connect step', async () => {
    const mockGetProviderConfig = jest.spyOn(LmsApiService, 'getProviderConfig');
    mockGetProviderConfig.mockResolvedValue({ data: { result: [{ woohoo: 'success!' }] } });
    contextValue.ssoState.currentStep = 'connect';
    render(
      <Provider store={store}>
        <SSOConfigContext.Provider value={contextValue}>
          <Provider store={store}><NewSSOConfigForm enterpriseId={enterpriseId} /></Provider>
        </SSOConfigContext.Provider>
      </Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to SAML identity provider for single sign-on, such as Okta or OneLogin to '
        + 'allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText('Loading SSO Configurations...'),
    ).toBeInTheDocument();
    userEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(mockSetPRovderConfig).toHaveBeenCalledWith(null));
  });
  test('canceling service provider step', async () => {
    contextValue.ssoState.currentStep = 'serviceprovider';
    render(
      <Provider store={store}>
        <SSOConfigContext.Provider value={contextValue}>
          <Provider store={store}><NewSSOConfigForm enterpriseId={enterpriseId} /></Provider>
        </SSOConfigContext.Provider>
      </Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to SAML identity provider for single sign-on, such as Okta or OneLogin to '
        + 'allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText('I have added edX as a Service Provider in my SAML configuration'),
    ).toBeInTheDocument();
    userEvent.click(screen.getByText('Cancel'));
    expect(mockSetPRovderConfig).toHaveBeenCalledWith(null);
  });
  test('error while configure step updating config from cancel button', async () => {
    // Setup
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockImplementation(() => {
      throw new Error({ response: { data: 'foobar' } });
    });
    contextValue.ssoState.currentStep = 'configure';

    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}><NewSSOConfigForm enterpriseId={enterpriseId} /></Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to SAML identity provider for single sign-on, such as Okta or OneLogin to '
        + 'allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.type(screen.getByText('Maximum Session Length (seconds)'), '2');
    userEvent.click(screen.getByText('Cancel'));
    await expect(screen.queryByText('Do you want to save your work?')).toBeInTheDocument();
    userEvent.click(screen.getByText('Save'));
    await expect(handleErrors).toHaveBeenCalled();
    expect(screen.queryByText('Our system experienced an error.'));
  });
  test('canceling configure step without making changes', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    contextValue.ssoState.currentStep = 'configure';

    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}><NewSSOConfigForm enterpriseId={enterpriseId} /></Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to SAML identity provider for single sign-on, such as Okta or OneLogin to '
        + 'allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.click(screen.getByText('Cancel'));
    expect(mockUpdateProviderConfig).not.toHaveBeenCalled();
    expect(mockSetPRovderConfig).toHaveBeenCalledWith(null);
  });
  test('error while configure step updating config from next button', async () => {
    // Setup
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockImplementation(() => {
      throw new Error({ response: { data: 'foobar' } });
    });
    contextValue.ssoState.currentStep = 'configure';

    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}><NewSSOConfigForm enterpriseId={enterpriseId} /></Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to SAML identity provider for single sign-on, such as Okta or OneLogin to '
        + 'allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.type(screen.getByText('Maximum Session Length (seconds)'), '2');
    userEvent.click(screen.getByText('Next'));
    await expect(handleErrors).toHaveBeenCalled();
    expect(screen.queryByText('Our system experienced an error.'));
  });
  test('canceling without saving configure form', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    contextValue.ssoState.currentStep = 'configure';
    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}><NewSSOConfigForm enterpriseId={enterpriseId} /></Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to SAML identity provider for single sign-on, such as Okta or OneLogin to '
        + 'allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.type(screen.getByText('Maximum Session Length (seconds)'), 'haha hehe');
    userEvent.click(screen.getByText('Cancel'));
    await expect(screen.queryByText('Do you want to save your work?')).toBeInTheDocument();
    userEvent.click(screen.getByText('Exit without saving'));
    await expect(mockUpdateProviderConfig).not.toHaveBeenCalled();
  });
  test('saving while canceling configure form updates config', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockResolvedValue('success!');

    const configureContextValue = {
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
        currentStep: 'configure',
        refreshBool: false,
        providerConfig: {
          id: 1337,
        },
      },
      setProviderConfig: jest.fn(),
      setRefreshBool: jest.fn(),
    };

    render(
      <SSOConfigContext.Provider value={configureContextValue}>
        <Provider store={store}><NewSSOConfigForm enterpriseId={enterpriseId} /></Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to SAML identity provider for single sign-on, such as Okta or OneLogin to '
        + 'allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.type(screen.getByText('Maximum Session Length (seconds)'), 'haha hehe');
    userEvent.click(screen.getByText('Cancel'));
    await expect(screen.queryByText('Do you want to save your work?')).toBeInTheDocument();
    userEvent.click(screen.getByText('Save'));
    await expect(mockUpdateProviderConfig).toHaveBeenCalled();
  });
});
