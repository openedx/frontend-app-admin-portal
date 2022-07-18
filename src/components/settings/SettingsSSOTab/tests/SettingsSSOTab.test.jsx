import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Provider } from 'react-redux';
import { HELP_CENTER_SAML_LINK } from '../../data/constants';
import SettingsSSOTab from '..';
import LmsApiService from '../../../../data/services/LmsApiService';

const enterpriseId = 'an-id-1';
jest.mock('../../../../data/services/LmsApiService');

const mockSetHasSSOConfig = jest.fn();
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enterpriseName: 'sluggyent',
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = aStore => mockStore(aStore);
const store = getMockStore({ ...initialStore });

describe('SAML Config Tab', () => {
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
  test('page sets has valid sso config with valid configs ', async () => {
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
});
