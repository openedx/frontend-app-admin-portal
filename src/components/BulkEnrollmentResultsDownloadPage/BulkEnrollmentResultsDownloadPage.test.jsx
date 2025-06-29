import React from 'react';
import { render, act } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import BulkEnrollmentResultsDownloadPage from './index';

import LicenseManagerApiService from '../../data/services/LicenseManagerAPIService';

const mockStore = configureMockStore([thunk]);

const TEST_ENTERPRISE_SLUG = 'test-enterprise';
const TEST_BULK_ENROLLMENT_UUID = '12345678-9012-3456-7890-123456789012';

jest.mock('../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    fetchBulkEnrollmentJob: jest.fn(),
  },
}));

const BulkEnrollmentResultsDownloadPageWrapper = ({
  ...rest
}) => (
  <Provider store={mockStore({ portalConfiguration: { enterpriseId: '1234' } })}>
    <IntlProvider locale="en">
      <Router initialEntries={[`/${TEST_ENTERPRISE_SLUG}/admin/bulk-enrollment-results/${TEST_BULK_ENROLLMENT_UUID}`]}>
        <Routes>
          <Route
            path="/:enterpriseSlug/admin/bulk-enrollment-results/:bulkEnrollmentJobId"
            element={<BulkEnrollmentResultsDownloadPage {...rest} />}
          />
        </Routes>
      </Router>
    </IntlProvider>
  </Provider>
);

const assignMock = jest.fn();
delete global.location;
global.location = { href: assignMock };

describe('<BulkEnrollmentResultsDownloadPage />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    assignMock.mockClear();
  });

  it('redirects test', async () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
      isActive: true,
    });

    const mockPromiseResolve = Promise.resolve({ data: { jobId: TEST_BULK_ENROLLMENT_UUID, downloadUrl: 'https://example.com/download' } });
    LicenseManagerApiService.fetchBulkEnrollmentJob.mockReturnValue(mockPromiseResolve);

    const history = createMemoryHistory({
      initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/bulk-enrollment-results/${TEST_BULK_ENROLLMENT_UUID}`],
    });
    await act(async () => {
      render(<BulkEnrollmentResultsDownloadPageWrapper />);
    });
    await act(() => mockPromiseResolve);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/bulk-enrollment-results/${TEST_BULK_ENROLLMENT_UUID}`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
    expect(window.location.href).toEqual('https://example.com/download');
  });
});
