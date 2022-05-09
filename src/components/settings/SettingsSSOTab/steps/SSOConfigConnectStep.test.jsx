import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import SSOConfigConnectStep from './SSOConfigConnectStep';
import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';
import LmsApiService from '../../../../data/services/LmsApiService';

const store = getMockStore({ ...initialStore });
const TEST_PROVIDER_ID = 'test-provider-id';
const INITIAL_SSO_STATE = {
  ...SSO_INITIAL_STATE,
  providerConfig: {
    id: TEST_PROVIDER_ID,
    enterpriseId: 'id-1',
    slug: 'slug-provider',
  },
};

const mockGetProviderConfig = jest.spyOn(LmsApiService, 'getProviderConfig');
mockGetProviderConfig.mockResolvedValue({ data: { results: [{ id: TEST_PROVIDER_ID }] } });

describe('SSO Config Connect step', () => {
  test('renders page with metadata link', () => {
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConnectStep setConnectError={jest.fn()} />
        </SSOConfigContextProvider>
      </Provider>,
    );
    expect(screen.getByText('Loading SSO Configurations...')).toBeInTheDocument();
  });
});
