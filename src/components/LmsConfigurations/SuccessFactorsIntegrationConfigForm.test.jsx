import React from 'react';
import { mount } from 'enzyme';
import SuccessFactorsIntegrationConfigForm, { REQUIRED_SUCCESS_FACTOR_CONFIG_FIELDS } from './SuccessFactorsIntegrationConfigForm';
import { validateLmsConfigForm } from './common';

const formData = new FormData();
REQUIRED_SUCCESS_FACTOR_CONFIG_FIELDS.forEach(field => formData.append(field, 'testdata'));

describe('<SuccessFactorsIntegrationConfigForm />', () => {
  it('validation fails if required fields missing', () => {
    const invalidFormData = new FormData();
    const invalidFields = validateLmsConfigForm(
      invalidFormData,
      REQUIRED_SUCCESS_FACTOR_CONFIG_FIELDS,
    );
    expect(Object.keys(invalidFields)).toEqual(REQUIRED_SUCCESS_FACTOR_CONFIG_FIELDS);
  });

  it('submit calls createSuccessFactorsConfig when config is not present', () => {
    const wrapper = mount((
      <SuccessFactorsIntegrationConfigForm enterpriseId="testing123" />
    ));
    const spyCreate = jest.spyOn(wrapper.instance(), 'createSuccessFactorsConfig');
    wrapper.instance().handleSubmit(formData);
    expect(spyCreate).toHaveBeenCalledWith(formData);
  });

  it('submit calls updateSuccessFactorsConfig when config is present', () => {
    const config = {
      id: 1,
      sapsfBaseUrl: 'testing.com',
    };
    const wrapper = mount((
      <SuccessFactorsIntegrationConfigForm enterpriseId="testing123" config={config} />
    ));
    const spyUpdate = jest.spyOn(wrapper.instance(), 'updateSuccessFactorsConfig');
    wrapper.instance().handleSubmit(formData, config);
    expect(spyUpdate).toHaveBeenCalledWith(formData, config.id);
  });

  it('show Alert on errors', () => {
    const wrapper = mount((<SuccessFactorsIntegrationConfigForm enterpriseId="testing123" />));
    wrapper.setState({ error: 'error occurred.' });
    expect(wrapper.find('Alert').find('AlertHeading').first().text()).toEqual('Unable to submit config form:');
  });
});
