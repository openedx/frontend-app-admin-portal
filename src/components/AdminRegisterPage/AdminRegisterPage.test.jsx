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
import { accessibilitySettings } from '../../../tests/accessibility-settings';

jest.mock('../../data/services/LmsApiService');
jest.mock('@2uinc/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@2uinc/frontend-enterprise-utils'),
  isEnterpriseUser: jest.fn(),
}));

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
  ...rest
}) => (
  <MemoryRouter initialEntries={[`/${TEST_ENTERPRISE_SLUG}/admin/register`]}>
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
    jest.resetAllMocks();
    LmsApiService.loginRefresh.mockResolvedValue({ data: { userId: 1 } });
    hydrateAuthenticatedUser.mockResolvedValue();
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
});
