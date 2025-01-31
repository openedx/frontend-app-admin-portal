import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom/extend-expect';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import DownloadCsvIconButton from '../GroupDetailPage/DownloadCsvIconButton';
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
  getTimeStampedFilename: (suffix) => `2024-04-20-${suffix}`,
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

const mockData = {
  results: [
    {
      memberDetails: {
        userEmail: 'ga-linda@oz.com',
        userName: 'Galinda Upland',
      },
      recentAction: 'Accepted: January 06, 2021',
      enrollments: 0,
    },
    {
      memberDetails: {
        userEmail: 'elphaba@oz.com',
        userName: 'Elphaba Throppe',
      },
      recentAction: 'Accepted: January 05, 2021',
      enrollments: 3,
    },
  ],
};

const testId = 'test-id-1';
const DEFAULT_PROPS = {
  fetchAllData: jest.fn(() => Promise.resolve(mockData)),
  dataCount: mockData.results.length,
  testId,
  groupName: 'Enterprise',
  tableInstance: {
    state: {
      selectedRowIds: {},
    },
  },
};
const enterpriseId = 'test-enterprise-id';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const DownloadCsvIconButtonWrapper = props => (
  <Provider store={store}>
    <IntlProvider locale="en">
      <DownloadCsvIconButton {...props} />
    </IntlProvider>
  </Provider>
);

describe('DownloadCsvIconButton', () => {
  const flushPromises = () => new Promise(setImmediate);

  it('renders download csv button correctly.', async () => {
    render(<DownloadCsvIconButtonWrapper {...DEFAULT_PROPS} />);
    const downloadIcon = screen.getByTestId(testId);
    expect(downloadIcon).toBeInTheDocument();

    // show download tooltip
    act(() => {
      fireEvent.mouseOver(downloadIcon);
    });
    await waitFor(() => {
      expect(screen.getByText('Download all (2)')).toBeInTheDocument();
    });

    // Click the download button
    screen.getByTestId(testId).click();
    await flushPromises();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseId,
      EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_GROUP_MEMBERS,
      { status: 'success' },
    );
    expect(DEFAULT_PROPS.fetchAllData).toHaveBeenCalled();
    const expectedFileName = '2024-04-20-Enterprise.csv';
    const expectedHeaders = ['Name', 'Email', 'Recent action', 'Enrollments'];
    expect(downloadCsv).toHaveBeenCalledWith(expectedFileName, mockData.results, expectedHeaders, expect.any(Function));
  });
  it('download button should handle error returned by the API endpoint.', async () => {
    const props = {
      ...DEFAULT_PROPS,
      fetchAllData: jest.fn(() => Promise.reject(new Error('Error fetching data'))),
    };
    render(<DownloadCsvIconButtonWrapper {...props} />);
    const downloadIcon = screen.getByTestId(testId);

    expect(downloadIcon).toBeInTheDocument();

    act(() => {
      userEvent.click(downloadIcon);
    });
    await flushPromises();

    expect(DEFAULT_PROPS.fetchAllData).toHaveBeenCalled();
    expect(logError).toHaveBeenCalled();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseId,
      EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_GROUP_MEMBERS,
      {
        status: 'error',
        message: new Error('Error fetching data'),
      },
    );
  });
  it('shows correct download text hover and csv content for singular selection', async () => {
    const props = {
      ...DEFAULT_PROPS,
      tableInstance: {
        state: {
          selectedRowIds: {
            'ga-linda@oz.com': true,
          },
        },
      },
    };
    render(<DownloadCsvIconButtonWrapper {...props} />);
    const downloadIcon = screen.getByTestId(testId);

    expect(downloadIcon).toBeInTheDocument();

    act(() => {
      fireEvent.mouseOver(downloadIcon);
    });
    await waitFor(() => {
      expect(screen.getByText('Download (1)')).toBeInTheDocument();
    });

    // Click the download button
    screen.getByTestId(testId).click();
    await flushPromises();

    expect(DEFAULT_PROPS.fetchAllData).toHaveBeenCalled();
    const expectedFileName = '2024-04-20-Enterprise.csv';
    const expectedHeaders = ['Name', 'Email', 'Recent action', 'Enrollments'];
    expect(downloadCsv).toHaveBeenCalledWith(
      expectedFileName,
      [mockData.results[0]],
      expectedHeaders,
      expect.any(Function),
    );
  });
  it('shows correct download text hover and csv content for all selection', async () => {
    const props = {
      ...DEFAULT_PROPS,
      tableInstance: {
        state: {
          selectedRowIds: {
            'ga-linda@oz.com': true,
            'elphaba@oz.com': true,
          },
        },
      },
    };
    render(<DownloadCsvIconButtonWrapper {...props} />);
    const downloadIcon = screen.getByTestId(testId);

    expect(downloadIcon).toBeInTheDocument();

    act(() => {
      fireEvent.mouseOver(downloadIcon);
    });
    await waitFor(() => {
      expect(screen.getByText('Download all (2)')).toBeInTheDocument();
    });

    // Click the download button
    screen.getByTestId(testId).click();
    await flushPromises();

    expect(DEFAULT_PROPS.fetchAllData).toHaveBeenCalled();
    const expectedFileName = '2024-04-20-Enterprise.csv';
    const expectedHeaders = ['Name', 'Email', 'Recent action', 'Enrollments'];
    expect(downloadCsv).toHaveBeenCalledWith(expectedFileName, mockData.results, expectedHeaders, expect.any(Function));
  });
});
