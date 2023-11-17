import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import Router from 'react-router';

import { Provider } from 'react-redux';
import NewSSOConfigForm from '../NewSSOConfigForm';
import { SSOConfigContext, SSO_INITIAL_STATE } from '../SSOConfigContext';
import LmsApiService from '../../../../data/services/LmsApiService';
import { getMockStore, initialStore, enterpriseId } from '../testutils';
import { updateCurrentStep } from '../data/actions';
import handleErrors from '../../utils';
import {
  INVALID_ODATA_API_TIMEOUT_INTERVAL, INVALID_SAPSF_OAUTH_ROOT_URL, INVALID_API_ROOT_URL,
} from '../../data/constants';
import { features } from '../../../../config';
import { getButtonElement } from '../../../test/testUtils';

jest.mock('../data/actions');
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
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
}));

// const enterUrlText = 'Find the URL in your Identity Provider portal or website.';
const enterUrlText = 'Identity Provider Metadata URL';
const uploadXmlText = 'Drag and drop your file here or click to upload.';

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

const setIsStepperOpen = jest.fn();

const setupNewSSOStepper = (contextChanges = {}) => {
  features.AUTH0_SELF_SERVICE_INTEGRATION = true;
  return render(
    <IntlProvider locale="en">
      <SSOConfigContext.Provider value={{ ...contextValue, ...contextChanges }}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>
    </IntlProvider>,
  );
};

describe('SAML Config Tab', () => {
  afterEach(() => {
    features.AUTH0_SELF_SERVICE_INTEGRATION = false;
    jest.clearAllMocks();
  });
  test('canceling connect step', async () => {
    const mockGetProviderConfig = jest.spyOn(LmsApiService, 'getProviderConfig');
    mockGetProviderConfig.mockResolvedValue({ data: { result: [{ woohoo: 'success!' }] } });
    contextValue.ssoState.currentStep = 'connect';
    render(
      <Provider store={store}>
        <SSOConfigContext.Provider value={contextValue}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </SSOConfigContext.Provider>
      </Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
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
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </SSOConfigContext.Provider>
      </Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByText('I have added edX as a Service Provider in my SAML configuration'),
      ).toBeInTheDocument();
    }, []);
    await waitFor(() => {
      userEvent.click(screen.getByText('Cancel'));
    }, []);
    expect(mockSetProviderConfig).toHaveBeenCalledWith(null);
  });
  test('error while configure step updating config from cancel button', async () => {
    // Setup
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockImplementation(() => {
      throw new Error();
    });
    contextValue.ssoState.currentStep = 'configure';

    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.type(screen.getByText('Maximum Session Length (seconds)'), '2');
    await waitFor(() => {
      userEvent.click(screen.getByText('Cancel'));
    }, []);
    expect(screen.queryByText('Do you want to save your work?')).toBeInTheDocument();
    await waitFor(() => {
      userEvent.click(screen.getByText('Save'));
    }, []);
    expect(handleErrors).toHaveBeenCalled();
    expect(screen.queryByText('Our system experienced an error.'));
  });
  test('canceling configure step without making changes', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    contextValue.ssoState.currentStep = 'configure';

    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      userEvent.click(screen.getByText('Cancel'));
    }, []);
    expect(mockUpdateProviderConfig).not.toHaveBeenCalled();
    expect(mockSetProviderConfig).toHaveBeenCalledWith(null);
  });
  test('update config method does not make api call if form is not updated', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    contextValue.ssoState.currentStep = 'configure';
    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      userEvent.click(screen.getByText('Next'));
    }, []);
    expect(mockUpdateProviderConfig).not.toHaveBeenCalled();
    expect(updateCurrentStep).toHaveBeenCalledWith('connect');
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
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.type(screen.getByText('Maximum Session Length (seconds)'), '2');
    await waitFor(() => {
      userEvent.click(screen.getByText('Next'));
    }, []);
    await waitFor(() => (expect(handleErrors).toHaveBeenCalled()), []);
    expect(screen.queryByText('Our system experienced an error.'));
  });
  test('canceling without saving configure form', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    contextValue.ssoState.currentStep = 'configure';
    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.type(screen.getByText('Maximum Session Length (seconds)'), 'haha hehe');
    expect(screen.getByText('Next')).toBeDisabled();
    await waitFor(() => {
      userEvent.click(screen.getByText('Cancel'));
    }, []);
    await expect(screen.queryByText('Do you want to save your work?')).toBeInTheDocument();
    await waitFor(() => {
      userEvent.click(screen.getByText('Exit without saving'));
    }, []);
    await expect(mockUpdateProviderConfig).not.toHaveBeenCalled();
  });
  test('saving while canceling configure form updates config', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockResolvedValue('success!');

    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.type(screen.getByText('Maximum Session Length (seconds)'), 'haha hehe');
    expect(screen.getByText('Next')).toBeDisabled();
    await waitFor(() => {
      userEvent.click(screen.getByText('Cancel'));
    }, []);
    await expect(screen.queryByText('Do you want to save your work?')).toBeInTheDocument();
    await waitFor(() => {
      userEvent.click(screen.getByText('Save'));
    }, []);
    await expect(mockUpdateProviderConfig).toHaveBeenCalled();
  });
  test('configure step calls set provider config after updating', async () => {
    // Setup
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockResolvedValue({ data: { result: [{ woohoo: 'ayylmao!' }] } });
    contextValue.ssoState.currentStep = 'configure';
    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    userEvent.type(screen.getByText('Maximum Session Length (seconds)'), '2');
    await waitFor(() => {
      userEvent.click(screen.getByText('Next'));
    }, []);
    await expect(mockUpdateProviderConfig).toHaveBeenCalled();
  });
  test('idp completed check for url entry', async () => {
    // Setup
    contextValue.ssoState.currentStep = 'idp';
    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    await waitFor(() => {
      expect(
        screen.queryByText(
          'Connect to a SAML identity provider for single sign-on'
          + ' to allow quick access to your organization\'s learning catalog.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('Next')).not.toBeDisabled();
    }, []);
  });
  test('show correct metadata entry based on selection', async () => {
    setupNewSSOStepper();
    await waitFor(() => {
      expect(getButtonElement('Next')).toBeInTheDocument();
    }, []);

    // Verify metadata selectors are hidden initially
    expect(screen.queryByText(enterUrlText)).not.toBeInTheDocument();
    expect(screen.queryByText(uploadXmlText)).not.toBeInTheDocument();

    // Verify metadata selectors appear with their respective selections
    userEvent.click(screen.getByText('Enter identity Provider Metadata URL'));
    await waitFor(() => {
      expect(screen.queryByText(enterUrlText)).toBeInTheDocument();
    }, []);
    expect(screen.queryByText(uploadXmlText)).not.toBeInTheDocument();

    userEvent.click(screen.getByText('Upload Identity Provider Metadata XML file'));
    await waitFor(() => {
      expect(screen.queryByText(uploadXmlText)).toBeInTheDocument();
    }, []);
    expect(screen.queryByText(enterUrlText)).not.toBeInTheDocument();
  });
  test('navigate through new non-SAP sso workflow', async () => {
    setupNewSSOStepper();
    const mockCreateEnterpriseSsoOrchestrationRecord = jest.spyOn(LmsApiService, 'createEnterpriseSsoOrchestrationRecord');
    mockCreateEnterpriseSsoOrchestrationRecord.mockResolvedValue({ data: { record: 'fakeuuid', sp_metadata_url: 'https://fake.url' } });
    jest.spyOn(Router, 'useParams').mockReturnValue({ enterpriseSlug: 'testslug' });
    // Connect Step
    await waitFor(() => {
      expect(getButtonElement('Next')).toBeInTheDocument();
    }, []);
    expect(screen.queryByText('New SSO integration')).toBeInTheDocument();
    expect(screen.queryByText('Connect')).toBeInTheDocument();
    expect(screen.queryByText('Let\'s get started')).toBeInTheDocument();
    // Click provider
    userEvent.click(screen.getByText('Okta'));
    // Click Enter identity Provider Metadata URL
    userEvent.click(screen.getByText('Enter identity Provider Metadata URL'));
    await waitFor(() => {
      expect(screen.queryByText(enterUrlText)).toBeInTheDocument();
    }, []);
    userEvent.type(screen.queryByText(enterUrlText), 'https://unimportant.link');
    userEvent.click(getButtonElement('Next'));

    // Configure Step
    await waitFor(() => {
      expect(getButtonElement('Configure')).toBeInTheDocument();
    }, []);
    expect(screen.queryByText('Enter integration details')).toBeInTheDocument();
    // Verify SAP field not present
    expect(screen.queryByText('OAuth Root URL')).not.toBeInTheDocument();

    userEvent.click(getButtonElement('Configure'));

    // Authorize Step
    await waitFor(() => {
      expect(getButtonElement('Next')).toBeInTheDocument();
    }, []);
    // Click checkbox to advance
    const getAuthorizedCheckbox = () => screen.queryByRole('checkbox');
    await waitFor(() => {
      expect(getAuthorizedCheckbox()).toBeInTheDocument();
    }, []);
    userEvent.click(getAuthorizedCheckbox());
    await waitFor(() => {
      expect(getAuthorizedCheckbox()).toBeChecked();
    }, []);
    userEvent.click(getButtonElement('Next'));

    // Confirm and Test Step
    await waitFor(() => {
      expect(getButtonElement('Finish')).toBeInTheDocument();
    }, []);
    expect(screen.queryByText('Wait for SSO configuration confirmation')).toBeInTheDocument();
  });
  test('cancel out of new SSO workflow', async () => {
    setupNewSSOStepper();
    // Connect Step Select an option to trigger cancel modal
    userEvent.click(screen.getByText('Okta'));
    userEvent.click(getButtonElement('Cancel'));
    await waitFor(() => {
      expect(getButtonElement('Exit')).toBeInTheDocument();
    }, []);
    userEvent.click(getButtonElement('Exit'));

    expect(setIsStepperOpen).toHaveBeenCalledWith(false);
  });
  test('new SSO workflow load existing metadata url config', async () => {
    const testMetadataUrl = 'http://test.metadata';
    const existingConfigContextValue = {
      ssoState: {
        providerConfig: {
          uuid: 123,
          metadataUrl: testMetadataUrl,
        },
      },
    };
    setupNewSSOStepper(existingConfigContextValue);
    // Connect Step with metadata url selected
    await waitFor(() => {
      expect(
        screen.queryByText(
          'Find the URL in your Identity Provider portal or website.',
        ),
      ).toBeInTheDocument();
    }, []);
    screen.queryByText(testMetadataUrl);
  });
  // TODO: Test case where we go SAP route
  test('navigate through new SAP sso workflow', async () => {
    setupNewSSOStepper();
    const mockCreateEnterpriseSsoOrchestrationRecord = jest.spyOn(LmsApiService, 'createEnterpriseSsoOrchestrationRecord');
    mockCreateEnterpriseSsoOrchestrationRecord.mockResolvedValue({ data: { record: 'fakeuuid', sp_metadata_url: 'https://fake.url' } });
    jest.spyOn(Router, 'useParams').mockReturnValue({ enterpriseSlug: 'testslug' });
    // Connect Step
    await waitFor(() => {
      expect(getButtonElement('Next')).toBeInTheDocument();
    }, []);
    expect(screen.queryByText('New SSO integration')).toBeInTheDocument();
    expect(screen.queryByText('Connect')).toBeInTheDocument();
    expect(screen.queryByText('Let\'s get started')).toBeInTheDocument();
    // Click SAP provider
    userEvent.click(screen.getByText('SAP SuccessFactors'));
    // Click Enter identity Provider Metadata URL
    userEvent.click(screen.getByText('Enter identity Provider Metadata URL'));
    await waitFor(() => {
      expect(screen.queryByText(enterUrlText)).toBeInTheDocument();
    }, []);
    userEvent.type(screen.queryByText(enterUrlText), 'https://unimportant.link');
    userEvent.click(getButtonElement('Next'));

    // Configure Step
    await waitFor(() => {
      expect(screen.queryByText('OAuth Root URL')).toBeInTheDocument();
    }, []);
    // Verify Configure does not advance until fields are filled out
    userEvent.click(getButtonElement('Configure'));
    expect(screen.queryByText('OAuth Root URL')).toBeInTheDocument();
    const fieldEntries = [
      ['OAuth Root URL', 'https://test'],
      ['API Root URL', 'https://test'],
      ['Company ID', 'test'],
      ['Private Key', 'test'],
      ['OAuth User ID', 'test'],
    ];
    fieldEntries.forEach(([fieldIdText, value]) => {
      userEvent.type(screen.queryByText(fieldIdText), value);
    });
    userEvent.click(getButtonElement('Configure'));
    await waitFor(() => {
      expect(getButtonElement('Next')).toBeInTheDocument();
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
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('123abc!')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByDisplayValue('ayylmao!')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByDisplayValue('https://ayylmao.com')).toBeInTheDocument());
  });
  test('configure step handling SAP IDPs', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockResolvedValue({ data: { result: [{ woohoo: 'ayylmao!' }] } });
    contextValue.ssoState.currentStep = 'configure';
    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      userEvent.click(screen.getByText('I am using SAP Success Factors as an Identity Provider'));
    }, []);
    await waitFor(() => expect(screen.getByText('SSO Configuration Name')).toBeInTheDocument());
    expect(screen.getByText('Next')).toBeDisabled();
    userEvent.type(screen.getByText('OData API Root URL'), 'foobar.com');
    userEvent.type(screen.getByText('OData Company ID'), '2');
    userEvent.type(screen.getByText('OData Client ID'), '2');
    userEvent.type(screen.getByText('OData API Timeout Interval'), '2');
    userEvent.type(screen.getByText('SAP SuccessFactors OAuth Root URL'), 'foobar.com');
    userEvent.type(screen.getByText('SAP SuccessFactors Private Key'), '2');
    userEvent.type(screen.getByText('OAuth User ID'), '2');
    expect(screen.getByText('Next')).not.toBeDisabled();
    await waitFor(() => {
      userEvent.click(screen.getByText('Next'));
    }, []);

    const expectedConfigFormData = {
      enterprise_customer_uuid: enterpriseId,
      identity_provider_type: 'sap_success_factors',
      max_session_length: '',
      attr_user_permanent_id: 'loggedinuserid',
      attr_full_name: '',
      attr_first_name: '',
      attr_last_name: '',
      attr_email: 'NameID',
      enabled: 'true',
      debug_mode: 'false',
      skip_hinted_login_dialog: 'true',
      skip_registration_form: 'true',
      skip_email_verification: 'true',
      send_to_registration_first: 'true',
      automatic_refresh_enabled: 'false',
      attr_username: 'loggedinuserid',
      other_settings: {
        odata_api_root_url: 'foobar.com',
        odata_company_id: '2',
        odata_client_id: '2',
        odata_api_timeout_interval: 2,
        sapsf_oauth_root_url: 'foobar.com',
        oauth_user_id: '2',
        sapsf_private_key: '2',
      },
    };
    mockUpdateProviderConfig.mock.calls[0][0].forEach((value, key) => {
      if (key === 'other_settings') {
        const otherSettings = JSON.parse(value);
        Object.keys(otherSettings).forEach(otherSettingsKey => {
          expect(otherSettings[otherSettingsKey]).toEqual(
            expectedConfigFormData.other_settings[otherSettingsKey],
          );
        });
      } else {
        expect(expectedConfigFormData[key]).toEqual(value);
      }
    });
    expect(mockUpdateProviderConfig.mock.calls[0][1]).toEqual(1337);
  });
  test('configure step validating SAP IDP specific fields', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockResolvedValue({ data: { result: [{ woohoo: 'ayylmao!' }] } });
    contextValue.ssoState.currentStep = 'configure';
    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      userEvent.click(screen.getByText('I am using SAP Success Factors as an Identity Provider'));
    }, []);
    await waitFor(() => expect(screen.getByText('SSO Configuration Name')).toBeInTheDocument());
    expect(screen.getByText('Next')).toBeDisabled();
    userEvent.type(screen.getByText('OData API Root URL'), 'wow');
    userEvent.type(screen.getByText('OData API Timeout Interval'), '40');
    userEvent.type(screen.getByText('SAP SuccessFactors OAuth Root URL'), 'ayylmao');
    expect(screen.getByText('Next')).toBeDisabled();
    expect(screen.getByText(INVALID_ODATA_API_TIMEOUT_INTERVAL)).toBeInTheDocument();
    expect(screen.getByText(INVALID_SAPSF_OAUTH_ROOT_URL)).toBeInTheDocument();
    expect(screen.getByText(INVALID_API_ROOT_URL)).toBeInTheDocument();
  });
  test('configure step handling attr_username', async () => {
    const mockUpdateProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    mockUpdateProviderConfig.mockResolvedValue({ data: { result: [{ woohoo: 'ayylmao!' }] } });
    contextValue.ssoState.currentStep = 'configure';
    render(
      <SSOConfigContext.Provider value={contextValue}>
        <Provider store={store}>
          <NewSSOConfigForm
            enterpriseId={enterpriseId}
            setIsStepperOpen={setIsStepperOpen}
            isStepperOpen
          />
        </Provider>
      </SSOConfigContext.Provider>,
    );
    expect(
      screen.queryByText(
        'Connect to a SAML identity provider for single sign-on'
        + ' to allow quick access to your organization\'s learning catalog.',
      ),
    ).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('SSO Configuration Name')).toBeInTheDocument());
    userEvent.type(screen.getByText('Username Hint Attribute'), 'foobar');
    expect(screen.getByText('Next')).not.toBeDisabled();
    await waitFor(() => {
      userEvent.click(screen.getByText('Next'));
    }, []);

    const expectedConfigFormData = {
      enterprise_customer_uuid: enterpriseId,
      identity_provider_type: 'standard_saml_provider',
      attr_username: 'foobar',
      other_settings: '',
      enabled: 'true',
      debug_mode: 'false',
      skip_hinted_login_dialog: 'true',
      skip_registration_form: 'true',
      skip_email_verification: 'true',
      send_to_registration_first: 'true',
      automatic_refresh_enabled: 'false',
    };
    mockUpdateProviderConfig.mock.calls[0][0].forEach((value, key) => {
      expect(expectedConfigFormData[key]).toEqual(value);
    });
    expect(mockUpdateProviderConfig.mock.calls[0][1]).toEqual(1337);
  });
});
