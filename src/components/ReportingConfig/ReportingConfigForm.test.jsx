import React from 'react';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import ReportingConfigForm from './ReportingConfigForm';

const defaultConfig = {
  enterpriseCustomerId: 'test-customer-uuid',
  active: true,
  enableCompression: true,
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
      <ReportingConfigForm
        config={defaultConfig}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        deleteConfig={mock}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    // It's finding three buttons for some reason??
    wrapper.find('.btn-outline-danger').at(0).simulate('click');
    expect(mock).toHaveBeenCalled();
  });
  it('check the compression checkbox is render or not', () => {
    const wrapper = mount((
      <ReportingConfigForm
        config={defaultConfig}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));

    expect(wrapper.exists('#enableCompression')).toEqual(true);
    expect(wrapper.find('#enableCompression').hostNodes().prop('checked')).toEqual(true);
    wrapper.find('#enableCompression').hostNodes().simulate('change', { target: { checked: false } });
    wrapper.update();
    expect(wrapper.find('#enableCompression').hostNodes().prop('checked')).toEqual(false);
  });
  it('renders the proper fields when changing the delivery method', () => {
    const wrapper = mount((
      <ReportingConfigForm
        config={defaultConfig}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    expect(wrapper.exists('#email')).toEqual(true);
    wrapper.find('select#deliveryMethod').simulate('change', { target: { value: 'sftp' } });
    expect(wrapper.exists('#sftpHostname')).toEqual(true);
    expect(wrapper.exists('#sftpUsername')).toEqual(true);
    expect(wrapper.exists('#sftpFilePath')).toEqual(true);
    expect(wrapper.exists('#encryptedSftpPassword')).toEqual(true);
    expect(wrapper.exists('#sftpPort')).toEqual(true);
  });

  it('Does not submit if email is not formatted or is missing and deliveryMethod is email', () => {
    const wrapper = mount((
      <ReportingConfigForm
        config={defaultConfig}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    // test empty email field
    wrapper.find('textarea#email').instance().value = '';
    wrapper.find('textarea#email').simulate('blur');
    expect(wrapper.find('textarea#email').hasClass('is-invalid')).toBeTruthy();
    // test wrong formatting
    wrapper.find('textarea#email').instance().value = 'misformatted email';
    wrapper.find('textarea#email').simulate('blur');
    expect(wrapper.find('textarea#email').hasClass('is-invalid')).toBeTruthy();
  });
  it('Does not submit if hourOfDay is empty', () => {
    const config = { ...defaultConfig };
    config.hourOfDay = undefined;
    const wrapper = mount((
      <ReportingConfigForm
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    wrapper.find('input#hourOfDay').simulate('blur');
    expect(wrapper.find('input#hourOfDay').hasClass('is-invalid')).toBeTruthy();
  });
  it('Does not submit if sftp fields are empty and deliveryMethod is sftp', () => {
    const config = { ...defaultConfig };
    config.deliveryMethod = 'sftp';
    config.sftpPort = undefined;
    const wrapper = mount((
      <ReportingConfigForm
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    wrapper.find('.form-control').forEach(input => input.simulate('blur'));
    expect(wrapper.find('input#sftpPort').hasClass('is-invalid')).toBeTruthy();
    expect(wrapper.find('input#sftpUsername').hasClass('is-invalid')).toBeTruthy();
    expect(wrapper.find('input#sftpHostname').hasClass('is-invalid')).toBeTruthy();
    expect(wrapper.find('input#sftpFilePath').hasClass('is-invalid')).toBeTruthy();
    expect(wrapper.find('input#encryptedSftpPassword').hasClass('is-invalid')).toBeTruthy();
  });
  it('Does not let you select a new value for data type if it uses the old progress_v1', () => {
    const configWithOldDataType = {
      ...defaultConfig,
      dataType: 'progress',
    };

    const wrapper = mount((
      <ReportingConfigForm
        config={configWithOldDataType}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    expect(wrapper.find('select#dataType').prop('disabled')).toBeTruthy();
  });
  it('Does not disable data type when using new progress/catalog', () => {
    const wrapper = mount((
      <ReportingConfigForm
        config={defaultConfig}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
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
      <ReportingConfigForm
        config={configWithOldDataType}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    expect(wrapper.find('select#dataType').prop('disabled')).toBeTruthy();
  });
  it('Pre-selects enterprise customer catalogs from the reporting config.', () => {
    const wrapper = mount((
      <ReportingConfigForm
        config={defaultConfig}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    expect(
      wrapper.find('select#enterpriseCustomerCatalogs').instance().value,
    ).toEqual('test-enterprise-customer-catalog');
  });
  it('handles API response errors correctly.', async () => {
    defaultConfig.pgpEncryptionKey = 'invalid-key';
    const mock = jest.fn();

    const wrapper = mount((
      <ReportingConfigForm
        config={defaultConfig}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    wrapper.instance().setState = mock;

    const formData = new FormData();
    Object.entries(defaultConfig).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const errorResponse = {
      data: {
        pgp_encryption_key: ['Please enter a valid PGP encryption key.'],
      },
    };
    wrapper.instance().handleAPIErrorResponse(errorResponse);
    expect(mock).toHaveBeenCalled();

    mock.mockClear();

    wrapper.instance().handleAPIErrorResponse({});
    expect(mock).not.toHaveBeenCalled();

    wrapper.instance().handleAPIErrorResponse(null);
    expect(mock).not.toHaveBeenCalled();
  });
  it('Submit if PGP key is present and password is empty and delivery method is email', async () => {
    const config = { ...defaultConfig };
    config.deliveryMethod = 'email';
    config.pgpEncryptionKey = 'some-pgp-key';
    config.encryptedPassword = '';
    const wrapper = mount((
      <ReportingConfigForm
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    const flushPromises = () => new Promise(setImmediate);
    const formData = new FormData();
    Object.entries(config).forEach(([key, value]) => {
      formData.append(key, value);
    });
    wrapper.instance().handleSubmit(formData, null);
    await act(() => flushPromises());
    expect(createConfig.mock.calls[0][0].get('enterprise_customer_id')).toEqual(enterpriseCustomerUuid);
  });
  it('Do not Submit if PGP key and password is empty and delivery method is email', async () => {
    const config = { ...defaultConfig };
    config.pgpEncryptionKey = '';
    config.encryptedPassword = '';
    const wrapper = mount((
      <ReportingConfigForm
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    const formData = new FormData();
    Object.entries(config).forEach(([key, value]) => {
      formData.append(key, value);
    });
    wrapper.instance().handleSubmit(formData, null);
    wrapper.find('.form-control').forEach(input => input.simulate('blur'));
    expect(wrapper.find('input#encryptedPassword').hasClass('is-invalid')).toBeTruthy();
  });
  it('Password is not required while updating if it is already present and delivery method is email', async () => {
    const updateConfigMock = jest.fn().mockResolvedValue();
    const initialConfig = {
      ...defaultConfig,
    };
    initialConfig.encryptedPassword = 'some_pass';
    initialConfig.pgpEncryptionKey = '';
    initialConfig.hourOfDay = 4;
    const requiredFields = ['hourOfDay', 'emailRaw'];
    const wrapper = mount(
      <ReportingConfigForm
        config={initialConfig}
        createConfig={createConfig}
        updateConfig={updateConfigMock}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );

    const updatedFormData = new FormData();
    updatedFormData.append('deliveryMethod', 'email');
    updatedFormData.append('pgpEncryptionKey', '');
    updatedFormData.append('encryptedPassword', '');

    const invalidFields = await wrapper.instance().validateReportingForm(
      initialConfig,
      updatedFormData,
      requiredFields,
    );
    expect('encryptedPassword' in invalidFields).toBe(false);
  });
  it('Submit enterprise uuid upon report config creation', async () => {
    const wrapper = mount((
      <ReportingConfigForm
        config={defaultConfig}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
        reportingConfigTypes={reportingConfigTypes}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
    ));
    const flushPromises = () => new Promise(setImmediate);
    const formData = new FormData();
    Object.entries(defaultConfig).forEach(([key, value]) => {
      formData.append(key, value);
    });
    wrapper.instance().handleSubmit(formData, null);
    await act(() => flushPromises());
    expect(createConfig.mock.calls[0][0].get('enterprise_customer_id')).toEqual(enterpriseCustomerUuid);
  });
});
