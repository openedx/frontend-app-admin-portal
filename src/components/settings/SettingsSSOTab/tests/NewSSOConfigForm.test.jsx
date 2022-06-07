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
const entryType = 'direct';
const metadataURL = 'https://foobar.com';
const entityID = 'foobar';
const publicKey = 'abc123';
const ssoUrl = 'https://foobar.com';
const mockCreateOrUpdateIdpRecord = jest.fn();
const mockHandleEntityIDUpdate = jest.fn();
const mockHandleMetadataEntryTypeUpdate = jest.fn();
jest.mock('../hooks', () => {
  const originalModule = jest.requireActual('../hooks');
  return {
    ...originalModule,
    useIdpState: () => ({
      entryType,
      metadataURL,
      entityID,
      publicKey,
      ssoUrl,
      createOrUpdateIdpRecord: mockCreateOrUpdateIdpRecord,
      handleEntityIDUpdate: mockHandleEntityIDUpdate,
      handleMetadataEntryTypeUpdate: mockHandleMetadataEntryTypeUpdate,
    }),
    useExistingSSOConfigs: () => [[{ hehe: 'haha' }], null, true],
  };
});

const enterpriseId = 'an-id-1';
const store = getMockStore({ ...initialStore });

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
    await waitFor(() => expect(mockSetProviderConfig).toHaveBeenCalledWith(null));
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
    expect(mockSetProviderConfig).toHaveBeenCalledWith(null);
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
    expect(mockSetProviderConfig).toHaveBeenCalledWith(null);
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
  test('configure step calls set provider config after updating', async () => {
    // Setup
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockResolvedValue({ data: { result: [{ woohoo: 'ayylmao!' }] } });
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
    await waitFor(() => expect(mockSetProviderConfig).toHaveBeenCalled());
  });
  test('idp completed check for url entry', async () => {
    // Setup
    contextValue.ssoState.currentStep = 'idp';
    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}><NewSSOConfigForm enterpriseId={enterpriseId} /></Provider>
      </SSOConfigContext.Provider>,
    );
    await waitFor(() => {
      expect(
        screen.queryByText(
          'Connect to SAML identity provider for single sign-on, such as Okta or OneLogin to '
          + 'allow quick access to your organization\'s learning catalog.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('Next')).not.toBeDisabled();
    }, []);
  });
  test('idp step fetches and displays existing idp data fields', async () => {
    // Setup
    const mockGetProviderData = jest.spyOn(LmsApiService, 'getProviderData');
    mockGetProviderData.mockResolvedValue(
      { data: { results: [{ entity_id: 'ayylmao!', public_key: '123abc!', sso_url: 'https://ayylmao.com' }] } },
    );
    contextValue.ssoState.currentStep = 'idp';
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
    await waitFor(() => expect(screen.getByText('123abc!')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByDisplayValue('ayylmao!')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByDisplayValue('https://ayylmao.com')).toBeInTheDocument());
  });
});
