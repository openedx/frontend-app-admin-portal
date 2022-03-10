import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  render,
  cleanup,
  act,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter, Route } from 'react-router-dom';

import SubscriptionTabs from '../SubscriptionTabs';
import {
  MANAGE_LEARNERS_TAB,
  MANAGE_REQUESTS_TAB,
  SUBSCRIPTION_TABS_LABELS,
} from '../data/constants';

const MANAGE_LEARNERS_MOCK_CONTENT = 'learners';
const MANAGE_REQUESTS_MOCK_CONTENT = 'requests';

jest.mock(
  '../SubscriptionPlanRoutes',
  () => () => (<div>{MANAGE_LEARNERS_MOCK_CONTENT}</div>),
);

jest.mock(
  '../SubscriptionSubsidyRequests',
  () => () => (<div>{MANAGE_REQUESTS_MOCK_CONTENT}</div>),
);

const enterpriseId = 'test-enterprise';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enableLearnerPortal: false,
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const store = getMockStore({ ...initialStore });

const SubscriptionTabsWithRouter = () => (
  <MemoryRouter initialEntries={[`subscriptions/${MANAGE_LEARNERS_TAB}`]}>
    <Provider store={store}>
      <Route path="subscriptions/:subscriptionsTab">
        <SubscriptionTabs />
      </Route>
    </Provider>
  </MemoryRouter>
);

describe('<SubscriptionTabs />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Clicking on a tab changes content via router', () => {
    render(<SubscriptionTabsWithRouter />);
    // assert "manage learners" and "manage requests" tabs are visible
    const manageLearnersTab = screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]);
    const manageRequestsTab = screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB]);

    // assert current tab's ("manage learners") content is visible
    expect(screen.getByText(MANAGE_LEARNERS_MOCK_CONTENT));

    // click a different tab and assert the content changed
    act(() => { userEvent.click(manageRequestsTab); });
    waitFor(() => expect(screen.getByText(MANAGE_REQUESTS_MOCK_CONTENT)));

    // click the default tab and assert the content changed
    act(() => { userEvent.click(manageLearnersTab); });
    waitFor(() => expect(screen.getByText(MANAGE_LEARNERS_MOCK_CONTENT)));
  });

  it('Clicking on default tab does not change content', () => {
    render(<SubscriptionTabsWithRouter />);
    const manageLearnersTab = screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]);
    act(() => { userEvent.click(manageLearnersTab); });
    waitFor(() => expect(screen.getByText(MANAGE_LEARNERS_MOCK_CONTENT)));
  });
});
