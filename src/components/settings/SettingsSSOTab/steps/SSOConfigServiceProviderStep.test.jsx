import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import SSOConfigServiceProviderStep from './SSOConfigServiceProviderStep';
import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';

describe('SSO Config Service provider step, with preloaded providerConfig', () => {
  test('renders page with metadata link', () => {
    const store = getMockStore({ ...initialStore });
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
