import React from 'react';
import {
  MemoryRouter, Routes, Route,
} from 'react-router-dom';
import { waitFor, render, screen } from '@testing-library/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { isEnterpriseUser } from '@edx/frontend-enterprise-utils';

import AdminRegisterPage from './index';
import LmsApiService from '../../data/services/LmsApiService';

jest.mock('../../data/services/LmsApiService');
jest.mock('@edx/frontend-enterprise-utils');

const TEST_ENTERPRISE_SLUG = 'test-enterprise';

const mockEnterpriseCustomer = {
  uuid: 'dc3bfcf8-c61f-11ec-9d64-0242ac120002',
};

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const AdminRegisterPageWrapper = ({
  ...rest
}) => (
  <MemoryRouter initialEntries={[`/${TEST_ENTERPRISE_SLUG}/admin/register`]}>
    <Routes>
      <Route
        path="/:enterpriseSlug/admin/register"
        element={<AdminRegisterPage {...rest} />}
      />
    </Routes>
  </MemoryRouter>
);

describe('<AdminRegisterPage />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders loading skeleton when not authenticated (redirect to enterprise proxy login)', async () => {
    getAuthenticatedUser.mockReturnValue(null);
    isEnterpriseUser.mockReturnValue(false);
    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: mockEnterpriseCustomer,
    }));
    render(<AdminRegisterPageWrapper />);

    // verify that the loading skeleton appears during redirect
    await waitFor(() => expect(screen.getByText('Loading...')).toBeTruthy());
    await waitFor(() => expect(global.location.href).toBeTruthy());
  });

  [
    { roles: [] },
    { roles: ['enterprise_learner:*'] },
  ].forEach(({ roles }) => {
    it('displays app skeleton when user is authenticated without "enterprise_admin" JWT role', async () => {
      getAuthenticatedUser.mockReturnValue({
        username: 'edx',
        roles,
      });
      isEnterpriseUser.mockReturnValue(false);
      LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
        data: mockEnterpriseCustomer,
      }));
      render(<AdminRegisterPageWrapper />);
      await waitFor(() => expect(screen.getByText('Loading...')).toBeTruthy());
    });
  });

  it('redirects to /admin/register/activate route when user is authenticated and has "enterprise_admin" JWT role', async () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:dc3bfcf8-c61f-11ec-9d64-0242ac120002'],
    });
    isEnterpriseUser.mockReturnValue(true);
    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: mockEnterpriseCustomer,
    }));
    render(<AdminRegisterPageWrapper />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register/activate`;
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectRoute));
  });
});
