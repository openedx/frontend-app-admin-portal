import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';

import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';
import SSOConfigConfiguredCard from '../SSOConfigConfiguredCard';

describe('SSOConfigCard', () => {
  const store = getMockStore({ ...initialStore });
  test('render landing text when config isnt validated', () => {
    const INITIAL_SSO_STATE = {
      ...SSO_INITIAL_STATE,
      providerConfig: {
        slug: 'slug-provider',
      },
    };
    const config = {
      name: 'name-config',
      slug: 'slug',
      entity_id: 'entityId',
      id: 1,
    };
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConfiguredCard
            config={config}
            testLink="http://test"
            setConnectError={jest.fn()}
            setShowValidatedText={jest.fn()}
            showValidatedText={false}
          />
        </SSOConfigContextProvider>
      </Provider>,
    );
    expect(screen.getByText(
      'Once you\'ve successfully logged in, this page will navigate to the SSO existing '
      + 'configuration screen and the connection will be marked active.',
    )).toBeInTheDocument();
    expect(screen.getByDisplayValue('http://test')).toBeInTheDocument();
  });
  test('setting completed state when wav valid at is set on render', () => {
    const configName = 'name-config';
    const configEntityId = 'entityId';
    const config = {
      name: configName,
      slug: 'slug',
      entity_id: configEntityId,
      id: 1,
      was_valid_at: '10/10/2020',
    };
    const mockSetShowValidatedText = jest.fn();
    const INITIAL_SSO_STATE = {
      ...SSO_INITIAL_STATE,
      providerConfig: {
        slug: 'slug-provider',
      },
      connect: { ...SSO_INITIAL_STATE.connect, isSsoValid: true },
    };
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConfiguredCard
            config={config}
            testLink="http://test"
            setConnectError={jest.fn()}
            setShowValidatedText={mockSetShowValidatedText}
            showValidatedText
          />
        </SSOConfigContextProvider>
      </Provider>,
    );
    expect(mockSetShowValidatedText).toHaveBeenCalledWith(true);
  });
});
