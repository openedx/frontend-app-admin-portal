import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import {
  MemoryRouter, Routes, Route, mockNavigate,
} from 'react-router-dom';
import { getAuthenticatedUser, hydrateAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  isEnterpriseUser, ENTERPRISE_ADMIN, ENTERPRISE_OPENEDX_OPERATOR,
} from '@2uinc/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import AdminRegisterPage from './index';
import LmsApiService from '../../data/services/LmsApiService';
import { getEnterpriseAdminRegisterLogoutUrl } from '../../utils';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

jest.mock('../../data/services/LmsApiService');
jest.mock('@2uinc/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@2uinc/frontend-enterprise-utils'),
  isEnterpriseUser: jest.fn(),
}));
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  getEnterpriseAdminRegisterLogoutUrl: jest.fn(),
}));

const FAKE_LOGOUT_URL = (slug, params) => {
  const search = params
    ? `?${Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')}`
    : '';
  return `https://lms.example.com/logout?next=https%3A%2F%2Fportal.example.com%2F${slug}%2Fadmin%2Fregister${encodeURIComponent(search)}`;
};

const TEST_ENTERPRISE_SLUG = 'test-enterprise';
const TEST_ENTERPRISE_UUID = 'dc3bfcf8-c61f-11ec-9d64-0242ac120002';

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

const AdminRegisterPageWrapper = ({
  search = '',
  ...rest
}) => (
  <MemoryRouter initialEntries={[`/${TEST_ENTERPRISE_SLUG}/admin/register${search}`]}>
    <IntlProvider locale="en">
      <Routes>
        <Route
          path="/:enterpriseSlug/admin/register"
          element={<AdminRegisterPage {...rest} />}
        />
      </Routes>
    </IntlProvider>
  </MemoryRouter>
);

describe('<AdminRegisterPage />', () => {
  beforeEach(() => {
    // Use clearAllMocks (call history) rather than resetAllMocks (implementations),
    // because resetAllMocks wipes the jest-localstorage-mock impls that back
    // session/localStorage in tests.
    jest.clearAllMocks();
    LmsApiService.loginRefresh.mockResolvedValue({ data: { userId: 1 } });
    hydrateAuthenticatedUser.mockResolvedValue();
    getEnterpriseAdminRegisterLogoutUrl.mockImplementation(FAKE_LOGOUT_URL);
    sessionStorage.clear();
  });

  it('has no accessibility violations', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    isEnterpriseUser.mockReturnValue(false);
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({
      data: { uuid: TEST_ENTERPRISE_UUID },
    });
    const { container } = render(<AdminRegisterPageWrapper />);
    await screen.findByRole('alert');
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders LoginRedirect skeleton when not authenticated', async () => {
    getAuthenticatedUser.mockReturnValue(null);
    render(<AdminRegisterPageWrapper />);
    const appSkeleton = await screen.findByTestId('enterprise-app-skeleton');
    expect(appSkeleton).toBeInTheDocument();
    expect(LmsApiService.loginRefresh).not.toHaveBeenCalled();
  });

  it('refreshes JWT and hydrates user before checking admin role', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: ['enterprise_admin:*'] });
    isEnterpriseUser.mockReturnValue(true);
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({
      data: { uuid: TEST_ENTERPRISE_UUID },
    });
    render(<AdminRegisterPageWrapper />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    expect(LmsApiService.loginRefresh).toHaveBeenCalled();
    expect(hydrateAuthenticatedUser).toHaveBeenCalled();
    expect(isEnterpriseUser).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'edx' }),
      ENTERPRISE_ADMIN,
      TEST_ENTERPRISE_UUID,
    );
  });

  it('redirects to /admin/register/activate when user has "enterprise_admin" JWT role for this enterprise', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [`enterprise_admin:${TEST_ENTERPRISE_UUID}`] });
    isEnterpriseUser.mockImplementation((_user, role) => role === ENTERPRISE_ADMIN);
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({
      data: { uuid: TEST_ENTERPRISE_UUID },
    });
    render(<AdminRegisterPageWrapper />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register/activate`;
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectRoute));
  });

  it('redirects to /admin/register/activate when user has "enterprise_openedx_operator" JWT role (wildcard)', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: ['enterprise_openedx_operator:*'] });
    // Operator check is called without enterpriseUUID — return true only for that call.
    isEnterpriseUser.mockImplementation((_user, role, uuid) => (
      role === ENTERPRISE_OPENEDX_OPERATOR && uuid === undefined
    ));
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({
      data: { uuid: TEST_ENTERPRISE_UUID },
    });
    render(<AdminRegisterPageWrapper />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register/activate`;
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectRoute));
    expect(isEnterpriseUser).toHaveBeenCalledWith(
      expect.any(Object),
      ENTERPRISE_OPENEDX_OPERATOR,
    );
  });

  it('renders a terminal warning alert when authenticated user is neither admin nor operator (no proxy bounce)', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: ['enterprise_learner:*'] });
    isEnterpriseUser.mockReturnValue(false);
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({
      data: { uuid: TEST_ENTERPRISE_UUID },
    });
    render(<AdminRegisterPageWrapper />);
    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/administrator access/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders an error alert when loginRefresh fails', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    LmsApiService.loginRefresh.mockRejectedValue(new Error('network'));
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({
      data: { uuid: TEST_ENTERPRISE_UUID },
    });
    render(<AdminRegisterPageWrapper />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/something went wrong/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders an error alert when fetchEnterpriseBySlug fails', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    LmsApiService.fetchEnterpriseBySlug.mockRejectedValue(new Error('network'));
    render(<AdminRegisterPageWrapper />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/something went wrong/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders an error alert when enterprise lookup returns no uuid', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({ data: {} });
    render(<AdminRegisterPageWrapper />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/something went wrong/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('error alert offers a sign-in-again link pointing at the enterprise logout URL', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    LmsApiService.fetchEnterpriseBySlug.mockRejectedValue(new Error('network'));
    render(<AdminRegisterPageWrapper />);
    await screen.findByRole('alert');
    const signInLink = screen.getByRole('link', { name: /signing in again/i });
    expect(getEnterpriseAdminRegisterLogoutUrl).toHaveBeenCalledWith(TEST_ENTERPRISE_SLUG);
    expect(signInLink).toHaveAttribute('href', FAKE_LOGOUT_URL(TEST_ENTERPRISE_SLUG));
  });

  // Note: jsdom doesn't actually navigate when global.location.href is set,
  // so these tests assert the intent (the logout URL builder is invoked with
  // the pending-invited-admin param, plus the session flag is set) rather
  // than the navigation itself.
  it('bounces a pending invited admin via the logout URL when fetchEnterpriseBySlug returns no uuid', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    isEnterpriseUser.mockReturnValue(false);
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({ data: {} });
    render(<AdminRegisterPageWrapper search="?pending-invited-admin=true" />);
    await waitFor(() => expect(getEnterpriseAdminRegisterLogoutUrl).toHaveBeenCalledWith(
      TEST_ENTERPRISE_SLUG,
      { 'pending-invited-admin': 'true' },
    ));
    expect(sessionStorage.getItem(`admin_register_proxy_login_attempted_${TEST_ENTERPRISE_SLUG}`)).toBe('true');
  });

  it('bounces a pending invited admin via the logout URL when fetchEnterpriseBySlug throws', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    isEnterpriseUser.mockReturnValue(false);
    LmsApiService.fetchEnterpriseBySlug.mockRejectedValue(new Error('network'));
    render(<AdminRegisterPageWrapper search="?pending-invited-admin=true" />);
    await waitFor(() => expect(getEnterpriseAdminRegisterLogoutUrl).toHaveBeenCalledWith(
      TEST_ENTERPRISE_SLUG,
      { 'pending-invited-admin': 'true' },
    ));
    expect(sessionStorage.getItem(`admin_register_proxy_login_attempted_${TEST_ENTERPRISE_SLUG}`)).toBe('true');
  });

  it('bounces a pending invited admin via the logout URL when authenticated user has no role', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    isEnterpriseUser.mockReturnValue(false);
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({
      data: { uuid: TEST_ENTERPRISE_UUID },
    });
    render(<AdminRegisterPageWrapper search="?pending-invited-admin=true" />);
    await waitFor(() => expect(getEnterpriseAdminRegisterLogoutUrl).toHaveBeenCalledWith(
      TEST_ENTERPRISE_SLUG,
      { 'pending-invited-admin': 'true' },
    ));
    expect(sessionStorage.getItem(`admin_register_proxy_login_attempted_${TEST_ENTERPRISE_SLUG}`)).toBe('true');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not bounce a second time once the session flag is set', async () => {
    sessionStorage.setItem(`admin_register_proxy_login_attempted_${TEST_ENTERPRISE_SLUG}`, 'true');
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    isEnterpriseUser.mockReturnValue(false);
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({
      data: { uuid: TEST_ENTERPRISE_UUID },
    });
    render(<AdminRegisterPageWrapper search="?pending-invited-admin=true" />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/administrator access/i);
    // No-admin-access branch doesn't render the error sign-in link, so the
    // helper should not be invoked at all in this path.
    expect(getEnterpriseAdminRegisterLogoutUrl).not.toHaveBeenCalled();
  });

  it('does not bounce when the pending-invited-admin param is absent', async () => {
    getAuthenticatedUser.mockReturnValue({ username: 'edx', roles: [] });
    isEnterpriseUser.mockReturnValue(false);
    LmsApiService.fetchEnterpriseBySlug.mockResolvedValue({
      data: { uuid: TEST_ENTERPRISE_UUID },
    });
    render(<AdminRegisterPageWrapper />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/administrator access/i);
    expect(getEnterpriseAdminRegisterLogoutUrl).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(`admin_register_proxy_login_attempted_${TEST_ENTERPRISE_SLUG}`)).toBeNull();
  });
});
