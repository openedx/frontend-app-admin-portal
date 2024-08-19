import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveAs } from 'file-saver';
import { logError } from '@edx/frontend-platform/logging';
import DownloadCSV from '../DownloadCSV';
import '@testing-library/jest-dom/extend-expect';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';

jest.mock('file-saver', () => ({
  ...jest.requireActual('file-saver'),
  saveAs: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

jest.mock('../../../data/services/EnterpriseDataApiService', () => ({
  fetchPlotlyChartsCSV: jest.fn(),
}));

const DEFAULT_PROPS = {
  startDate: '2021-01-01',
  endDate: '2025-01-31',
  chartType: 'completions-over-time',
  activeTab: 'completions',
  granularity: 'Daily',
  calculation: 'Total',
  enterpriseId: 'test_enterprise_id',
};
describe('DownloadCSV', () => {
  const flushPromises = () => new Promise(setImmediate);

  it('renders download csv button correctly', async () => {
    render(
      <IntlProvider locale="en">
        <DownloadCSV {...DEFAULT_PROPS} />
      </IntlProvider>,
    );

    expect(screen.getByTestId('plotly-charts-download-csv-button')).toBeInTheDocument();
  });

  it('handles successful CSV download', async () => {
    const mockResponse = {
      headers: {
        'content-disposition': 'attachment; filename="completions.csv"',
      },
      data: 'CSV data',
    };
    EnterpriseDataApiService.fetchPlotlyChartsCSV.mockResolvedValueOnce(mockResponse);

    render(
      <IntlProvider locale="en">
        <DownloadCSV {...DEFAULT_PROPS} />
      </IntlProvider>,
    );

    // Click the download button.
    userEvent.click(screen.getByTestId('plotly-charts-download-csv-button'));
    await flushPromises();

    expect(saveAs).toHaveBeenCalledWith(
      new Blob([mockResponse.data], { type: 'text/csv' }),
      'completions.csv',
    );
  });

  it('handles error during CSV download', async () => {
    const mockError = new Error('Failed to download CSV');
    EnterpriseDataApiService.fetchPlotlyChartsCSV.mockRejectedValueOnce(mockError);

    render(
      <IntlProvider locale="en">
        <DownloadCSV {...DEFAULT_PROPS} />
      </IntlProvider>,
    );

    // Click the download button.
    userEvent.click(screen.getByTestId('plotly-charts-download-csv-button'));
    await flushPromises();

    expect(logError).toHaveBeenCalledWith(mockError);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
