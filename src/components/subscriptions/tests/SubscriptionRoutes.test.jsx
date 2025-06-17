import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  render,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import SubscriptionRoutes from '../SubscriptionRoutes';

const SUBSCRIPTION_TABS_MOCK_CONTENT = 'subcription tabs';
const SUBSCRIPTION_PLAN_ROUTES_MOCK_CONTENT = 'subscription plan routes';
const NOT_FOUND_MOCK_CONTENT = 'not found';

jest.mock(
  '../SubscriptionTabs',
  () => function SubscriptionTabs() {
    return <div>{SUBSCRIPTION_TABS_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../../NotFoundPage',
  () => function NotFoundPage() {
    return <div>{NOT_FOUND_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../SubscriptionPlanRoutes',
  () => function SubscriptionPlanRoutes() {
    return <div>{SUBSCRIPTION_PLAN_ROUTES_MOCK_CONTENT}</div>;
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

const SubscriptionRoutesWithRouter = ({
  store: storeProp,
  initialEntries,
  routePath,
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Provider store={storeProp}>
      <Routes>
        <Route path={`${routePath}*`} element={<SubscriptionRoutes />} />
      </Routes>
    </Provider>
  </MemoryRouter>
);

SubscriptionRoutesWithRouter.propTypes = {
  store: PropTypes.shape(),
  initialEntries: PropTypes.arrayOf(PropTypes.string),
  routePath: PropTypes.string,
};

SubscriptionRoutesWithRouter.defaultProps = {
  store,
  initialEntries: [`/${enterpriseSlug}/admin/subscriptions`],
  routePath: '/',
};

describe('<SubscriptionRoutes />', () => {
  it('redirects to default tab', () => {
    const newStore = getMockStore({
      ...initialStore,
      portalConfiguration: {
        ...initialStore.portalConfiguration,
      },
    });
    render(<SubscriptionRoutesWithRouter store={newStore} />);
    expect(screen.getByText(SUBSCRIPTION_TABS_MOCK_CONTENT));
  });
});
