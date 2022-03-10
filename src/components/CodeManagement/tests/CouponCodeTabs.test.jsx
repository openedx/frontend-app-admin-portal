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
  () => () => (<div>{MANAGE_CODES_MOCK_CONTENT}</div>),
);

jest.mock(
  '../ManageRequestsTab',
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

const CouponCodeTabsWithRouter = () => (
  <MemoryRouter initialEntries={[`coupons/${MANAGE_CODES_TAB}`]}>
    <Provider store={store}>
      <Route path="coupons/:couponCodesTab">
        <CouponCodeTabs />
      </Route>
    </Provider>
  </MemoryRouter>
);

describe('<CouponCodeTabs />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Clicking on a tab changes content via router', () => {
    render(<CouponCodeTabsWithRouter />);
    // assert "manage codes" and "manage requests" tabs are visible
    const manageCodesTab = screen.getByText(COUPON_CODE_TABS_LABELS[MANAGE_CODES_TAB]);
    const manageRequestsTab = screen.getByText(COUPON_CODE_TABS_LABELS[MANAGE_REQUESTS_TAB]);

    // assert current tab's ("manage codes") content is visible
    waitFor(() => expect(screen.getByText(MANAGE_CODES_MOCK_CONTENT)));

    // click a different tab and assert the content changed
    act(() => { userEvent.click(manageRequestsTab); });
    waitFor(() => expect(screen.getByText(MANAGE_REQUESTS_MOCK_CONTENT)));

    // click default tab again and assert the content changed
    act(() => { userEvent.click(manageCodesTab); });
    waitFor(() => expect(screen.getByText(MANAGE_CODES_MOCK_CONTENT)));
  });

  it('Clicking on default tab does not change content', () => {
    render(<CouponCodeTabsWithRouter />);
    const manageCodesTab = screen.getByText(COUPON_CODE_TABS_LABELS[MANAGE_CODES_TAB]);
    act(() => { userEvent.click(manageCodesTab); });
    waitFor(() => expect(screen.getByText(MANAGE_CODES_MOCK_CONTENT)));
  });
});
