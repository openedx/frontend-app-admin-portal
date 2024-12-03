import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Pagination } from '@openedx/paragon';

import ReportingConfig from './index';
import LmsApiService from '../../data/services/LmsApiService';
import ErrorPage from '../ErrorPage';

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

describe('<ReportingConfig />', () => {
  it('calls deleteConfig function on button click', async () => {
    let wrapper;

    await act(async () => {
      wrapper = mount(
        <IntlProvider locale="en">
          <ReportingConfig {...defaultProps} intl={mockIntl} />
        </IntlProvider>,
      );
    });

    const configUuidToDelete = 'test-config-uuid';
    // Update the wrapper after the state changes
    wrapper.setState({
      loading: false,
    });
    wrapper.update();

    // Find the collapsible component and set its "isOpen" prop to true
    const collapsibleTrigger = wrapper.find('.collapsible-trigger').at(0);
    await act(async () => { collapsibleTrigger.simulate('click'); });
    wrapper.update();
    // Find the delete button using its data-testid and simulate a click event
    const deleteButton = wrapper.find('button[data-testid="deleteConfigButton"]');
    expect(deleteButton.exists()).toBe(true); // Ensure the button exists
    await act(async () => { deleteButton.simulate('click'); });
    wrapper.update();

    // Verify that the deleteConfig function was called with the correct UUID
    expect(LmsApiService.deleteReportingConfig).toHaveBeenCalledWith(configUuidToDelete);

    const afterClickingDeleteButton = wrapper.find('button[data-testid="deleteConfigButton"]');
    expect(afterClickingDeleteButton.exists()).toBe(false);
  });
  it('handles fetchReportingConfigs failure gracefully after deleting a record', async () => {
    // Mock fetchReportingConfigs to return a valid response once
    LmsApiService.fetchReportingConfigs = jest.fn().mockResolvedValueOnce(mockConfigsData).mockRejectedValueOnce(new Error('Failed to fetch reporting configs'));

    let wrapper;

    await act(async () => {
      wrapper = mount(
        <IntlProvider locale="en">
          <ReportingConfig {...defaultProps} intl={mockIntl} />
        </IntlProvider>,
      );
    });

    const configUuidToDelete = 'test-config-uuid';
    // Update the wrapper after the state changes
    wrapper.setState({
      loading: false,
    });
    wrapper.update();

    // Find the collapsible component and set its "isOpen" prop to true
    const collapsibleTrigger = wrapper.find('.collapsible-trigger').at(0);
    await act(async () => { collapsibleTrigger.simulate('click'); });
    wrapper.update();
    // Find the delete button using its data-testid and simulate a click event
    const deleteButton = wrapper.find('button[data-testid="deleteConfigButton"]');
    expect(deleteButton.exists()).toBe(true); // Ensure the button exists
    await act(async () => { deleteButton.simulate('click'); });
    wrapper.update();

    // Verify that the deleteConfig function was called with the correct UUID
    expect(LmsApiService.deleteReportingConfig).toHaveBeenCalledWith(configUuidToDelete);

    const afterClickingDeleteButton = wrapper.find('button[data-testid="deleteConfigButton"]');
    expect(afterClickingDeleteButton.exists()).toBe(false);

    // Check for error handling
    const errorMessage = wrapper.find(ErrorPage); // Adjust selector based on your error display logic
    expect(errorMessage.exists()).toBe(true);
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
      wrapper = mount(
        <IntlProvider locale="en">
          <ReportingConfig {...defaultProps} intl={mockIntl} />
        </IntlProvider>,
      );
    });

    wrapper.update();

    // Check that Pagination component is not rendered when no configs
    const paginationComponent = wrapper.find(Pagination);
    expect(paginationComponent.exists()).toBe(false);
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
      wrapper = mount(
        <IntlProvider locale="en">
          <ReportingConfig {...defaultProps} intl={mockIntl} />
        </IntlProvider>,
      );
    });

    wrapper.update();

    // Check that Pagination component is rendered when configs exist
    const paginationComponent = wrapper.find(Pagination);
    expect(paginationComponent.exists()).toBe(true);
  });
  it('calls createConfig function and handles new configuration creation', async () => {
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
      wrapper = mount(
        <IntlProvider locale="en">
          <ReportingConfig {...defaultProps} intl={mockIntl} />
        </IntlProvider>,
      );
    });

    // Wait for initial loading to complete
    await act(async () => {
      wrapper.update();
    });

    // Find and click the "Add a reporting configuration" collapsible
    const addConfigCollapsible = wrapper.find('div.collapsible-trigger').last();
    await act(async () => {
      addConfigCollapsible.simulate('click');
    });
    wrapper.update();

    // Prepare mock form data
    const mockFormData = new FormData();
    mockFormData.append('delivery_method', 'email');
    mockFormData.append('data_type', 'progress_v3');
    mockFormData.append('frequency', 'monthly');

    // Find the ReportingConfigForm within the new config collapsible
    const reportingConfigForm = wrapper.find('ReportingConfigForm').last();

    // Mock the form submission
    await act(async () => {
      reportingConfigForm.prop('createConfig')(mockFormData);
    });

    // Verify that the postNewReportingConfig method was called
    expect(LmsApiService.postNewReportingConfig).toHaveBeenCalled();

    // Verify that a new page was fetched after configuration creation
    expect(LmsApiService.fetchReportingConfigs).toHaveBeenCalledWith(
      defaultProps.enterpriseId,
      expect.any(Number),
    );
  });
});
