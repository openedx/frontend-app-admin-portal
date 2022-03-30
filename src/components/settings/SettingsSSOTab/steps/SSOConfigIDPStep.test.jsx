import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import SSOConfigIDPStep from './SSOConfigIDPStep';
import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';

describe('SSO Config IDP step, with no available providerConfig', () => {
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
          <SSOConfigIDPStep />
        </SSOConfigContextProvider>
      </Provider>,
    );
    expect(screen.getByText('Provide URL')).toBeInTheDocument();
    expect(screen.getByText('Identity Provider Metadata URL')).toBeInTheDocument();
    expect(screen.getByText('Identity Provider EntityID')).toBeInTheDocument();
  });
});
