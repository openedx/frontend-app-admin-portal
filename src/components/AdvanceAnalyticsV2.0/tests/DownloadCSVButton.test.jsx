import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveAs } from 'file-saver';
import DownloadCSVButton from '../DownloadCSVButton';
import '@testing-library/jest-dom/extend-expect';

jest.mock('file-saver', () => ({
  ...jest.requireActual('file-saver'),
  saveAs: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));
const mockJsonData = [
  { date: '2024-01-01', count: 10, enroll_type: 'verified' },
  { date: '2024-01-02', count: 20, enroll_type: 'certificate' },
  { date: '2024-01-03', count: 30, enroll_type: 'verified' },
  { date: '2024-01-04', count: 40, enroll_type: 'audit' },
  { date: '2024-01-05', count: 50, enroll_type: 'verified' },
  { date: '2024-01-06', count: 60, enroll_type: 'verified' },
  { date: '2024-01-07', count: 70, enroll_type: 'certificate' },
  { date: '2024-01-08', count: 80, enroll_type: 'verified' },
  { date: '2024-01-09', count: 90, enroll_type: 'certificate' },
  { date: '2024-01-10', count: 100, enroll_type: 'certificate' },
];
let mockJsonAsCSV = 'date,count,enroll_type\n';
for (let i = 0; i < mockJsonData.length; i++) {
  mockJsonAsCSV += `${mockJsonData[i].date},${mockJsonData[i].count},${mockJsonData[i].enroll_type}\n`;
}

const mockTrackCsvDownloadClick = jest.fn();

const DEFAULT_PROPS = {
  jsonData: mockJsonData,
  csvFileName: 'completions.csv',
  entityId: 'test-entity',
  trackCsvDownloadClick: mockTrackCsvDownloadClick,
};

describe('DownloadCSVButton', () => {
  it('renders download csv button correctly', async () => {
    render(
      <IntlProvider locale="en">
        <DownloadCSVButton {...DEFAULT_PROPS} />
      </IntlProvider>,
    );

    expect(screen.getByTestId('plotly-charts-download-csv-button')).toBeInTheDocument();
  });

  it('handles successful CSV download and calls tracking', async () => {
    const user = userEvent.setup();
    render(
      <IntlProvider locale="en">
        <DownloadCSVButton {...DEFAULT_PROPS} />
      </IntlProvider>,
    );

    // Click the download button.
    await user.click(screen.getByTestId('plotly-charts-download-csv-button'));

    expect(saveAs).toHaveBeenCalledWith(
      new Blob([mockJsonAsCSV], { type: 'text/csv' }),
      'completions.csv',
    );

    expect(mockTrackCsvDownloadClick).toHaveBeenCalledWith('test-entity');
  });
});
