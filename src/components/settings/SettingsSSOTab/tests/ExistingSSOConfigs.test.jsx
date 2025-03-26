import React from 'react';
import {
  act,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import LmsApiService from '../../../../data/services/LmsApiService';
import ExistingSSOConfigs from '../ExistingSSOConfigs';
import handleErrors from '../../utils';

jest.mock('../../utils');
jest.mock('../../../../data/services/LmsApiService');
const enterpriseId = 'test-enterprise-id';
const mockSetRefreshBool = jest.fn();

const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'banana-slug',
    enterpriseName: 'slug-king',
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = aStore => mockStore(aStore);
const store = getMockStore({ ...initialStore });

const activeConfig = [
  {
    id: 1,
    was_valid_at: '2022-04-12T19:51:25Z',
    enabled: true,
    display_name: 'cool ranch',
    name: 'cool-ranch',
  },
];
const inactiveConfig = [
  {
    id: 2,
    was_valid_at: '2022-04-12T19:51:25Z',
    enabled: false,
    display_name: 'nacho cheese',
    name: 'nacho-cheese',
  },
];
const incompleteConfig = [
  {
    id: 3,
    was_valid_at: null,
    enabled: false,
    display_name: 'bbq',
    name: 'bbq',
  },
];

const providerData = [{
  id: 10,
}];

describe('<ExistingSSOConfigs />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders active config card', async () => {
    render(
      <Provider store={store}>
        <ExistingSSOConfigs
          configs={activeConfig}
          refreshBool
          setRefreshBool={mockSetRefreshBool}
          enterpriseId={enterpriseId}
          providerData={providerData}
        />
      </Provider>,
    );
    expect(screen.getByText('cool ranch')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    userEvent.click(screen.getByTestId(`existing-sso-config-card-dropdown-${activeConfig[0].id}`));

    expect(screen.getByText('Disable')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();

    userEvent.click(screen.getByText('Disable'));
    const data = new FormData();
    data.append('enabled', false);
    data.append('enterprise_customer_uuid', enterpriseId);
    await waitFor(() => {
      expect(LmsApiService.updateProviderConfig).toHaveBeenCalledWith(data, activeConfig[0].id);
    });
  });
  it('renders inactive config card', () => {
    render(
      <Provider store={store}>
        <ExistingSSOConfigs
          configs={inactiveConfig}
          refreshBool
          setRefreshBool={mockSetRefreshBool}
          enterpriseId={enterpriseId}
          providerData={providerData}
        />
      </Provider>,
    );
    expect(screen.getByText('nacho cheese')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    act(() => {
      userEvent.click(screen.getByTestId(`existing-sso-config-card-dropdown-${inactiveConfig[0].id}`));
    });
    expect(screen.getByText('Enable')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();

    act(() => {
      userEvent.click(screen.getByText('Enable'));
    });
    const data = new FormData();
    data.append('enabled', true);
    data.append('enterprise_customer_uuid', enterpriseId);
    expect(LmsApiService.updateProviderConfig).toHaveBeenCalledWith(data, inactiveConfig[0].id);
  });
  it('renders incomplete config card', async () => {
    render(
      <Provider store={store}>
        <ExistingSSOConfigs
          configs={incompleteConfig}
          refreshBool
          setRefreshBool={mockSetRefreshBool}
          enterpriseId={enterpriseId}
          providerData={providerData}
        />
      </Provider>,
    );
    expect(screen.getByText('bbq')).toBeInTheDocument();
    expect(screen.getByText('Incomplete')).toBeInTheDocument();
    act(() => {
      userEvent.click(screen.getByTestId(`existing-sso-config-card-dropdown-${incompleteConfig[0].id}`));
    });
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });
  it('renders multiple config cards', () => {
    render(
      <Provider store={store}>
        <ExistingSSOConfigs
          configs={activeConfig.concat(inactiveConfig)}
          refreshBool
          setRefreshBool={mockSetRefreshBool}
          enterpriseId={enterpriseId}
          providerData={providerData}
        />
      </Provider>,
    );
    expect(screen.getByText('cool ranch')).toBeInTheDocument();
    expect(screen.getByText('nacho cheese')).toBeInTheDocument();
  });
  it('executes delete action on incomplete card', () => {
    render(
      <Provider store={store}>
        <ExistingSSOConfigs
          configs={incompleteConfig}
          refreshBool
          setRefreshBool={mockSetRefreshBool}
          enterpriseId={enterpriseId}
          providerData={providerData}
        />
      </Provider>,
    );
    act(() => {
      userEvent.click(screen.getByTestId(`existing-sso-config-card-dropdown-${incompleteConfig[0].id}`));
    });
    act(() => {
      userEvent.click(screen.getByText('Delete'));
    });
    expect(LmsApiService.deleteProviderConfig).toHaveBeenCalledWith(incompleteConfig[0].id, enterpriseId);
  });
  it('properly handles errors when deleting provider data', () => {
    const mockDeleteProviderData = jest.spyOn(LmsApiService, 'deleteProviderData');
    mockDeleteProviderData.mockImplementation(() => {
      throw new Error({ response: { data: 'foobar' } });
    });
    render(
      <Provider store={store}>
        <ExistingSSOConfigs
          configs={incompleteConfig}
          refreshBool
          setRefreshBool={mockSetRefreshBool}
          enterpriseId={enterpriseId}
          providerData={providerData}
        />
      </Provider>,
    );
    act(() => {
      userEvent.click(screen.getByTestId(`existing-sso-config-card-dropdown-${incompleteConfig[0].id}`));
    });
    act(() => {
      userEvent.click(screen.getByText('Delete'));
    });
    expect(handleErrors).toHaveBeenCalled();
  });
  it('properly handles errors when deleting provider configs', () => {
    const mockDeleteProviderData = jest.spyOn(LmsApiService, 'deleteProviderConfig');
    mockDeleteProviderData.mockImplementation(() => {
      throw new Error({ response: { data: 'foobar' } });
    });
    render(
      <Provider store={store}>
        <ExistingSSOConfigs
          configs={incompleteConfig}
          refreshBool
          setRefreshBool={mockSetRefreshBool}
          enterpriseId={enterpriseId}
          providerData={providerData}
        />
      </Provider>,
    );
    act(() => {
      userEvent.click(screen.getByTestId(`existing-sso-config-card-dropdown-${incompleteConfig[0].id}`));
    });
    act(() => {
      userEvent.click(screen.getByText('Delete'));
    });
    expect(handleErrors).toHaveBeenCalled();
  });
  it('properly displays error message when deleting provider configs', async () => {
    const mockDeleteProviderData = jest.spyOn(LmsApiService, 'deleteProviderData');
    mockDeleteProviderData.mockImplementation(() => {
      throw new Error({ response: { data: 'foobar' } });
    });
    handleErrors.mockResolvedValue('ayylmao');
    render(
      <Provider store={store}>
        <ExistingSSOConfigs
          configs={incompleteConfig}
          refreshBool
          setRefreshBool={mockSetRefreshBool}
          enterpriseId={enterpriseId}
          providerData={providerData}
        />
      </Provider>,
    );
    act(() => {
      userEvent.click(screen.getByTestId(`existing-sso-config-card-dropdown-${incompleteConfig[0].id}`));
    });
    act(() => {
      userEvent.click(screen.getByText('Delete'));
    });
    await waitFor(() => {
      expect(screen.getByText(
        'We were unable to delete your configuration. Please try removing again or contact support for help.',
      )).toBeInTheDocument();
    }, []);
  });
});
