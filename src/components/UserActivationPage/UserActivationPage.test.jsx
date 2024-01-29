import React from 'react';
import PropTypes from 'prop-types';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import {
  MemoryRouter as Router, Routes, Route, mockNavigate,
} from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import UserActivationPage from './index';

const TEST_ENTERPRISE_SLUG = 'test-enterprise';

const initialHistory = createMemoryHistory({
  initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
});

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

const UserActivationPageWrapper = ({
  history,
  ...rest
}) => (
  <Router initialEntries={[`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`]}>
    <IntlProvider locale="en">
      <Routes>
        <Route
          path="/:enterpriseSlug/admin/register/activate"
          element={<UserActivationPage {...rest} />}
        />
      </Routes>
    </IntlProvider>
  </Router>

);

UserActivationPageWrapper.defaultProps = {
  history: initialHistory,
};

UserActivationPageWrapper.propTypes = {
  history: PropTypes.shape(),
};

describe('<UserActivationPage />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders loading message when not authenticated (redirect to enterprise proxy login)', () => {
    getAuthenticatedUser.mockReturnValue(null);
    // Note: this test does not assert that the redirect to the proxy login works since
    // JSdom does not implement global.location. Due to this, JSdom outputs a "Not
    // implemented: navigation" warning for this test that can safely be ignored.
    render(<UserActivationPageWrapper />);

    // verify that the loading skeleton appears during redirect
    expect(screen.getByTestId('enterprise-app-skeleton')).toBeTruthy();
  });

  it('redirects to /admin/register when user is authenticated but has no JWT roles', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: [],
    });
    const history = createMemoryHistory({
      initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
    });

    render(<UserActivationPageWrapper history={history} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register`;
    expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectRoute);
  });

  it('displays loading skeleton when user is authenticated, has "enterprise_admin" JWT role, and is pending user hydration', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
    });

    render(<UserActivationPageWrapper />);
    expect(screen.getByTestId('enterprise-app-skeleton')).toBeTruthy();
  });

  it('displays an alert when user with unverified email is authenticated and has "enterprise_admin" JWT role', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
      isActive: false,
    });

    render(<UserActivationPageWrapper />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('redirects to /admin/learners route when user with verified email is authenticated and has "enterprise_admin" JWT role', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
      isActive: true,
    });

    const history = createMemoryHistory({
      initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
    });

    render(<UserActivationPageWrapper history={history} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/learners`;
    expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectRoute);
  });
});
