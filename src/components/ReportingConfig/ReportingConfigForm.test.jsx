import React from 'react';
import {
  render, fireEvent, screen, waitFor,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom';
import ReportingConfigForm from './ReportingConfigForm';

const defaultConfig = {
  enterpriseCustomerId: 'test-customer-uuid',
  enterpriseCustomer: {
    uuid: 'test-customer-uuid',
  },
  active: true,
  enableCompression: true,
  includeDate: false,
  deliveryMethod: 'email',
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
  reportType: 'csv',
  pgpEncryptionKey: '',
  uuid: 'test-config-uuid',
  enterpriseCustomerCatalogs: [{
    uuid: 'test-enterprise-customer-catalog',
    title: 'All Content',
  }],
  encryptedPassword: '#$dsfrtga@',
};
const enterpriseCustomerUuid = 'enterpriseFoobar';

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
const availableCatalogs = [{
  uuid: 'test-enterprise-customer-catalog',
  title: 'All Content',
}];

const createConfig = jest.fn();
const updateConfig = () => { };

describe('<ReportingConfigForm />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('properly handles deletion of configs', async () => {
    const user = userEvent.setup();
    const mock = jest.fn();
    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={defaultConfig}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          deleteConfig={mock}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    const buttonToClick = container.querySelector('.btn-outline-danger');
    await user.click(buttonToClick);
    expect(mock).toHaveBeenCalled();
  });

  it('renders the proper fields when changing the delivery method', async () => {
    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={defaultConfig}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    expect(screen.getByText('Email(s)')).toBeInTheDocument();
    const deliveryMethodSelector = container.querySelector('select#deliveryMethod');
    fireEvent.change(deliveryMethodSelector, { target: { value: 'sftp' } });
    expect(await screen.getByText('SFTP Hostname')).toBeInTheDocument();
    expect(await screen.getByText('SFTP Username')).toBeInTheDocument();
    expect(await screen.getByText('SFTP File Path')).toBeInTheDocument();
    expect(await screen.getByText('SFTP Password')).toBeInTheDocument();
  });

  it('Does not submit if email is not formatted or is missing and deliveryMethod is email', async () => {
    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={defaultConfig}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    // test empty email field
    const emailInput = container.querySelector('textarea#email');
    emailInput.value = '';
    fireEvent.blur(emailInput);

    expect(await screen.findByText('Required. One email per line. Emails must be formatted properly (email@domain.com)')).toBeInTheDocument();

    // test wrong formatting
    emailInput.value = 'misformatted email';
    fireEvent.blur(emailInput);
    expect(await screen.findByText('Required. One email per line. Emails must be formatted properly (email@domain.com)')).toBeInTheDocument();
  });

  it('Does not submit if hourOfDay is empty', () => {
    const config = { ...defaultConfig };
    config.hourOfDay = undefined;
    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={config}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    const hourInput = container.querySelector('input#hourOfDay');
    fireEvent.blur(hourInput);
    expect(container.querySelector('input#hourOfDay')).toHaveAttribute('class', 'form-control is-invalid');
  });

  it('Does not submit if sftp fields are empty and deliveryMethod is sftp', async () => {
    const config = { ...defaultConfig };
    config.deliveryMethod = 'sftp';
    config.sftpPort = undefined;
    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={config}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    container.querySelectorAll('.form-control').forEach(input => fireEvent.blur(input));
    // sftpPort
    waitFor(() => expect(screen.findByText('Required for all frequency types')).toBeInTheDocument());
    // sftpUsername
    expect(await screen.findByText('Required. Username cannot be blank')).toBeInTheDocument();
    // sftpHostname
    expect(await screen.findByText('Required. Hostname cannot be blank')).toBeInTheDocument();
    // sftpFilePath
    expect(await screen.findByText('Required. File path cannot be blank')).toBeInTheDocument();
    // encryptedSftpPassword
    expect(await screen.findByText('Required. Password must not be blank')).toBeInTheDocument();
  });
  it('Does not let you select a new value for data type if it uses the old progress_v1', () => {
    const configWithOldDataType = {
      ...defaultConfig,
      dataType: 'progress',
    };

    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={configWithOldDataType}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    expect(container.querySelector('select#dataType')).toHaveAttribute('disabled');
  });
  it('Does not disable data type when using new progress/catalog', () => {
    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={defaultConfig}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    expect(container.querySelector('select#dataType')).not.toHaveAttribute('disabled');
    const dataTypeSelect = container.querySelector('select#dataType');
    fireEvent.change(dataTypeSelect, {
      target: {
        name: 'dataType',
        value: 'catalog',
      },
    });
    expect(container.querySelector('select#dataType')).not.toHaveAttribute('disabled');
  });
  it('Does not let you select a new value for data type if it uses the old progress_v2', () => {
    const configWithOldDataType = {
      ...defaultConfig,
      dataType: 'progress_v2',
    };

    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={configWithOldDataType}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    expect(container.querySelector('select#dataType')).toHaveAttribute('disabled');
  });
  it('Pre-selects enterprise customer catalogs from the reporting config.', () => {
    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={defaultConfig}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    expect(
      container.querySelector('select#enterpriseCustomerCatalogs').value,
    ).toEqual('test-enterprise-customer-catalog');
  });
  it('Submit enterprise uuid upon report config creation', async () => {
    const user = userEvent.setup();
    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    Object.entries(defaultConfig).forEach(([key, value]) => {
      const entryInput = container.querySelector(`[name="${key}"]`);
      if (entryInput) {
        entryInput.value = value;
      }
    });
    const submitButton = container.querySelector('#submitButton');
    await user.click(submitButton);
    expect(createConfig.mock.calls[0][0].get('enterprise_customer_id')).toEqual(enterpriseCustomerUuid);
  });
  it('handles API response errors correctly.', async () => {
    defaultConfig.pgpEncryptionKey = 'invalid-key';
    const mock = jest.fn();
    const user = userEvent.setup();

    const { container } = render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={defaultConfig}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));
    // const instance = wrapper.find('ReportingConfigForm').instance();
    // instance.setState = mock;

    // const formData = new FormData();
    Object.entries(defaultConfig).forEach(([key, value]) => {
      const entryInput = container.querySelector(`[name="${key}"]`);
      if (entryInput) {
        entryInput.value = value;
      }
    });
    const submitButton = container.querySelector('#submitButton');
    await user.click(submitButton);
    expect(mock).toHaveBeenCalled();

    mock.mockClear();

    // instance.handleAPIErrorResponse({});
    // expect(mock).not.toHaveBeenCalled();
    //
    // instance.handleAPIErrorResponse(null);
    // expect(mock).not.toHaveBeenCalled();
  });
  it("should update the includeDate state when the 'Include Date' checkbox is clicked", async () => {
    const user = userEvent.setup();
    render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={defaultConfig}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));

    const checkboxInput = screen.queryByTestId('includeDateCheckbox');
    expect(checkboxInput.checked).toEqual(false);

    await user.click(checkboxInput);

    const updatedCheckboxInstance = screen.queryByTestId('includeDateCheckbox');
    expect(updatedCheckboxInstance.checked).toEqual(true);
  });
  it("should update enableCompression state when the 'Enable Compression' checkbox is clicked", async () => {
    const user = userEvent.setup();
    render((
      <IntlProvider locale="en">
        <ReportingConfigForm
          config={defaultConfig}
          createConfig={createConfig}
          updateConfig={updateConfig}
          availableCatalogs={availableCatalogs}
          reportingConfigTypes={reportingConfigTypes}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>
    ));

    const instance = screen.findByTestId('compressionCheckbox');
    expect(instance.checked).toEqual(true);
    const checkBoxInput = screen.getByTestId('compressionCheckbox');
    await user.click(checkBoxInput);

    const updatedInstance = screen.findByTestId('compressionCheckbox');
    expect(updatedInstance.checked).toEqual(false);
  });
});
