import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { axe } from 'jest-axe';
import SSOConfigServiceProviderStep from './SSOConfigServiceProviderStep';
import { SSO_INITIAL_STATE, SSOConfigContextProvider } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

describe('SSO Config Service provider step, with preloaded providerConfig', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Provider store={getMockStore({ ...initialStore })}>
          <SSOConfigContextProvider initialState={{ ...SSO_INITIAL_STATE, providerConfig: { slug: 'slug-provider' } }}>
            <SSOConfigServiceProviderStep />
          </SSOConfigContextProvider>
        </Provider>
      </IntlProvider>,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  test('renders page with metadata link', () => {
    const store = getMockStore({ ...initialStore });
    const INITIAL_SSO_STATE = {
      ...SSO_INITIAL_STATE,
      providerConfig: {
        slug: 'slug-provider',
      },
    };
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
            <SSOConfigServiceProviderStep />
          </SSOConfigContextProvider>
        </Provider>
      </IntlProvider>,
    );
    const link = screen.getByText('metadata file');
    expect(screen.getByText('metadata file')).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('http://localhost:18000/auth/saml/metadata.xml?tpa_hint=slug-provider');
  });
});
