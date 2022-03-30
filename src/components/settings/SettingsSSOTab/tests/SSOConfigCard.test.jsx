import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';

import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';
import SSOConfigConfiguredCard from '../SSOConfigConfiguredCard';

describe('SSOConfigCard', () => {
  const store = getMockStore({ ...initialStore });
  test('render default card state when isSsoValid is false', () => {
    const INITIAL_SSO_STATE = {
      ...SSO_INITIAL_STATE,
      providerConfig: {
        slug: 'slug-provider',
      },
    };
    const config = { name: 'name-config', slug: 'slug', entity_id: 'entityId' };
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConfiguredCard config={config} testLink="http://test" />
        </SSOConfigContextProvider>
      </Provider>,
    );
    expect(screen.getByText('name-config')).toBeInTheDocument();
    expect(screen.getByText('configured')).toBeInTheDocument();
    expect(screen.queryByText('completed')).not.toBeInTheDocument();
  });
  test('render completed card state when inProgress is false and isSsoValid true', () => {
    const INITIAL_SSO_STATE = {
      ...SSO_INITIAL_STATE,
      providerConfig: {
        slug: 'slug-provider',
      },
      connect: { ...SSO_INITIAL_STATE.connect, isSsoValid: true },
    };
    const config = { name: 'name-config', slug: 'slug', entity_id: 'entityId' };
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConfiguredCard config={config} testLink="http://test" />
        </SSOConfigContextProvider>
      </Provider>,
    );
    expect(screen.getByText('name-config')).toBeInTheDocument();
    expect(screen.queryByText('configured')).not.toBeInTheDocument();
    expect(screen.queryByText('completed')).toBeInTheDocument();
  });
});
