import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

import { act } from '@testing-library/react';

import BulkEnrollmentResultsDownloadPage from './index';

import LicenseManagerApiService from '../../data/services/LicenseManagerAPIService';

const mockStore = configureMockStore([thunk]);

const TEST_ENTERPRISE_SLUG = 'test-enterprise';
const TEST_BULK_ENROLLMENT_UUID = '12345678-9012-3456-7890-123456789012';

const initialHistory = createMemoryHistory({
  initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/bulk-enrollment-results/${TEST_BULK_ENROLLMENT_UUID}`],
});

jest.mock('../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    fetchBulkEnrollmentJob: jest.fn(),
  },
}));

const BulkEnrollmentResultsDownloadPageWrapper = ({
  history,
  ...rest
}) => (
  <Provider store={mockStore({ portalConfiguration: { enterpriseId: '1234' } })}>
    <Router history={history}>
      <Route
        exact
        path="/:enterpriseSlug/admin/bulk-enrollment-results/:bulkEnrollmentJobId"
        render={routeProps => <BulkEnrollmentResultsDownloadPage {...routeProps} {...rest} />}
      />
    </Router>
  </Provider>
);

BulkEnrollmentResultsDownloadPageWrapper.defaultProps = {
  history: initialHistory,
};

BulkEnrollmentResultsDownloadPageWrapper.propTypes = {
  history: PropTypes.shape(),
};

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
      mount(<BulkEnrollmentResultsDownloadPageWrapper history={history} />);
    });
    await act(() => mockPromiseResolve);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/bulk-enrollment-results/${TEST_BULK_ENROLLMENT_UUID}`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
    expect(window.location.href).toEqual('https://example.com/download');
  });
});
