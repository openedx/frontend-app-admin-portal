import {
  render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { useAllEnterpriseGroups } from '../../learner-credit-management/data';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import PeopleManagementPage from '..';

const mockStore = configureMockStore([thunk]);
const getMockStore = (store) => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    enterpriseGroupsV2: true,
  },
};

const defaultEnterpriseSubsidiesContextValue = {
  enterpriseSubsidyTypes: ['budget'],
  isLoading: false,
};

const subsEnterpriseSubsidiesContextValue = {
  enterpriseSubsidyTypes: ['license'],
  isLoading: false,
};

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));

jest.mock('../../learner-credit-management/data', () => ({
  ...jest.requireActual('../../learner-credit-management/data'),
  useAllEnterpriseGroups: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
}));

const mockGroupsResponse = [{
  enterpriseCustomer: enterpriseUUID,
  name: 'only cool people',
  uuid: '12345',
  acceptedMembersCount: 4,
  groupType: 'flex',
  created: '2024-10-31T03:33:33.292361Z',
}];

const mockMultipleGroupsResponse = [
  {
    name: 'captain crunch',
    acceptedMembersCount: 4,
  },
  {
    name: 'cinnamon toast crunch',
    acceptedMembersCount: 5,
  },
  {
    name: 'cocoa puffs',
    acceptedMembersCount: 10,
  },
  {
    name: 'fruity pebbles',
    acceptedMembersCount: 5,
  },
];

const PeopleManagementPageWrapper = ({
  initialState = initialStoreState,
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
}) => {
  const store = getMockStore(initialState);
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
          <PeopleManagementPage />
        </EnterpriseSubsidiesContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

describe('<PeopleManagementPage >', () => {
  it('renders the PeopleManagementPage zero state', () => {
    useAllEnterpriseGroups.mockReturnValue({ data: { results: {} } });
    render(<PeopleManagementPageWrapper />);
    expect(document.querySelector('h3').textContent).toEqual("Your organization's groups");
    expect(screen.getByText("You don't have any groups yet.")).toBeInTheDocument();
    expect(screen.getByText(
      'Monitor group learning progress, assign more courses, and invite members to new Learner Credit budgets.',
    )).toBeInTheDocument();
  });
  it('renders the PeopleManagementPage zero state without LC', () => {
    useAllEnterpriseGroups.mockReturnValue({ data: { results: [] } });
    const store = getMockStore(initialStoreState);
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <EnterpriseSubsidiesContext.Provider value={subsEnterpriseSubsidiesContextValue}>
            <PeopleManagementPage />
          </EnterpriseSubsidiesContext.Provider>
        </Provider>
      </IntlProvider>,
    );
    expect(document.querySelector('h3').textContent).toEqual(
      "Your organization's groups",
    );
    expect(screen.getByText("You don't have any groups yet.")).toBeInTheDocument();
    expect(screen.getByText("Once a group is created, you can track members' progress.")).toBeInTheDocument();
  });
  it('renders the PeopleManagementPage group card grid', () => {
    useAllEnterpriseGroups.mockReturnValue({ data: mockGroupsResponse });
    const store = getMockStore(initialStoreState);
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <EnterpriseSubsidiesContext.Provider value={subsEnterpriseSubsidiesContextValue}>
            <PeopleManagementPage />
          </EnterpriseSubsidiesContext.Provider>
        </Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('only cool people')).toBeInTheDocument();
    expect(screen.getByText('4 members')).toBeInTheDocument();
  });
  it('renders the PeopleManagementPage group card grid with collapsible', async () => {
    useAllEnterpriseGroups.mockReturnValue({ data: mockMultipleGroupsResponse });
    const store = getMockStore(initialStoreState);
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <EnterpriseSubsidiesContext.Provider value={subsEnterpriseSubsidiesContextValue}>
            <PeopleManagementPage />
          </EnterpriseSubsidiesContext.Provider>
        </Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('captain crunch')).toBeInTheDocument();
    expect(screen.getByText('Show all 4 groups')).toBeInTheDocument();
    expect(screen.queryByText('fruity pebbles')).not.toBeInTheDocument();

    const closedCollapsible = screen.getByText('Show all 4 groups');
    closedCollapsible.click();
    await waitFor(() => {
      expect(screen.getByText('fruity pebbles')).toBeInTheDocument();
    });

    expect(screen.queryByText('Show all 4 groups')).toBeNull();
    const openCollapsible = screen.getByText('Show less');
    expect(openCollapsible).toBeInTheDocument();
  });
  it('renders group deleted toast after redirect', async () => {
    useAllEnterpriseGroups.mockReturnValue({ data: { results: {} } });
    // eslint-disable-next-line no-global-assign
    window = Object.create(window);
    const params = '?toast=true';
    Object.defineProperty(window, 'location', {
      value: {
        search: params,
      },
      writable: true,
    });
    expect(window.location.search).toEqual(params);
    render(<PeopleManagementPageWrapper />);
    await waitFor(() => {
      expect(screen.queryByText('Group deleted')).toBeInTheDocument();
    });
  });
});
