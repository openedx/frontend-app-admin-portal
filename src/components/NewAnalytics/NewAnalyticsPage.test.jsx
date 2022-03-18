import React from 'react';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import { ToastsContext } from '../Toasts';
import { NewAnalyticsPage } from './index';

const TEST_ENTERPRISE_SLUG = 'test-enterprise';

jest.mock('../analytics/data/service');

const history = createMemoryHistory({
  initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/new-analytics`],
});
const mockStore = configureMockStore([thunk]);
const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
  },
};
const store = mockStore({
  ...initialState,
});
const NewAnalyticsPageWrapper = ({
  ...rest
}) => (
  <Router history={history}>
    <ToastsContext.Provider value={{ addToast: () => {} }}>
      <Route
        exact
        path="/:enterpriseSlug/admin/new-analytics"
        render={routeProps => <NewAnalyticsPage {...routeProps} {...rest} />}
      />
    </ToastsContext.Provider>
  </Router>
);

describe('<NewAnalyticsPage />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('renders loading skeleton when not authenticated (redirect to enterprise proxy login)', () => {
    getAuthenticatedUser.mockReturnValue(null);
    const wrapper = mount(<NewAnalyticsPageWrapper store={store} />);

    // verify that the loading skeleton appears during redirect
    expect(wrapper.contains(EnterpriseAppSkeleton)).toBeTruthy();
    expect(global.location.href).toBeTruthy();
  });

  it('redirects to /admin/new-analytics route when user is authenticated and has "enterprise_admin" JWT role', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
    });
    mount(<NewAnalyticsPageWrapper store={store} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/new-analytics`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });
});
