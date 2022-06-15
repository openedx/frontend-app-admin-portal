import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { INVALID_LENGTH, INVALID_NAME } from '../../data/constants';
import SSOConfigConfigureStep from './SSOConfigConfigureStep';
import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';

const store = getMockStore({ ...initialStore });
const INITIAL_SSO_STATE = {
  ...SSO_INITIAL_STATE,
  providerConfig: {
    enterpriseId: 'id-1',
    slug: 'slug-provider',
  },
};

describe('SSO Config Configure step', () => {
  test('renders page with all form fields', () => {
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConfigureStep
            showExitModal={false}
            configValues={null}
            setConfigValues={jest.fn()}
            connectError={false}
            setProviderConfig={jest.fn()}
            saveOnQuit={jest.fn()}
            closeExitModal={jest.fn()}
            setRefreshBool={jest.fn()}
            refreshBool={false}
            setFormUpdated={jest.fn()}
            setConfigNextButtonDisabled={jest.fn()}
          />
        </SSOConfigContextProvider>
      </Provider>,
    );
    screen.getByLabelText('SSO Configuration Name');
    screen.getByLabelText('Maximum Session Length (seconds)');
    screen.getByLabelText('User ID Attribute');
    screen.getByLabelText('Full Name Attribute');
    screen.getByLabelText('First Name Attribute');
    screen.getByLabelText('Last Name Attribute');
    screen.getByLabelText('Email Address Attribute');
  });
  test('updating fields fires setFormUpdated', async () => {
    const mockSetFormUpdated = jest.fn();
    const configValues = null;
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConfigureStep
            showExitModal={false}
            configValues={configValues}
            setProviderConfig={jest.fn()}
            saveOnQuit={jest.fn()}
            closeExitModal={jest.fn()}
            setRefreshBool={jest.fn()}
            refreshBool={false}
            setConfigValues={jest.fn()}
            connectError={false}
            setFormUpdated={mockSetFormUpdated}
            setConfigNextButtonDisabled={jest.fn()}
          />
        </SSOConfigContextProvider>
      </Provider>,
    );
    expect(configValues).toBeNull();
    userEvent.type(screen.getByLabelText('SSO Configuration Name'), 'f');
    userEvent.type(screen.getByLabelText('Maximum Session Length (seconds)'), '1');
    userEvent.type(screen.getByLabelText('User ID Attribute'), 'f');
    userEvent.type(screen.getByLabelText('Full Name Attribute'), 'f');
    userEvent.type(screen.getByLabelText('First Name Attribute'), 'f');
    userEvent.type(screen.getByLabelText('Last Name Attribute'), 'f');
    userEvent.type(screen.getByLabelText('Email Address Attribute'), 'f');
    expect(mockSetFormUpdated).toHaveBeenCalledTimes(7);
  });
  test('page form validation', () => {
    const mockSetConfigNextButtonDisabled = jest.fn();
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConfigureStep
            showExitModal={false}
            configValues={null}
            setProviderConfig={jest.fn()}
            saveOnQuit={jest.fn()}
            closeExitModal={jest.fn()}
            setRefreshBool={jest.fn()}
            refreshBool={false}
            setConfigValues={jest.fn()}
            connectError={false}
            setFormUpdated={jest.fn()}
            setConfigNextButtonDisabled={mockSetConfigNextButtonDisabled}
          />
        </SSOConfigContextProvider>
      </Provider>,
    );
    userEvent.type(screen.getByLabelText('SSO Configuration Name'), 'reallyreallyreallyreallyreallylongname');
    userEvent.type(screen.getByLabelText('Maximum Session Length (seconds)'), '2000000');
    expect(screen.queryByText(INVALID_NAME));
    expect(screen.queryByText(INVALID_LENGTH));
    expect(mockSetConfigNextButtonDisabled).toHaveBeenCalled();
  });
  test('error with default values', () => {
    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConfigureStep
            connectError
            configValues={null}
            setConfigValues={jest.fn()}
            setFormUpdated={jest.fn()}
            showExitModal={false}
            setProviderConfig={jest.fn()}
            saveOnQuit={jest.fn()}
            closeExitModal={jest.fn()}
            setRefreshBool={jest.fn()}
            refreshBool={false}
            setConfigNextButtonDisabled={jest.fn()}
          />
        </SSOConfigContextProvider>
      </Provider>,
    );
    expect(screen.queryByText("We weren't able to establish a connection due to improperly configured fields. We've pre-populated the form for you. You can accept our suggestions, make your own changes and try connecting again, or contact support."));
    expect(screen.getByLabelText('User ID Attribute').value).toEqual('userid');
    expect(screen.getByLabelText('Full Name Attribute').value).toEqual('commonName');
    expect(screen.getByLabelText('First Name Attribute').value).toEqual('givenName');
    expect(screen.getByLabelText('Last Name Attribute').value).toEqual('surname');
    expect(screen.getByLabelText('Email Address Attribute').value).toEqual('mail');
  });
});
