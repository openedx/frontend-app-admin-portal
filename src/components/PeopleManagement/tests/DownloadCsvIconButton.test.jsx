import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';

import userEvent from '@testing-library/user-event';
import DownloadCsvIconButton from '../GroupDetailPage/DownloadCsvIconButton';
import { downloadCsv } from '../../../utils';

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

const DownloadCsvIconButtonWrapper = props => (
  <IntlProvider locale="en">
    <DownloadCsvIconButton {...props} />
  </IntlProvider>
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
  });
});
