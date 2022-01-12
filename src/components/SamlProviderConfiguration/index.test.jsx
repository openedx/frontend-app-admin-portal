import { mount, shallow } from 'enzyme';
import React from 'react';
import LmsApiService from '../../data/services/LmsApiService';
import { SamlProviderConfigurationCore } from './index';
import { REQUIRED_CONFIG_FIELDS } from './SamlProviderConfigForm';
import { REQUIRED_DATA_FIELDS } from './SamlProviderDataForm';

jest.mock('./../../data/services/LmsApiService');

const formData = new FormData();
const configResponse = {
  data: { results: [{}] },
};
const validDataResponse = {
  data: { results: [{}] },
};
const invalidDataResponse = {
  data: { results: [{}] },
};

const oldConfig = { };
REQUIRED_CONFIG_FIELDS.forEach((field) => {
  formData.append(field, 'testdata');
  configResponse.data.results[0][field] = 'testdata';
  oldConfig[field] = 'oldtestdata';
});
REQUIRED_DATA_FIELDS.forEach((field) => {
  validDataResponse.data.results[0][field] = 'testdata';
});

describe('<SamlProviderConfiguration /> ', () => {
  it('get provider config (with no data)', () => {
    LmsApiService.getProviderConfig.mockResolvedValue(configResponse);
    LmsApiService.getProviderData.mockResolvedValue(invalidDataResponse);
    const wrapper = mount(<SamlProviderConfigurationCore enterpriseId="testEnterpriseId" learnerPortalEnabled />);
    setImmediate(() => {
      expect(wrapper.state().providerConfig).toEqual(configResponse.data.results[0]);
    });
  });

  it('get provider config and data', () => {
    LmsApiService.getProviderConfig.mockResolvedValue(configResponse);
    LmsApiService.getProviderData.mockResolvedValue(validDataResponse);
    const wrapper = mount(<SamlProviderConfigurationCore enterpriseId="testEnterpriseId" learnerPortalEnabled />);
    setImmediate(() => {
      expect(wrapper.state().providerConfig).toEqual(configResponse.data.results[0]);
      expect(wrapper.state().providerData).toEqual(validDataResponse.data.results[0]);
    });
  });

  it('creating provider config states', () => {
    const wrapper = mount(<SamlProviderConfigurationCore enterpriseId="testEnterpriseId" learnerPortalEnabled />);

    LmsApiService.postNewProviderConfig.mockResolvedValue(configResponse);
    wrapper.instance().createProviderConfig(formData, () => {
      expect(wrapper.state().providerConfig).toEqual(configResponse.data.results[0]);
    });
  });

  it('updating provider config states', () => {
    const wrapper = mount(<SamlProviderConfigurationCore enterpriseId="testEnterpriseId" learnerPortalEnabled />);
    wrapper.setState({ providerConfig: oldConfig });

    LmsApiService.updateProviderConfig.mockResolvedValue(configResponse);
    wrapper.instance().updateProviderConfig(formData, () => {
      expect(wrapper.state().providerConfig).toEqual(configResponse.data.results[0]);
    });
  });

  it('deleting provider config resets states', () => {
    const wrapper = mount(<SamlProviderConfigurationCore enterpriseId="testEnterpriseId" learnerPortalEnabled />);
    wrapper.setState({ providerConfig: oldConfig });

    LmsApiService.deleteProviderConfig.mockResolvedValue({});
    wrapper.instance().deleteProviderConfig(formData, () => {
      expect(wrapper.state().providerConfig).toEqual(undefined);
    });
  });

  it('handling response errors', () => {
    const wrapper = shallow(<SamlProviderConfigurationCore enterpriseId="testEnterpriseId" learnerPortalEnabled />);

    const errorMessage = 'test error message.';
    LmsApiService.updateProviderConfig.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    expect(wrapper.instance().updateProviderConfig(formData)).resolves.toEqual(errorMessage);
  });
});
