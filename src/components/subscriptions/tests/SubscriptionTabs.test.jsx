import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Route } from 'react-router-dom';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import SubscriptionTabs from '../SubscriptionTabs';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import {
  MANAGE_LEARNERS_TAB,
  MANAGE_REQUESTS_TAB,
  SUBSCRIPTION_TABS_LABELS,
} from '../data/constants';

const MANAGE_LEARNERS_MOCK_CONTENT = 'learners';
const MANAGE_REQUESTS_MOCK_CONTENT = 'requests';

jest.mock(
  '../SubscriptionPlanRoutes',
  () => function () {
    return <div>{MANAGE_LEARNERS_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../SubscriptionSubsidyRequests',
  () => function () {
    return <div>{MANAGE_REQUESTS_MOCK_CONTENT}</div>;
  },
);

const enterpriseId = 'test-enterprise';
const enterpriseSlug = 'sluggy';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug,
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const store = getMockStore({ ...initialStore });

const INITIAL_ROUTER_ENTRY = `/${enterpriseSlug}/admin/subscriptions/${MANAGE_LEARNERS_TAB}`;

function SubscriptionTabsWrapper({
  subsidyRequestConfiguration,
  subsidyRequestsCounts,
}) {
  return (
    <Provider store={store}>
      <Route path="/:enterpriseSlug/admin/subscriptions/:subscriptionsTab">
        <SubsidyRequestsContext.Provider value={
          useMemo(() => (
            { subsidyRequestConfiguration, subsidyRequestsCounts }
          ), [subsidyRequestConfiguration, subsidyRequestsCounts])
          }
        >
          <SubscriptionTabs />
        </SubsidyRequestsContext.Provider>
      </Route>
    </Provider>
  );
}

SubscriptionTabsWrapper.defaultProps = {
  subsidyRequestConfiguration: {
    subsidyRequestsEnabled: true,
    subsidyType: 'license',
  },
  subsidyRequestsCounts: {
    subscriptionLicenses: undefined,
    couponCodes: undefined,
  },
};

SubscriptionTabsWrapper.propTypes = {
  subsidyRequestConfiguration: PropTypes.shape({
    subsidyType: PropTypes.string,
  }),
  subsidyRequestsCounts: PropTypes.shape({
    subscriptionLicenses: PropTypes.number,
    couponCodes: PropTypes.number,
  }),
};

describe('<SubscriptionTabs />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Clicking on a tab changes content via router', async () => {
    renderWithRouter(<SubscriptionTabsWrapper />, { route: INITIAL_ROUTER_ENTRY });
    // assert "manage learners" and "manage requests" tabs are visible
    const manageLearnersTab = screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]);
    const manageRequestsTab = screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB]);

    // assert current tab's ("manage learners") content is visible
    expect(screen.getByText(MANAGE_LEARNERS_MOCK_CONTENT));

    // click a different tab and assert the content changed
    userEvent.click(manageRequestsTab);
    await screen.findByText(MANAGE_REQUESTS_MOCK_CONTENT);

    // click the default tab and assert the content changed
    userEvent.click(manageLearnersTab);
    await screen.findByText(MANAGE_LEARNERS_MOCK_CONTENT);
  });

  it('Clicking on default tab does not change content', async () => {
    renderWithRouter(<SubscriptionTabsWrapper />, { route: INITIAL_ROUTER_ENTRY });
    const manageLearnersTab = screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]);
    userEvent.click(manageLearnersTab);
    await screen.findByText(MANAGE_LEARNERS_MOCK_CONTENT);
  });

  it('When configured subsidy request is not license, hide "Manage Requests" tab', async () => {
    renderWithRouter(<SubscriptionTabsWrapper subsidyRequestConfiguration={{ subsidyType: 'coupon' }} />, { route: INITIAL_ROUTER_ENTRY });
    screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]);
    expect(screen.queryByText(SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB])).toBeFalsy();
  });

  it('When subsidy requests are not enabled, hide "Manage Requests" tab', async () => {
    renderWithRouter(
      <SubscriptionTabsWrapper
        subsidyRequestConfiguration={{
          subsidyRequestsEnabled: false,
          subsidyType: 'license',
        }}
      />,
      { route: INITIAL_ROUTER_ENTRY },
    );
    screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]);
    expect(screen.queryByText(SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB])).toBeFalsy();
  });

  it('Show notification bubble on "Manage Requests" tab with outstanding license requests', () => {
    renderWithRouter(
      <SubscriptionTabsWrapper
        subsidyRequestsCounts={{
          subscriptionLicenses: 12,
          couponCodes: undefined,
        }}
      />,
      { route: INITIAL_ROUTER_ENTRY },
    );
    screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB]);
    screen.getByText(12);
    screen.getByText('outstanding enrollment requests');
  });
});
