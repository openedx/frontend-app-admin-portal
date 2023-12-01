import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { Provider } from 'react-redux';
import { HELP_CENTER_SAML_LINK } from '../../data/constants';
import { features } from '../../../../config';
import SettingsSSOTab from '..';
import LmsApiService from '../../../../data/services/LmsApiService';
import { queryClient } from '../../../test/testUtils';

const enterpriseId = 'an-id-1';
jest.mock('../../../../data/services/LmsApiService');

const mockSetHasSSOConfig = jest.fn();
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enterpriseName: 'sluggyent',
    contactEmail: 'foobar',
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = aStore => mockStore(aStore);
const store = getMockStore({ ...initialStore });

describe('SAML Config Tab', () => {
  afterEach(() => {
    features.AUTH0_SELF_SERVICE_INTEGRATION = false;
    jest.clearAllMocks();
  });
  test('renders base page with correct text and help center link', async () => {
    const aResult = () => Promise.resolve(1);
    LmsApiService.getProviderConfig.mockImplementation(() => (
      { data: { results: [] } }
    ));
    render(
      <Provider store={store}>
        <SettingsSSOTab setHasSSOConfig={mockSetHasSSOConfig} enterpriseId={enterpriseId} />
      </Provider>,
    );
    expect(screen.queryByText('SAML Configuration')).toBeInTheDocument();
    expect(screen.queryByText('Help Center')).toBeInTheDocument();
    const link = screen.getByText('Help Center');
    expect(link.getAttribute('href')).toBe(HELP_CENTER_SAML_LINK);
    await act(() => aResult());
  });

  test('page sets has valid sso config with no configs ', async () => {
    LmsApiService.getProviderConfig.mockImplementation(() => (
      { data: { results: [] } }
    ));
    render(
      <Provider store={store}>
        <SettingsSSOTab setHasSSOConfig={mockSetHasSSOConfig} enterpriseId={enterpriseId} />
      </Provider>,
    );
    await waitFor(
      () => expect(mockSetHasSSOConfig).toBeCalledWith(false),
    );
  });
  test('page sets has valid sso config with valid configs', async () => {
    LmsApiService.getProviderConfig.mockImplementation(() => (
      { data: { results: [{ was_valid_at: '10/10/22' }] } }
    ));
    render(
      <Provider store={store}>
        <SettingsSSOTab setHasSSOConfig={mockSetHasSSOConfig} enterpriseId={enterpriseId} />
      </Provider>,
    );
    await waitFor(
      () => expect(mockSetHasSSOConfig).toBeCalledWith(true),
    );
  });
  test('page renders new sso self service tool properly', async () => {
    features.AUTH0_SELF_SERVICE_INTEGRATION = true;
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
    await waitFor(() => render(
      <IntlProvider locale="en">
        <QueryClientProvider client={queryClient()}>
          <Provider store={store}>
            <SettingsSSOTab setHasSSOConfig={mockSetHasSSOConfig} enterpriseId={enterpriseId} />
          </Provider>,
        </QueryClientProvider>
      </IntlProvider>,
    ));
    expect(screen.queryByText(
      'Great news! Your test was successful and your new SSO integration is live and ready to use.',
    )).toBeInTheDocument();
  });
  test('network errors trigger sso error page', async () => {
    features.AUTH0_SELF_SERVICE_INTEGRATION = true;
    const spy = jest.spyOn(LmsApiService, 'listEnterpriseSsoOrchestrationRecords');
    spy.mockRejectedValue({});
    await waitFor(() => render(
      <IntlProvider locale="en">
        <QueryClientProvider client={queryClient()}>
          <Provider store={store}>
            <SettingsSSOTab setHasSSOConfig={mockSetHasSSOConfig} enterpriseId={enterpriseId} />
          </Provider>,
        </QueryClientProvider>
      </IntlProvider>,
    ));
    await waitFor(() => expect(
      screen.getByTestId(
        'sso-network-error-image',
      ),
    ).toBeInTheDocument());
  });
  test('creating new sso config with existing config', async () => {
    features.AUTH0_SELF_SERVICE_INTEGRATION = true;
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
    const updateEnterpriseSsoOrchestrationRecord = jest.spyOn(LmsApiService, 'updateEnterpriseSsoOrchestrationRecord');
    await waitFor(() => render(
      <IntlProvider locale="en">
        <QueryClientProvider client={queryClient()}>
          <Provider store={store}>
            <SettingsSSOTab setHasSSOConfig={mockSetHasSSOConfig} enterpriseId={enterpriseId} />
          </Provider>,
        </QueryClientProvider>
      </IntlProvider>,
    ));
    await waitFor(() => expect(
      screen.queryByText(
        'New',
      ),
    ).toBeInTheDocument());
    userEvent.click(screen.getByText('New'));
    await waitFor(() => expect(
      screen.queryByText(
        'Create new SSO configuration?',
      ),
    ).toBeInTheDocument());
    userEvent.click(screen.getByText('Create new SSO'));
    expect(updateEnterpriseSsoOrchestrationRecord).toBeCalled();
  });
});
