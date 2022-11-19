import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  render,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter, Route } from 'react-router-dom';

import CodeManagementRoutes from '../CodeManagementRoutes';

const COUPON_CODE_TABS_MOCK_CONTENT = 'coupon code tabs';
const MANAGE_CODES_MOCK_CONTENT = 'manage codes';
const NOT_FOUND_MOCK_CONTENT = 'not found';

jest.mock(
  '../CouponCodeTabs',
  () => function CouponCodeTabs() {
    return <div>{COUPON_CODE_TABS_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../../NotFoundPage',
  () => function NotFoundPage() {
    return <div>{NOT_FOUND_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../ManageCodesTab',
  () => function ManageCodesTab() {
    return <div>{MANAGE_CODES_MOCK_CONTENT}</div>;
  },
);

const enterpriseId = 'test-enterprise';
const enterpriseSlug = 'sluggy';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug,
    enableLearnerPortal: false,
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const store = getMockStore({ ...initialStore });

const CodeManagementRoutesWithRouter = ({
  store: storeProp,
  initialEntries,
  routePath,
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Provider store={storeProp}>
      <Route path={routePath}>
        <CodeManagementRoutes />
      </Route>
    </Provider>
  </MemoryRouter>
);

CodeManagementRoutesWithRouter.propTypes = {
  store: PropTypes.shape(),
  initialEntries: PropTypes.arrayOf(PropTypes.string),
  routePath: PropTypes.string,
};

CodeManagementRoutesWithRouter.defaultProps = {
  store,
  initialEntries: [`/${enterpriseSlug}/admin/coupons`],
  routePath: '/',
};

describe('<CodeManagementRoutes />', () => {
  it('redirects to default tab', () => {
    const newStore = getMockStore(initialStore);

    render(<CodeManagementRoutesWithRouter store={newStore} />);
    expect(screen.getByText(COUPON_CODE_TABS_MOCK_CONTENT));
  });
});
