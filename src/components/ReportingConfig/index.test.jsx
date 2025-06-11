import React from 'react';
import {
  render, screen, waitFor, act,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';

import ReportingConfig from './index';
import LmsApiService from '../../data/services/LmsApiService';

const defaultProps = {
  location: {
    state: { hasRequestedCodes: true },
  },
  match: { path: 'foobar' },
  history: { replace: jest.fn() },
  enterpriseId: 'enterpriseFoobar',
};
const mockIntl = {
  formatMessage: message => message.defaultMessage,
};
const reportingConfigTypes = {
  deliveryMethod: [
    [
      'email',
      'email',
    ],
    [
      'sftp',
      'sftp',
    ],
  ],
  dataType: [
    [
      'catalog',
      'catalog',
    ],
    [
      'engagement',
      'engagement',
    ],
    [
      'progress_v3',
      'progress',
    ],
  ],
  reportType: [
    [
      'csv',
      'csv',
    ],
    [
      'json',
      'json',
    ],
  ],
  frequency: [
    [
      'daily',
      'daily',
    ],
    [
      'monthly',
      'monthly',
    ],
    [
      'weekly',
      'weekly',
    ],
  ],
  dayOfWeek: [
    [
      0,
      'Monday',
    ],
    [
      1,
      'Tuesday',
    ],
    [
      2,
      'Wednesday',
    ],
    [
      3,
      'Thursday',
    ],
    [
      4,
      'Friday',
    ],
    [
      5,
      'Saturday',
    ],
    [
      6,
      'Sunday',
    ],
  ],
};

const mockConfigsData = {
  data: {
    results: [{
      enterpriseCustomerId: 'test-customer-uuid',
      active: true,
      delivery_method: 'email',
      email: ['test_email@example.com'],
      emailRaw: 'test_email@example.com',
      frequency: 'monthly',
      dayOfMonth: 1,
      dayOfWeek: null,
      hourOfDay: 1,
      sftpHostname: '',
      sftpPort: null,
      sftpUsername: '',
      sftpFilePath: '',
      dataType: 'progress_v3',
      data_type: 'csv',
      pgpEncryptionKey: '',
      uuid: 'test-config-uuid',
      enterpriseCustomerCatalogs: [{
        uuid: 'test-enterprise-customer-catalog',
        title: 'All Content',
      }],
      encryptedPassword: '#$dsfrtga@',
    }],
  },
};

// Mocking the LMSApiService.deleteReportingConfig function
jest.mock('../../data/services/LmsApiService', () => ({
  fetchReportingConfigs: jest.fn().mockResolvedValue({
    data: {
      results: [{
        enterpriseCustomerId: 'test-customer-uuid',
        active: true,
        delivery_method: 'email',
        email: ['test_email@example.com'],
        emailRaw: 'test_email@example.com',
        frequency: 'monthly',
        dayOfMonth: 1,
        dayOfWeek: null,
        hourOfDay: 1,
        sftpHostname: '',
        sftpPort: null,
        sftpUsername: '',
        sftpFilePath: '',
        dataType: 'progress_v3',
        data_type: 'csv',
        pgpEncryptionKey: '',
        uuid: 'test-config-uuid',
        enterpriseCustomerCatalogs: [{
          uuid: 'test-enterprise-customer-catalog',
          title: 'All Content',
        }],
        encryptedPassword: '#$dsfrtga@',
      }],
    },
  }),
  deleteReportingConfig: jest.fn().mockResolvedValue(undefined),
  fetchReportingConfigTypes: jest.fn().mockResolvedValue({ data: reportingConfigTypes }),
}));

jest.mock('../../data/services/EnterpriseCatalogApiService', () => ({
  fetchEnterpriseCustomerCatalogs: jest.fn().mockResolvedValue({ data: { results: [] } }),
}));

// TODO: fix it.skips
describe('<ReportingConfig />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it.skip('calls deleteConfig function on button click', async () => {
    const user = userEvent.setup();
    render(
      <IntlProvider locale="en">
        <ReportingConfig {...defaultProps} intl={mockIntl} />
      </IntlProvider>,
    );

    const configUuidToDelete = 'test-config-uuid';
    await waitFor(() => {
      expect(screen.queryByTestId('loading-message')).not.toBeInTheDocument();
    });

    // Find the collapsible component and set its "isOpen" prop to true
    const collapsibleTrigger = screen.getByTestId('collapsible-trigger-reporting-config');
    await user.click(collapsibleTrigger);
    // Find the delete button using its data-testid and simulate a click event
    const deleteButton = await screen.findByTestId('deleteConfigButton');
    expect(deleteButton).toBeInTheDocument(); // Ensure the button exists
    await user.click(deleteButton);
    // // Verify that the deleteConfig function was called with the correct UUID
    expect(LmsApiService.deleteReportingConfig).toHaveBeenCalledWith(configUuidToDelete);
    // TODO: delete button in still in the document, need to investigate
    // const afterClickingDeleteButton = await screen.findByTestId('deleteConfigButton');
    // expect(afterClickingDeleteButton).not.toBeInTheDocument();
  });
  it.skip('handles fetchReportingConfigs failure gracefully after deleting a record', async () => {
    const user = userEvent.setup();
    // Mock fetchReportingConfigs to return a valid response once
    LmsApiService.fetchReportingConfigs = jest.fn().mockResolvedValueOnce(mockConfigsData).mockRejectedValueOnce(new Error('Failed to fetch reporting configs'));

    render(
      <IntlProvider locale="en">
        <ReportingConfig {...defaultProps} intl={mockIntl} />
      </IntlProvider>,
    );

    const configUuidToDelete = 'test-config-uuid';
    // Update the wrapper after the state changes and should be in loading state
    await waitFor(() => {
      expect(screen.queryByTestId('loading-message')).not.toBeInTheDocument();
    });

    // Find the collapsible component and set its "isOpen" prop to true
    const collapsibleTrigger = screen.getByTestId('collapsible-trigger-reporting-config');
    await user.click(collapsibleTrigger);
    // Find the delete button using its data-testid and simulate a click event
    const deleteButton = await screen.findByTestId('deleteConfigButton');
    expect(deleteButton).toBeInTheDocument(); // Ensure the button exists
    await user.click(deleteButton);

    // Verify that the deleteConfig function was called with the correct UUID
    expect(LmsApiService.deleteReportingConfig).toHaveBeenCalledWith(configUuidToDelete);

    const afterClickingDeleteButton = await screen.findByTestId('deleteConfigButton');
    expect(afterClickingDeleteButton).not.toBeInTheDocument();

    // Check for error handling
    const errorMessage = await screen.findByTestId('error-page');
    expect(errorMessage).toBeInTheDocument();
  });
  it('should not render Pagination when reportingConfigs is empty', async () => {
    LmsApiService.fetchReportingConfigs.mockResolvedValue({
      data: {
        results: [],
        count: 0,
        num_pages: 0,
      },
    });

    let wrapper;
    await act(async () => {
      const { container } = render(
        <IntlProvider locale="en">
          <ReportingConfig {...defaultProps} intl={mockIntl} />
        </IntlProvider>,
      );
      wrapper = container;
    });

    // Check that Pagination component is not rendered when no configs
    const paginationComponent = wrapper.querySelectorAll('[class*="pagination-"]')?.[0] || null;
    expect(paginationComponent).not.toBeInTheDocument();
  });
  it('should render Pagination when reportingConfigs has items', async () => {
    let wrapper;

    LmsApiService.fetchReportingConfigs.mockResolvedValue({
      data: {
        results: [{
          enterpriseCustomerId: 'test-customer-uuid',
          active: true,
          delivery_method: 'email',
          uuid: 'test-config-uuid',
        }],
        count: 1,
        num_pages: 1,
      },
    });

    await act(async () => {
      const { container } = render(
        <IntlProvider locale="en">
          <ReportingConfig {...defaultProps} intl={mockIntl} />
        </IntlProvider>,
      );
      wrapper = container;
    });

    // Check that Pagination component is rendered when configs exist
    const paginationComponent = wrapper.querySelectorAll('[class*="pagination-"]')?.[0] || null;
    expect(paginationComponent).toBeInTheDocument();
  });
  it.skip('calls createConfig function and handles new configuration creation', async () => {
    const user = userEvent.setup();
    // Mock the necessary API service methods
    LmsApiService.postNewReportingConfig = jest.fn().mockResolvedValue({
      data: {
        uuid: 'new-config-uuid',
        active: true,
        delivery_method: 'email',
        data_type: 'progress_v3',
        frequency: 'monthly',
      },
    });

    let wrapper;
    await act(async () => {
      const { container } = render(
        <IntlProvider locale="en">
          <ReportingConfig {...defaultProps} intl={mockIntl} />
        </IntlProvider>,
      );
      wrapper = container;
    });

    // Find and click the "Add a reporting configuration" collapsible
    const CollapsibleTriggers = wrapper.querySelectorAll('div.collapsible-trigger');
    const addConfigCollapsible = CollapsibleTriggers[CollapsibleTriggers.length - 1];
    await user.click(addConfigCollapsible);

    // Select Values in form
    const deliveryMethodSelect = await screen.findByTestId('delivery-method-select');
    await user.selectOptions(deliveryMethodSelect, 'email');

    const dataTypeSelect = await screen.findByTestId('data-type-select');
    await user.selectOptions(dataTypeSelect, 'progress_v3');

    const frequencySelect = await screen.findByTestId('frequency-select');
    await user.selectOptions(frequencySelect, 'monthly');

    expect(dataTypeSelect).toHaveValue('progress_v3');
    expect(frequencySelect).toHaveValue('monthly');

    const submitButton = await screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Verify that the postNewReportingConfig method was called
    expect(LmsApiService.postNewReportingConfig).toHaveBeenCalled();

    // Verify that a new page was fetched after configuration creation
    expect(LmsApiService.fetchReportingConfigs).toHaveBeenCalledWith(
      defaultProps.enterpriseId,
      expect.any(Number),
    );
  });
});
