import React from 'react';
import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@2uinc/frontend-enterprise-utils';

import { axe } from 'jest-axe';
import DownloadAdminsCsvIconButton from '../DownloadAdminsCsvIconButton';
import { downloadCsv } from '../../../utils';
import EVENT_NAMES from '../../../eventTracking';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

jest.mock('@2uinc/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@2uinc/frontend-enterprise-utils');
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

jest.mock('../GeneralErrorModal', () => function GeneralErrorModal({ isOpen }) {
  if (!isOpen) { return null; }
  return <div data-testid="general-error-modal">Error Modal</div>;
});

const mockData = {
  results: [
    {
      name: null,
      email: 'test_user1@gmail.com',
      joinedDate: null,
      invitedDate: 'Jan 01, 2025',
      status: 'Pending',
    },
    {
      name: 'Rajesh',
      email: 'verified@example.com',
      joinedDate: 'Feb 17, 2026',
      invitedDate: null,
      status: 'admin',
    },
  ],
};

const testId = 'test-id-1';
const DEFAULT_PROPS = {
  fetchData: jest.fn(() => Promise.resolve(mockData)),
  dataCount: mockData.results.length,
  testId,
};

const enterpriseId = 'test-enterprise-id';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const DownloadAdminsCsvIconButtonWrapper = props => (
  <Provider store={store}>
    <IntlProvider locale="en">
      <DownloadAdminsCsvIconButton {...props} />
    </IntlProvider>
  </Provider>
);

describe('DownloadAdminsCsvIconButton', () => {
  const flushPromises = () => new Promise(setImmediate);

  beforeEach(() => {
    jest.clearAllMocks();
    DEFAULT_PROPS.fetchData.mockResolvedValue(mockData);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DownloadAdminsCsvIconButtonWrapper />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders download csv button correctly', () => {
    render(<DownloadAdminsCsvIconButtonWrapper {...DEFAULT_PROPS} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('shows correct tooltip with data count on hover', async () => {
    render(<DownloadAdminsCsvIconButtonWrapper {...DEFAULT_PROPS} />);
    const downloadIcon = screen.getByTestId(testId);

    act(() => {
      fireEvent.mouseOver(downloadIcon);
    });

    await waitFor(() => {
      expect(screen.getByText('Download all (2)')).toBeInTheDocument();
    });
  });

  it('disables the button when dataCount is 0', () => {
    render(<DownloadAdminsCsvIconButtonWrapper {...DEFAULT_PROPS} dataCount={0} />);
    expect(screen.getByTestId(testId)).toBeDisabled();
  });

  it('calls fetchData and downloads CSV with correct filename and headers on click', async () => {
    render(<DownloadAdminsCsvIconButtonWrapper {...DEFAULT_PROPS} />);

    screen.getByTestId(testId).click();
    await flushPromises();

    expect(DEFAULT_PROPS.fetchData).toHaveBeenCalled();
    expect(downloadCsv).toHaveBeenCalledWith(
      '2024-04-20-admin-report.csv',
      mockData.results,
      ['Name', 'Email', 'Joined Org', 'Invited Date', 'Role'],
      expect.any(Function),
    );
  });

  it('sends success track event after successful download', async () => {
    render(<DownloadAdminsCsvIconButtonWrapper {...DEFAULT_PROPS} />);

    screen.getByTestId(testId).click();
    await flushPromises();

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseId,
      EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_ALL_ADMINS,
      { status: 'success' },
    );
  });

  it('shows success toast after download', async () => {
    render(<DownloadAdminsCsvIconButtonWrapper {...DEFAULT_PROPS} />);

    expect(screen.queryByText('Successfully downloaded')).not.toBeInTheDocument();

    screen.getByTestId(testId).click();
    await flushPromises();

    await waitFor(() => {
      expect(screen.getByText('Successfully downloaded')).toBeInTheDocument();
    });
  });

  it('handles API error and logs it', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Error fetching data');
    const props = {
      ...DEFAULT_PROPS,
      fetchData: jest.fn(() => Promise.reject(mockError)),
    };

    render(<DownloadAdminsCsvIconButtonWrapper {...props} />);

    await user.click(screen.getByTestId(testId));
    await flushPromises();

    expect(logError).toHaveBeenCalledWith(mockError);
    expect(downloadCsv).not.toHaveBeenCalled();
  });

  it('sends error track event on API failure', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Error fetching data');
    const props = {
      ...DEFAULT_PROPS,
      fetchData: jest.fn(() => Promise.reject(mockError)),
    };

    render(<DownloadAdminsCsvIconButtonWrapper {...props} />);

    await user.click(screen.getByTestId(testId));
    await flushPromises();

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseId,
      EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_ALL_ADMINS,
      { status: 'error', message: mockError },
    );
  });

  it('does not show toast on API error', async () => {
    const user = userEvent.setup();
    const props = {
      ...DEFAULT_PROPS,
      fetchData: jest.fn(() => Promise.reject(new Error('Error fetching data'))),
    };

    render(<DownloadAdminsCsvIconButtonWrapper {...props} />);

    await user.click(screen.getByTestId(testId));
    await flushPromises();

    expect(screen.queryByText('Successfully downloaded')).not.toBeInTheDocument();
  });

  it('opens error modal on API failure', async () => {
    const user = userEvent.setup();
    const props = {
      ...DEFAULT_PROPS,
      fetchData: jest.fn(() => Promise.reject(new Error('Error fetching data'))),
    };

    render(<DownloadAdminsCsvIconButtonWrapper {...props} />);

    expect(screen.queryByTestId('general-error-modal')).not.toBeInTheDocument();

    await user.click(screen.getByTestId(testId));
    await flushPromises();

    await waitFor(() => {
      expect(screen.getByTestId('general-error-modal')).toBeInTheDocument();
    });
  });

  it('maps data entries to correct CSV row format', async () => {
    render(<DownloadAdminsCsvIconButtonWrapper {...DEFAULT_PROPS} />);

    screen.getByTestId(testId).click();
    await flushPromises();

    const dataEntryToRowFn = downloadCsv.mock.calls[0][3];

    // Pending user — no joinedDate
    expect(dataEntryToRowFn(mockData.results[0])).toEqual([
      '', 'test_user1@gmail.com', '', 'Jan 01, 2025', 'Pending',
    ]);

    // Admin user — no invitedDate
    expect(dataEntryToRowFn(mockData.results[1])).toEqual([
      'Rajesh', 'verified@example.com', 'Feb 17, 2026', '', 'admin',
    ]);
  });
});
