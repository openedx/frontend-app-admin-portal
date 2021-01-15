import React from 'react';
import { mount } from 'enzyme';
import CanvasIntegrationConfigForm, { REQUIRED_CANVAS_CONFIG_FIELDS } from './CanvasIntegrationConfigForm';
import { validateLmsConfigForm } from './common';

const config = {
  active: false,
  canvasAccountId: 1234,
  canvasBaseUrl: 'http://test.com',
  catalogsToTransmit: null,
  channelWorkerUsername: null,
  clientId: '1234',
  clientSecret: '1234',
  created: '2020-01-01T00:00:00.000000Z',
  enterpriseCustomer: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  id: 4,
  modified: '2020-01-01T00:00:00.000000Z',
  refreshToken: '',
  transmissionChunkSize: 500,
};

describe('<CanvasIntegrationConfigForm />', () => {
  it('fails if any required field is missing', () => {
    // Initialize form data
    const formData = new FormData();
    REQUIRED_CANVAS_CONFIG_FIELDS.forEach((requiredField) => formData.append(requiredField, config[requiredField]));
    // Remove form data one key at a time and validate
    REQUIRED_CANVAS_CONFIG_FIELDS.forEach((requiredField) => {
      formData.delete(requiredField);
      const invalidFields = validateLmsConfigForm(
        formData,
        REQUIRED_CANVAS_CONFIG_FIELDS,
      );
      expect(Object.keys(invalidFields)[0]).toEqual(requiredField);
      formData.append(requiredField, config[requiredField]);
    });
  });

  it('calls createCanvasConfig when config is not provided', async () => {
    const wrapper = mount(
      <CanvasIntegrationConfigForm
        enterpriseId={config.enterpriseCustomer}
      />,
    );

    // Initialize form data
    const formData = new FormData();
    REQUIRED_CANVAS_CONFIG_FIELDS.forEach((requiredField) => formData.append(requiredField, config[requiredField]));

    const mockCreateCanvasConfig = jest.spyOn(wrapper.instance(), 'createCanvasConfig').mockImplementation(() => {});
    await wrapper.instance().handleSubmit(formData);
    expect(mockCreateCanvasConfig).toHaveBeenCalled();
  });

  it('calls updateCanvasConfig when config is not provided', async () => {
    const wrapper = mount(
      <CanvasIntegrationConfigForm
        enterpriseId={config.enterpriseCustomer}
      />,
    );

    // Initialize form data
    const formData = new FormData();
    REQUIRED_CANVAS_CONFIG_FIELDS.forEach((requiredField) => formData.append(requiredField, config[requiredField]));

    const mockUpdateCanvasConfig = jest.spyOn(wrapper.instance(), 'updateCanvasConfig').mockImplementation(() => {});
    await wrapper.instance().handleSubmit(formData, config);
    expect(mockUpdateCanvasConfig).toHaveBeenCalled();
  });

  it('sets an error state when create or update return one', async () => {
    const wrapper = mount(
      <CanvasIntegrationConfigForm
        enterpriseId={config.enterpriseCustomer}
      />,
    );

    // Initialize form data
    const formData = new FormData();
    REQUIRED_CANVAS_CONFIG_FIELDS.forEach((requiredField) => formData.append(requiredField, config[requiredField]));

    jest.spyOn(wrapper.instance(), 'updateCanvasConfig').mockImplementation(() => 'An error');
    await wrapper.instance().handleSubmit(formData, config);
    expect(wrapper.state().error).toEqual('An error');
  });
});
