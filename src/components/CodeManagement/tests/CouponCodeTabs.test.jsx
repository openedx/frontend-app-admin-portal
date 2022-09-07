import React from 'react';
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

import { SubsidyRequestsContext } from '../../subsidy-requests';
import CouponCodeTabs from '../CouponCodeTabs';
import {
  MANAGE_CODES_TAB,
  MANAGE_REQUESTS_TAB,
  COUPON_CODE_TABS_LABELS,
} from '../data/constants';

const MANAGE_CODES_MOCK_CONTENT = 'codes';
const MANAGE_REQUESTS_MOCK_CONTENT = 'requests';

jest.mock(
  '../ManageCodesTab',
  () => function () {
    return <div>{MANAGE_CODES_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../ManageRequestsTab',
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

const INITIAL_ROUTER_ENTRY = `/${enterpriseSlug}/admin/coupons/${MANAGE_CODES_TAB}`;

function CouponCodeTabsWrapper({
  subsidyRequestConfiguration,
  subsidyRequestsCounts,
}) {
  return (
    <Provider store={store}>
      <Route path="/:enterpriseSlug/admin/coupons/:couponCodesTab">
        <SubsidyRequestsContext.Provider value={{ subsidyRequestConfiguration, subsidyRequestsCounts }}>
          <CouponCodeTabs />
        </SubsidyRequestsContext.Provider>
      </Route>
    </Provider>
  );
}

CouponCodeTabsWrapper.defaultProps = {
  subsidyRequestConfiguration: {
    subsidyRequestsEnabled: true,
    subsidyType: 'coupon',
  },
  subsidyRequestsCounts: {
    subscriptionLicenses: undefined,
    couponCodes: undefined,
  },
};

CouponCodeTabsWrapper.propTypes = {
  subsidyRequestConfiguration: PropTypes.shape({
    subsidyType: PropTypes.string,
  }),
  subsidyRequestsCounts: PropTypes.shape({
    subscriptionLicenses: PropTypes.number,
    couponCodes: PropTypes.number,
  }),
};

describe('<CouponCodeTabs />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Clicking on a tab changes content via router', async () => {
    renderWithRouter(<CouponCodeTabsWrapper />, { route: INITIAL_ROUTER_ENTRY });

    // assert "manage codes" and "manage requests" tabs are visible
    const manageCodesTab = screen.getByText(COUPON_CODE_TABS_LABELS[MANAGE_CODES_TAB]);
    const manageRequestsTab = screen.getByText(COUPON_CODE_TABS_LABELS[MANAGE_REQUESTS_TAB]);

    // assert current tab's ("manage codes") content is visible
    expect(screen.getByText(MANAGE_CODES_MOCK_CONTENT));

    // click a different tab and assert the content changed
    userEvent.click(manageRequestsTab);
    await screen.findByText(MANAGE_REQUESTS_MOCK_CONTENT);

    // click default tab again and assert the content changed
    userEvent.click(manageCodesTab);
    await screen.findByText(MANAGE_CODES_MOCK_CONTENT);
  });

  it('Clicking on default tab does not change content', async () => {
    renderWithRouter(<CouponCodeTabsWrapper />, { route: INITIAL_ROUTER_ENTRY });
    const manageCodesTab = screen.getByText(COUPON_CODE_TABS_LABELS[MANAGE_CODES_TAB]);
    userEvent.click(manageCodesTab);
    await screen.findByText(MANAGE_CODES_MOCK_CONTENT);
  });

  it('When configured subsidy request is not coupon, hide "Manage Requests" tab', async () => {
    renderWithRouter(<CouponCodeTabsWrapper subsidyRequestConfiguration={{ subsidyType: 'license' }} />, { route: INITIAL_ROUTER_ENTRY });
    screen.getByText(COUPON_CODE_TABS_LABELS[MANAGE_CODES_TAB]);
    expect(screen.queryByText(COUPON_CODE_TABS_LABELS[MANAGE_REQUESTS_TAB])).toBeFalsy();
  });

  it('When subsidy requests are not enabled, hide "Manage Requests" tab', async () => {
    renderWithRouter(
      <CouponCodeTabsWrapper
        subsidyRequestConfiguration={{
          subsidyRequestsEnabled: false,
          subsidyType: 'coupon',
        }}
      />,
      { route: INITIAL_ROUTER_ENTRY },
    );
    screen.getByText(COUPON_CODE_TABS_LABELS[MANAGE_CODES_TAB]);
    expect(screen.queryByText(COUPON_CODE_TABS_LABELS[MANAGE_REQUESTS_TAB])).toBeFalsy();
  });

  it('Show notification bubble on "Manage Requests" tab with outstanding license requests', () => {
    renderWithRouter(
      <CouponCodeTabsWrapper
        subsidyRequestsCounts={{
          subscriptionLicenses: undefined,
          couponCodes: 12,
        }}
      />,
      { route: INITIAL_ROUTER_ENTRY },
    );
    screen.getByText(COUPON_CODE_TABS_LABELS[MANAGE_REQUESTS_TAB]);
    screen.getByText(12);
    screen.getByText('outstanding enrollment requests');
  });
});
