import React from 'react';
import { mount } from 'enzyme';
import ReportingConfigForm from './ReportingConfigForm';

const config = {
  enterpriseCustomerId: 'test-customer-uuid',
  active: true,
  deliveryMethod: 'email',
  email: ['test_email@example.com'],
  frequency: 'monthly',
  dayOfMonth: 1,
  dayOfWeek: null,
  hourOfDay: 1,
  sftpHostname: '',
  sftpPort: null,
  sftpUsername: '',
  sftpFilePath: '',
  dataType: 'progress_v2',
  reportType: 'csv',
  pgpEncryptionKey: '',
  uuid: 'test-config-uuid',
  enterpriseCustomerCatalogs: [{
    uuid: 'test-enterprise-customer-catalog',
    title: 'All Content',
  }],
};

const availableCatalogs = [{
  uuid: 'test-enterprise-customer-catalog',
  title: 'All Content',
}];

const createConfig = () => { };
const updateConfig = () => { };

describe('<ReportingConfigForm />', () => {
  it('renders the proper fields when changing the delivery method', () => {
    const wrapper = mount((
      <ReportingConfigForm
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
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
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
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
    config.hourOfDay = undefined;
    const wrapper = mount((
      <ReportingConfigForm
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
      />
    ));
    wrapper.find('input#hourOfDay').simulate('blur');
    expect(wrapper.find('input#hourOfDay').hasClass('is-invalid')).toBeTruthy();
  });

  it('Does not submit if sftp fields are empty and deliveryMethod is sftp', () => {
    config.deliveryMethod = 'sftp';
    config.sftpPort = undefined;
    const wrapper = mount((
      <ReportingConfigForm
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
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
      ...config,
      dataType: 'progress',
    };

    const wrapper = mount((
      <ReportingConfigForm
        config={configWithOldDataType}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
      />
    ));
    expect(wrapper.find('select#dataType').prop('disabled')).toBeTruthy();
  });
  it('Does not disable data type when using new progress/catalog', () => {
    const wrapper = mount((
      <ReportingConfigForm
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
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
  it('Pre-selects enterprise customer catalogs from the reporting config.', () => {
    const wrapper = mount((
      <ReportingConfigForm
        config={config}
        createConfig={createConfig}
        updateConfig={updateConfig}
        availableCatalogs={availableCatalogs}
      />
    ));
    expect(
      wrapper.find('select#enterpriseCustomerCatalogs').instance().value = ['test-enterprise-customer-catalog'],
    );
  });
});
