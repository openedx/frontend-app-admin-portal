import React from 'react';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ReportingConfigForm from './ReportingConfigForm';

const defaultConfig = {
  enterpriseCustomerId: 'test-customer-uuid',
  active: true,
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
  it('properly handles deletion of configs', () => {
    const mock = jest.fn();
    const wrapper = mount((
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
    // It's finding three buttons for some reason??
    wrapper.find('.btn-outline-danger').at(0).simulate('click');
    expect(mock).toHaveBeenCalled();
  });

  it('renders the proper fields when changing the delivery method', () => {
    const wrapper = mount((
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
    expect(wrapper.find({ children: 'Email(s)' }));
    wrapper.find('select#deliveryMethod').simulate('change', { target: { value: 'sftp' } });
    expect(wrapper.find({ children: 'SFTP Hostname' }));
    expect(wrapper.find({ children: 'SFTP Username' }));
    expect(wrapper.find({ children: 'SFTP File Path' }));
    expect(wrapper.find({ children: 'SFTP Password' }));
    expect(wrapper.find({ children: 'SFTP Port' }));
  });

  it('Does not submit if email is not formatted or is missing and deliveryMethod is email', () => {
    const wrapper = mount((
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
    wrapper.find('textarea#email').instance().value = '';
    wrapper.find('textarea#email').simulate('blur');
    expect(wrapper.find({ children: 'Required. One email per line. Emails must be formatted properly (email@domain.com)' }));

    // test wrong formatting
    wrapper.find('textarea#email').instance().value = 'misformatted email';
    wrapper.find('textarea#email').simulate('blur');
    expect(wrapper.find({ children: 'Required. One email per line. Emails must be formatted properly (email@domain.com)' }));
  });

  it('Does not submit if hourOfDay is empty', () => {
    const config = { ...defaultConfig };
    config.hourOfDay = undefined;
    const wrapper = mount((
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
    wrapper.find('input#hourOfDay').simulate('blur');
    expect(wrapper.find('input#hourOfDay').hasClass('is-invalid')).toBeTruthy();
  });

  it('Does not submit if sftp fields are empty and deliveryMethod is sftp', () => {
    const config = { ...defaultConfig };
    config.deliveryMethod = 'sftp';
    config.sftpPort = undefined;
    const wrapper = mount((
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
    wrapper.find('.form-control').forEach(input => input.simulate('blur'));
    // sftpPort
    expect(wrapper.find({ children: 'Required for all frequency types' }));
    // sftpUsername
    expect(wrapper.find({ children: 'Required. Username cannot be blank' }));
    // sftpHostname
    expect(wrapper.find({ children: 'Required. Hostname cannot be blank' }));
    // sftpFilePath
    expect(wrapper.find({ children: 'Required. File path cannot be blank' }));
    // encryptedSftpPassword
    expect(wrapper.find({ children: 'Required. Password must not be blank' }));
  });
  it('Does not let you select a new value for data type if it uses the old progress_v1', () => {
    const configWithOldDataType = {
      ...defaultConfig,
      dataType: 'progress',
    };

    const wrapper = mount((
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
    expect(wrapper.find('select#dataType').prop('disabled')).toBeTruthy();
  });
  it('Does not disable data type when using new progress/catalog', () => {
    const wrapper = mount((
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
    expect(wrapper.find('select#dataType').prop('disabled')).toBeFalsy();
    wrapper.find('select#dataType').simulate('change', {
      target: {
        name: 'dataType',
        value: 'catalog',
      },
    });
    expect(wrapper.find('select#dataType').prop('disabled')).toBeFalsy();
  });
  it('Does not let you select a new value for data type if it uses the old progress_v2', () => {
    const configWithOldDataType = {
      ...defaultConfig,
      dataType: 'progress_v2',
    };

    const wrapper = mount((
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
    expect(wrapper.find('select#dataType').prop('disabled')).toBeTruthy();
  });
  it('Pre-selects enterprise customer catalogs from the reporting config.', () => {
    const wrapper = mount((
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
      wrapper.find('select#enterpriseCustomerCatalogs').instance().value,
    ).toEqual('test-enterprise-customer-catalog');
  });
  it('Submit enterprise uuid upon report config creation', async () => {
    const wrapper = mount((
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
    const flushPromises = () => new Promise(setImmediate);
    const formData = new FormData();
    await act(async () => {
      Object.entries(defaultConfig).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const instance = wrapper.find('ReportingConfigForm').instance();
      await instance.handleSubmit(formData, null);
    });
    await act(() => flushPromises());
    expect(createConfig.mock.calls[0][0].get('enterprise_customer_id')).toEqual(enterpriseCustomerUuid);
  });
  it('handles API response errors correctly.', async () => {
    defaultConfig.pgpEncryptionKey = 'invalid-key';
    const mock = jest.fn();

    const wrapper = mount((
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
    const instance = wrapper.find('ReportingConfigForm').instance();
    instance.setState = mock;

    const formData = new FormData();
    Object.entries(defaultConfig).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const errorResponse = {
      data: {
        pgp_encryption_key: ['Please enter a valid PGP encryption key.'],
      },
    };
    await act(async () => {
      await instance.handleAPIErrorResponse(errorResponse);
      expect(mock).toHaveBeenCalled();
    });

    mock.mockClear();

    instance.handleAPIErrorResponse({});
    expect(mock).not.toHaveBeenCalled();

    instance.handleAPIErrorResponse(null);
    expect(mock).not.toHaveBeenCalled();
  });
});
