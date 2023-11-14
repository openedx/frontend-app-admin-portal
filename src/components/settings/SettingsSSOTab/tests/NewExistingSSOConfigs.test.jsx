import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import {
  act,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { Provider } from 'react-redux';
import { getMockStore, enterpriseId } from '../testutils';
import { features } from '../../../../config';
import NewExistingSSOConfigs from '../NewExistingSSOConfigs';
import { SSOConfigContext, SSO_INITIAL_STATE } from '../SSOConfigContext';
import LmsApiService from '../../../../data/services/LmsApiService';
import { queryClient } from '../../../test/testUtils';

jest.mock('../../utils');
jest.mock('../../../../data/services/LmsApiService');
const mockSetRefreshBool = jest.fn();

const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enterpriseName: 'sluggyent',
    contactEmail: 'foobar',
  },
};
const store = getMockStore({ contactEmail: 'foobar', ...initialStore });
const inactiveConfig = [
  {
    uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
    display_name: 'foobar',
    active: false,
    modified: '2022-04-12T19:51:25Z',
    configured_at: '2022-05-12T19:51:25Z',
    validated_at: '2022-06-12T19:51:25Z',
    submitted_at: '2022-04-12T19:51:25Z',
  },
];
const activeConfig = [
  {
    uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
    display_name: 'foobar',
    active: true,
    modified: '2022-04-12T19:51:25Z',
    configured_at: '2022-05-12T19:51:25Z',
    validated_at: '2022-06-12T19:51:25Z',
    submitted_at: '2022-04-12T19:51:25Z',
  },
];
const unvalidatedConfig = [
  {
    uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
    display_name: 'foobar',
    active: true,
    modified: '2022-04-12T19:51:25Z',
    configured_at: '2022-04-12T19:51:25Z',
    validated_at: null,
    submitted_at: '2022-04-12T19:51:25Z',
  },
];
const inProgressConfig = [
  {
    uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
    display_name: 'foobar',
    active: false,
    modified: '2022-04-12T19:51:25Z',
    configured_at: '2021-04-12T19:51:25Z',
    validated_at: null,
    submitted_at: '2022-04-12T19:51:25Z',
  },
];
const notConfiguredConfig = [
  {
    uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
    display_name: 'foobar',
    active: false,
    modified: '2022-04-12T19:51:25Z',
    configured_at: null,
    validated_at: null,
    submitted_at: '2022-04-12T19:51:25Z',
  },
];

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

const mockSetPollingNetworkError = jest.fn();

const setupNewExistingSSOConfigs = (configs) => {
  features.AUTH0_SELF_SERVICE_INTEGRATION = true;
  return render(
    <IntlProvider locale="en">
      <QueryClientProvider client={queryClient()}>
        <SSOConfigContext.Provider value={contextValue}>
          <Provider store={store}>
            <NewExistingSSOConfigs
              enterpriseId={enterpriseId}
              configs={configs}
              refreshBool={false}
              setRefreshBool={mockSetRefreshBool}
              setPollingNetworkError={mockSetPollingNetworkError}
            />
          </Provider>
        </SSOConfigContext.Provider>
      </QueryClientProvider>
    </IntlProvider>,
  );
};

describe('New Existing SSO Configs tests', () => {
  afterEach(() => {
    features.AUTH0_SELF_SERVICE_INTEGRATION = false;
    jest.clearAllMocks();
  });
  test('checks and sets in progress configs', async () => {
    LmsApiService.listEnterpriseSsoOrchestrationRecords.mockImplementation(() => Promise.resolve({
      data: [
        { submitted_at: '2022-04-12T19:51:25Z', configured_at: undefined },
      ],
    }));
    setupNewExistingSSOConfigs(inProgressConfig);
    expect(
      screen.queryByText(
        'Your SSO Integration is in progress',
      ),
    ).toBeInTheDocument();
  });
  test('checks and sets not configured configs', async () => {
    LmsApiService.listEnterpriseSsoOrchestrationRecords.mockImplementation(() => Promise.resolve({
      data: [
        { submitted_at: '2022-04-12T19:51:25Z', configured_at: undefined },
      ],
    }));
    setupNewExistingSSOConfigs(notConfiguredConfig);
    expect(
      screen.queryByText(
        'Your SSO Integration is in progress',
      ),
    ).toBeInTheDocument();
  });
  test('checks and sets validated configs', async () => {
    setupNewExistingSSOConfigs(activeConfig);
    expect(
      screen.queryByText(
        'Your SSO integration is live!',
      ),
    ).toBeInTheDocument();
  });
  test('checks and sets un-validated configs', async () => {
    setupNewExistingSSOConfigs(unvalidatedConfig);
    expect(
      screen.queryByText(
        'You need to test your SSO connection',
      ),
    ).toBeInTheDocument();
  });
  test('polls for finished configs', async () => {
    const spy = jest.spyOn(LmsApiService, 'listEnterpriseSsoOrchestrationRecords');
    spy.mockImplementation(() => Promise.resolve({
      data: [{
        uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
        display_name: 'foobar',
        active: true,
        modified: '2022-04-12T19:51:25Z',
        configured_at: '2022-05-12T19:51:25Z',
        validated_at: '2022-06-12T19:51:25Z',
        submitted_at: '2022-04-12T19:51:25Z',
      }],
    }));
    setupNewExistingSSOConfigs(inProgressConfig);
    expect(
      screen.queryByText(
        'Your SSO Integration is in progress',
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(mockSetRefreshBool).toHaveBeenCalledTimes(2);
  });
  test('enabling config sets loading and renders skeleton', async () => {
    LmsApiService.listEnterpriseSsoOrchestrationRecords.mockImplementation(() => Promise.resolve({
      data: [{}],
    }));
    const spy = jest.spyOn(LmsApiService, 'updateEnterpriseSsoOrchestrationRecord');
    spy.mockImplementation(() => Promise.resolve({}));
    setupNewExistingSSOConfigs(inactiveConfig);
    const button = screen.getByTestId('existing-sso-config-card-enable-button');
    act(() => {
      userEvent.click(button);
    });
    expect(spy).toBeCalledTimes(1);
    await waitFor(() => expect(
      screen.queryByTestId(
        'sso-self-service-skeleton',
      ),
    ).toBeInTheDocument());
  });
  test('config card enable action network error alert', async () => {
    LmsApiService.listEnterpriseSsoOrchestrationRecords.mockImplementation(() => Promise.resolve({
      data: [{}],
    }));
    const spy = jest.spyOn(LmsApiService, 'updateEnterpriseSsoOrchestrationRecord');
    spy.mockRejectedValue({});

    setupNewExistingSSOConfigs(inactiveConfig);
    const button = screen.getByTestId('existing-sso-config-card-enable-button');
    act(() => {
      userEvent.click(button);
    });
    expect(spy).toBeCalledTimes(1);
    await waitFor(() => expect(
      screen.queryByText(
        'Something went wrong behind the scenes',
      ),
    ).toBeInTheDocument());

    const dismissAlertButton = screen.getByText('Dismiss');
    act(() => {
      userEvent.click(dismissAlertButton);
    });
    expect(
      screen.queryByText(
        'Something went wrong behind the scenes',
      ),
    ).not.toBeInTheDocument();
  });
  test('config card disable action network error alert', async () => {
    LmsApiService.listEnterpriseSsoOrchestrationRecords.mockImplementation(() => Promise.resolve({
      data: [{}],
    }));
    const spy = jest.spyOn(LmsApiService, 'updateEnterpriseSsoOrchestrationRecord');
    spy.mockRejectedValue({});

    setupNewExistingSSOConfigs(activeConfig);
    const kebobButton = screen.getByTestId('existing-sso-config-card-dropdown');
    act(() => {
      userEvent.click(kebobButton);
    });
    const button = screen.getByTestId('existing-sso-config-disable-dropdown');
    act(() => {
      userEvent.click(button);
    });
    await waitFor(() => expect(
      screen.queryByText(
        'Something went wrong behind the scenes',
      ),
    ).toBeInTheDocument());
  });
  test('config card delete action network error alert', async () => {
    LmsApiService.listEnterpriseSsoOrchestrationRecords.mockImplementation(() => Promise.resolve({
      data: [{}],
    }));
    const spy = jest.spyOn(LmsApiService, 'deleteEnterpriseSsoOrchestrationRecord');
    spy.mockRejectedValue({});

    setupNewExistingSSOConfigs(inactiveConfig);
    const kebobButton = screen.getByTestId('existing-sso-config-card-dropdown');
    act(() => {
      userEvent.click(kebobButton);
    });
    const button = screen.getByTestId('existing-sso-config-delete-dropdown');
    act(() => {
      userEvent.click(button);
    });
    await waitFor(() => expect(
      screen.queryByText(
        'Something went wrong behind the scenes',
      ),
    ).toBeInTheDocument());
  });
  test('polling network error sets network error state', async () => {
    const spy = jest.spyOn(LmsApiService, 'listEnterpriseSsoOrchestrationRecords');
    spy.mockRejectedValue({});
    setupNewExistingSSOConfigs(inProgressConfig);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(mockSetPollingNetworkError).toHaveBeenCalledTimes(1);
  });
});
