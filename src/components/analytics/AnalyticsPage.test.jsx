import React from 'react';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import { ToastsContext } from '../Toasts';
import { AnalyticsPage } from './index';
import AnalyticsApiService from './data/service';

const TEST_ENTERPRISE_SLUG = 'test-enterprise';

jest.mock('./data/service');

const history = createMemoryHistory({
  initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/analytics`],
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
function AnalyticsPageWrapper({
  ...rest
}) {
  return (
    <Router history={history}>
      <ToastsContext.Provider value={{ addToast: () => {} }}>
        <Route
          exact
          path="/:enterpriseSlug/admin/analytics"
          render={routeProps => <AnalyticsPage {...routeProps} {...rest} />}
        />
      </ToastsContext.Provider>
    </Router>
  );
}

describe('<AnalyticsPage />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('renders loading skeleton when not authenticated (redirect to enterprise proxy login)', () => {
    AnalyticsApiService.fetchTableauToken.mockImplementation(() => Promise.resolve({
      data: 'tableau-token',
    }));
    getAuthenticatedUser.mockReturnValue(null);
    const wrapper = mount(<AnalyticsPageWrapper store={store} />);

    // verify that the loading skeleton appears during redirect
    expect(wrapper.contains(EnterpriseAppSkeleton)).toBeTruthy();
    expect(global.location.href).toBeTruthy();
  });

  it('redirects to /admin/analytics route when user is authenticated and has "enterprise_admin" JWT role', () => {
    AnalyticsApiService.fetchTableauToken.mockImplementation(() => Promise.resolve({
      data: 'tableau-token',
    }));
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
    });
    mount(<AnalyticsPageWrapper store={store} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/analytics`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });
});
