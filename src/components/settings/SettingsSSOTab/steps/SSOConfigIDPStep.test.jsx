import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import SSOConfigIDPStep from './SSOConfigIDPStep';
import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';

describe('SSO Config IDP step, with no available providerConfig', () => {
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
      expect(screen.getByText('Provide URL')).toBeInTheDocument();
      expect(screen.getByText('Identity Provider Metadata URL')).toBeInTheDocument();
      expect(screen.getByTestId('url-entry-entity-id')).toBeInTheDocument();
    });
  });
});
