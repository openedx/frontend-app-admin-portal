import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { act, render, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom/extend-expect';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import DownloadCsvButton from '../DownloadCSVButton';
import { downloadCsv } from '../../../utils';
import EVENT_NAMES from '../../../eventTracking';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('file-saver', () => ({
  ...jest.requireActual('file-saver'),
  saveAs: jest.fn(),
}));

jest.mock('../../../utils', () => ({
  downloadCsv: jest.fn(),
  getTimeStampedFilename: (suffix) => `2024-01-20-${suffix}`,
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

const mockData = {
  results: [
    {
      enterprise_customer_user: {
        email: 'a@letter.com',
        joined_org: 'Apr 07, 2024',
        name: 'A',
      },
      enrollments: 3,
    },
    {
      enterprise_customer_user: {
        email: 'b@letter.com',
        joined_org: 'Apr 08, 2024',
        name: 'B',
      },
      enrollments: 4,
    },
  ],
};

const testId = 'test-id-1';
const DEFAULT_PROPS = {
  totalCt: mockData.results.length,
  fetchData: jest.fn(() => Promise.resolve(mockData)),
  testId,
};
const enterpriseId = 'test-enterprise-id';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const DownloadCSVButtonWrapper = props => (
  <Provider store={store}>
    <IntlProvider locale="en">
      <DownloadCsvButton {...props} />
    </IntlProvider>
  </Provider>
);

describe('DownloadCSVButton', () => {
  const flushPromises = () => new Promise(setImmediate);

  it('renders download csv button correctly.', async () => {
    render(<DownloadCSVButtonWrapper {...DEFAULT_PROPS} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();

    // Validate button text
    expect(screen.getByText('Download all (2)')).toBeInTheDocument();

    // Click the download button.
    screen.getByTestId(testId).click();
    await flushPromises();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseId,
      EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_ALL_ORG_MEMBERS,
      { status: 'success' },
    );
    expect(DEFAULT_PROPS.fetchData).toHaveBeenCalled();
    const expectedFileName = '2024-01-20-people-report.csv';
    const expectedHeaders = ['Name', 'Email', 'Joined Organization', 'Enrollments'];
    expect(downloadCsv).toHaveBeenCalledWith(expectedFileName, mockData.results, expectedHeaders, expect.any(Function));
  });
  it('download button should handle error returned by the API endpoint.', async () => {
    const props = {
      ...DEFAULT_PROPS,
      fetchData: jest.fn(() => Promise.reject(new Error('Error fetching data'))),
    };
    render(<DownloadCSVButtonWrapper {...props} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();

    act(() => {
      // Click the download button.
      userEvent.click(screen.getByTestId(testId));
    });

    await flushPromises();

    expect(DEFAULT_PROPS.fetchData).toHaveBeenCalled();
    expect(logError).toHaveBeenCalled();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseId,
      EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_ALL_ORG_MEMBERS,
      {
        status: 'error',
        message: new Error('Error fetching data'),
      },
    );
  });
});
