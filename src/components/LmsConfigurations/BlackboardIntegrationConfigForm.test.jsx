import React from 'react';
import { mount } from 'enzyme';
import BlackboardIntegrationConfigForm, { REQUIRED_BLACKBOARD_CONFIG_FIELDS } from './BlackboardIntegrationConfigForm';

const config = {
  active: false,
  blackboardBaseUrl: 'http://test.com',
  catalogsToTransmit: null,
  channelWorkerUsername: null,
  clientId: '1234',
  clientSecret: '1234',
  created: '2020-01-01T00:00:00.000000Z',
  enterpriseCustomer: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  id: 4,
  modified: '2020-01-01T00:00:00.000000Z',
  refreshToken: '',
  transmissionChunkSize: 1,
};

describe('<BlackboardIntegrationConfigForm />', () => {
  it('fails if any required field is missing', () => {
    const wrapper = mount(
      <BlackboardIntegrationConfigForm
        enterpriseId={config.enterpriseCustomer}
      />,
    );
    // Initialize form data
    const formData = new FormData();
    REQUIRED_BLACKBOARD_CONFIG_FIELDS.forEach((requiredField) => formData.append(requiredField, config[requiredField]));
    // Remove form data one key at a time and validate
    REQUIRED_BLACKBOARD_CONFIG_FIELDS.forEach((requiredField) => {
      formData.delete(requiredField);
      const invalidFields = wrapper.instance().validateBlackboardConfigForm(
        formData,
        REQUIRED_BLACKBOARD_CONFIG_FIELDS,
      );
      expect(Object.keys(invalidFields)[0]).toEqual(requiredField);
      formData.append(requiredField, config[requiredField]);
    });
  });

  it('calls createBlackboardConfig when config is not provided', async () => {
    const wrapper = mount(
      <BlackboardIntegrationConfigForm
        enterpriseId={config.enterpriseCustomer}
      />,
    );

    // Initialize form data
    const formData = new FormData();
    REQUIRED_BLACKBOARD_CONFIG_FIELDS.forEach((requiredField) => formData.append(requiredField, config[requiredField]));

    const mockCreateBlackboardConfig = jest.spyOn(wrapper.instance(), 'createBlackboardConfig').mockImplementation(() => {});
    await wrapper.instance().handleSubmit(formData);
    expect(mockCreateBlackboardConfig).toHaveBeenCalled();
  });

  it('calls updateBlackboardConfig when config is not provided', async () => {
    const wrapper = mount(
      <BlackboardIntegrationConfigForm
        enterpriseId={config.enterpriseCustomer}
      />,
    );

    // Initialize form data
    const formData = new FormData();
    REQUIRED_BLACKBOARD_CONFIG_FIELDS.forEach((requiredField) => formData.append(requiredField, config[requiredField]));

    const mockUpdateBlackboardConfig = jest.spyOn(wrapper.instance(), 'updateBlackboardConfig').mockImplementation(() => {});
    await wrapper.instance().handleSubmit(formData, config);
    expect(mockUpdateBlackboardConfig).toHaveBeenCalled();
  });

  it('sets an error state when create or update return one', async () => {
    const wrapper = mount(
      <BlackboardIntegrationConfigForm
        enterpriseId={config.enterpriseCustomer}
      />,
    );

    // Initialize form data
    const formData = new FormData();
    REQUIRED_BLACKBOARD_CONFIG_FIELDS.forEach((requiredField) => formData.append(requiredField, config[requiredField]));

    jest.spyOn(wrapper.instance(), 'updateBlackboardConfig').mockImplementation(() => 'An error');
    await wrapper.instance().handleSubmit(formData, config);
    expect(wrapper.state().error).toEqual('An error');
  });
});
