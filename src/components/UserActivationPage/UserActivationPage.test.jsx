import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import {
  MemoryRouter as Router, Routes, Route, mockNavigate,
} from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
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
    const wrapper = mount(<UserActivationPageWrapper />);

    // verify that the loading skeleton appears during redirect
    expect(wrapper.contains(EnterpriseAppSkeleton)).toBeTruthy();
  });

  it('redirects to /admin/register when user is authenticated but has no JWT roles', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: [],
    });
    const history = createMemoryHistory({
      initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
    });

    mount(<UserActivationPageWrapper history={history} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register`;
    expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectRoute);
  });

  it('displays loading skeleton when user is authenticated, has "enterprise_admin" JWT role, and is pending user hydration', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
    });

    const wrapper = mount(<UserActivationPageWrapper />);
    expect(wrapper.find(EnterpriseAppSkeleton).exists()).toBeTruthy();
  });

  it('displays an alert when user with unverified email is authenticated and has "enterprise_admin" JWT role', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
      isActive: false,
    });

    const wrapper = mount(<UserActivationPageWrapper />);
    expect(wrapper.find('Alert').exists()).toBeTruthy();
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

    mount(<UserActivationPageWrapper history={history} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/learners`;
    expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectRoute);
  });
});
