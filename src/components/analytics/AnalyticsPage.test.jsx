import { act, screen, render } from '@testing-library/react';
import React from 'react';

import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
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
    enterpriseBranding: {
      secondary_color: '#9DE0AD',
    },
  },
};
const store = mockStore({
  ...initialState,
});
function AnalyticsPageWrapper() {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Route
          exact
          path="/:enterpriseSlug/admin/analytics"
          render={(routeProps) => <AnalyticsPage {...routeProps} {...store} />}
        />
      </Router>
    </Provider>
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
    act(() => {
      const { getByText } = render(<AnalyticsPageWrapper />);
      expect(getByText('Analytics')).toBeTruthy();
    });
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
    act(() => {
      render(<AnalyticsPageWrapper />);
    });
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/analytics`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });

  it('shows maintenence message on /admin/analytics when Tableau service is down', async () => {
    AnalyticsApiService.fetchTableauToken.mockImplementation(() => Promise.resolve({
      data: '-1',
    }));
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
    });
    await act(async () => {
      await render(<AnalyticsPageWrapper />);
    });
    expect(
      screen.getByText(
        'We are updating our servers! We apologize for the interruption.',
      ),
    ).toBeTruthy();
  });
});
