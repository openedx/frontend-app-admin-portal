import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import { axe } from 'jest-axe';
import SSOConfigIDPStep from './SSOConfigIDPStep';
import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

describe('SSO Config IDP step, with no available providerConfig', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Provider store={getMockStore({ ...initialStore })}><SSOConfigContextProvider initialState={{ ...SSO_INITIAL_STATE, providerConfig: { slug: 'slug-provider' } }}><SSOConfigIDPStep setExistingMetadataUrl={jest.fn()} /></SSOConfigContextProvider></Provider>);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  test('renders page with metadata link', async () => {
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
          <SSOConfigIDPStep setExistingMetadataUrl={jest.fn()} />
        </SSOConfigContextProvider>
      </Provider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Metadata Source Information:')).toBeInTheDocument();
      expect(screen.getByText('Identity Provider Metadata URL')).toBeInTheDocument();
      expect(screen.getByTestId('url-entry-entity-id')).toBeInTheDocument();
    });
  });
});
