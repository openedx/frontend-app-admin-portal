import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { render, screen } from '@testing-library/react';
import { saveAs } from 'file-saver';

import '@testing-library/jest-dom/extend-expect';

import userEvent from '@testing-library/user-event';
import DownloadCSVButton from './DownloadCSVButton';

jest.mock('file-saver', () => ({
  ...jest.requireActual('file-saver'),
  saveAs: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

const getMockData = ({ count }) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      module_performance_unique_id: i,
      username: `Email ${i}`,
      course_name: `Course ${i}`,
      module_name: `Module ${i}`,
      module_grade: `Module Grade ${i}`,
      percentage_completed_activities: `${(i % 100)}%`,
      hours_online: `${i} Hours Online`,
      log_viewed: `${i} Log Views`,
    });
  }
  return data;
};

const DEFAULT_PROPS = {
  data: getMockData({ count: 10 }),
  testId: 'test-id-1',
  fetchData: jest.fn(() => Promise.resolve({ data: 'name\ntest-csv-file' })),
};

const DownloadCSVButtonWrapper = props => (
  <IntlProvider locale="en">
    <DownloadCSVButton {...props} />
  </IntlProvider>
);

describe('DownloadCSVButton', () => {
  it('renders download csv button correctly.', async () => {
    const user = userEvent.setup();
    render(<DownloadCSVButtonWrapper {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('test-id-1')).toBeInTheDocument();

    // Click the download button.
    await user.click(screen.getByTestId('test-id-1'));

    expect(DEFAULT_PROPS.fetchData).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });
  it('download button should handle error returned by the API endpoint.', async () => {
    const user = userEvent.setup();
    const props = {
      ...DEFAULT_PROPS,
      fetchData: jest.fn(() => Promise.reject(new Error('Error fetching data'))),
    };
    render(<DownloadCSVButtonWrapper {...props} />);
    expect(screen.getByTestId('test-id-1')).toBeInTheDocument();

    // Click the download button.
    await user.click(screen.getByTestId('test-id-1'));

    expect(DEFAULT_PROPS.fetchData).toHaveBeenCalled();
    expect(logError).toHaveBeenCalled();
  });
});
