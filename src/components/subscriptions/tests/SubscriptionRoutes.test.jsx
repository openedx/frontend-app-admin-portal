import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter, Route } from 'react-router-dom';

import SubscriptionRoutes from '../SubscriptionRoutes';
import { features } from '../../../config';

const SUBSCRIPTION_TABS_MOCK_CONTENT = 'subcription tabs';
const SUBSCRIPTION_PLAN_ROUTES_MOCK_CONTENT = 'subscription plan routes';
const NOT_FOUND_MOCK_CONTENT = 'not found';

jest.mock(
  '../SubscriptionTabs',
  () => () => (<div>{SUBSCRIPTION_TABS_MOCK_CONTENT}</div>),
);

jest.mock(
  '../../NotFoundPage',
  () => () => (<div>{NOT_FOUND_MOCK_CONTENT}</div>),
);

jest.mock(
  '../SubscriptionPlanRoutes',
  () => () => (<div>{SUBSCRIPTION_PLAN_ROUTES_MOCK_CONTENT}</div>),
);

const enterpriseId = 'test-enterprise';
const enterpriseSlug = 'sluggy';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug,
    enableLearnerPortal: false,
    enableBrowseAndRequest: false,
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
      <Route path={routePath}>
        <SubscriptionRoutes />
      </Route>
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
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    features.FEATURE_BROWSE_AND_REQUEST = false;
  });

  describe('with tabs enabled', () => {
    let newStore;
    beforeEach(() => {
      newStore = getMockStore({
        ...initialStore,
        portalConfiguration: {
          ...initialStore.portalConfiguration,
          enableBrowseAndRequest: true,
        },
      });
      features.FEATURE_BROWSE_AND_REQUEST = true;
    });

    it('redirects to default tab', () => {
      render(<SubscriptionRoutesWithRouter store={newStore} />);
      expect(screen.getByText(SUBSCRIPTION_TABS_MOCK_CONTENT));
    });
  });

  describe('without tabs enabled', () => {
    it('renders subscription plan routes', () => {
      render(<SubscriptionRoutesWithRouter />);
      expect(screen.getByText(SUBSCRIPTION_PLAN_ROUTES_MOCK_CONTENT));
    });
  });
});
