import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  cleanup,
  render,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SubscriptionTabs from '../SubscriptionTabs';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import {
  MANAGE_LEARNERS_TAB,
  MANAGE_REQUESTS_TAB,
  SUBSCRIPTION_TABS_LABELS,
} from '../data/constants';
import { GlobalContext } from '../../GlobalContextProvider';

const MANAGE_LEARNERS_MOCK_CONTENT = 'learners';
const MANAGE_REQUESTS_MOCK_CONTENT = 'requests';

jest.mock(
  '../SubscriptionPlanRoutes',
  () => function SubscriptionPlanRoutes() {
    return <div>{MANAGE_LEARNERS_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../SubscriptionSubsidyRequests',
  () => function SubscriptionSubsidyRequests() {
    return <div>{MANAGE_REQUESTS_MOCK_CONTENT}</div>;
  },
);

const headerHeight = 0;
const footerHeight = 0;

const defaultGlobalContextValue = {
  headerHeight,
  footerHeight,
  minHeight: `calc(100vh - ${headerHeight + footerHeight + 16}px)`,
  dispatch: jest.fn(),
};

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

const SubscriptionTabsWrapper = ({
  subsidyRequestConfiguration,
  subsidyRequestsCounts,
  route = `/${enterpriseSlug}/admin/subscriptions/${MANAGE_LEARNERS_TAB}`,
}) => {
  const value = useMemo(
    () => ({ subsidyRequestConfiguration, subsidyRequestsCounts }),
    [subsidyRequestConfiguration, subsidyRequestsCounts],
  );
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <GlobalContext.Provider value={defaultGlobalContextValue}>
            <Routes>
              <Route
                path="/:enterpriseSlug/admin/subscriptions/:subscriptionsTab"
                element={(
                  <SubsidyRequestsContext.Provider value={value}>
                    <SubscriptionTabs />
                  </SubsidyRequestsContext.Provider>
                  )}
              />
            </Routes>
          </GlobalContext.Provider>
        </MemoryRouter>
      </Provider>
    </IntlProvider>
  );
};

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

  it('Renders not found page', async () => {
    render(<SubscriptionTabsWrapper route={`/${enterpriseSlug}/admin/subscriptions/fake-route`} />);
    expect(screen.queryByText('404')).toBeTruthy();
  });

  it('Clicking on a tab changes content via router', async () => {
    render(<SubscriptionTabsWrapper />);
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
    render(<SubscriptionTabsWrapper />);
    const manageLearnersTab = screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]);
    userEvent.click(manageLearnersTab);
    await screen.findByText(MANAGE_LEARNERS_MOCK_CONTENT);
  });

  it('When configured subsidy request is not license, hide "Manage Requests" tab', async () => {
    render(<SubscriptionTabsWrapper subsidyRequestConfiguration={{ subsidyType: 'coupon' }} />);
    screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]);
    expect(screen.queryByText(SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB])).toBeFalsy();
  });

  it('When subsidy requests are not enabled, hide "Manage Requests" tab', async () => {
    render(
      <SubscriptionTabsWrapper
        subsidyRequestConfiguration={{
          subsidyRequestsEnabled: false,
          subsidyType: 'license',
        }}
      />,
    );
    screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]);
    expect(screen.queryByText(SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB])).toBeFalsy();
  });

  it('Show notification bubble on "Manage Requests" tab with outstanding license requests', () => {
    render(
      <SubscriptionTabsWrapper
        subsidyRequestsCounts={{
          subscriptionLicenses: 12,
          couponCodes: undefined,
        }}
      />,
    );
    screen.getByText(SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB]);
    screen.getByText(12);
    screen.getByText('outstanding enrollment requests');
  });
});
