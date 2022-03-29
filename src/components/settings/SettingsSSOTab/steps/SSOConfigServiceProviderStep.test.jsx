import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Provider } from 'react-redux';
import SSOConfigServiceProviderStep from './SSOConfigServiceProviderStep';
import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';

const enterpriseId = 'an-enterprise';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enterpriseName: 'sluggyent',
    learnerPortalEnabled: true,
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = aStore => mockStore(aStore);
const store = getMockStore({ ...initialStore });

describe('SSO Config Service provider step, with preloaded providerConfig', () => {
  test('renders page with metadata link', () => {
    const INITIAL_SSO_STATE = {
      ...SSO_INITIAL_STATE,
      providerConfig: {
        slug: 'slug-provider',
      },
    };
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigServiceProviderStep />
        </SSOConfigContextProvider>
      </Provider>,
    );
    const link = screen.getByText('metadata file');
    expect(screen.getByText('metadata file')).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('http://localhost:18000/auth/saml/metadata.xml?tpa_hint=slug-provider');
  });
});
