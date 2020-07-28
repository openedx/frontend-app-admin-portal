import React from 'react';
import { shallow } from 'enzyme';

import SamlConfiguration from './index';
import LmsApiService from './../../data/services/LmsApiService';
import { REQUIRED_DATA_FIELDS } from './SamlProviderDataForm';

const formData = new FormData();
const responseData = { data: {} };
const oldConfig = { };
REQUIRED_DATA_FIELDS.forEach((field) => {
  formData.append(field, 'testdata');
  responseData.data[field] = 'testdata';
  oldConfig[field] = 'oldtestdata';
});

describe('<SamlConfiguration /> ', () => {
  it('creating provider config states', () => {
    const wrapper = shallow(<SamlConfiguration enterpriseId="testEnterpriseId" />);
    const spyPostNewProviderConfig = jest.spyOn(LmsApiService, 'postNewProviderConfig');

    spyPostNewProviderConfig.mockImplementation(() => responseData);
    wrapper.instance().createProviderConfig(formData, () => {
      expect(wrapper.state().providerConfig).toEqual(responseData.data);
    });
  });

  it('updating provider config states', () => {
    const wrapper = shallow(<SamlConfiguration enterpriseId="testEnterpriseId" />);
    const spyPostUpdatedProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    wrapper.setState({ providerConfig: oldConfig });

    spyPostUpdatedProviderConfig.mockImplementation(() => responseData);
    wrapper.instance().updateProviderConfig(formData, () => {
      expect(wrapper.state().providerConfig).toEqual(responseData.data);
    });
  });

  it('deleting provider config resets states', () => {
    const wrapper = shallow(<SamlConfiguration enterpriseId="testEnterpriseId" />);
    const spyPostDeletedProviderConfig = jest.spyOn(LmsApiService, 'deleteProviderConfig');

    wrapper.setState({ providerConfig: oldConfig });
    spyPostDeletedProviderConfig.mockImplementation(() => {});
    wrapper.instance().deleteProviderConfig(formData, () => {
      expect(wrapper.state().providerConfig).toEqual(undefined);
    });
  });

  it('handling response errors', () => {
    const wrapper = shallow(<SamlConfiguration enterpriseId="testEnterpriseId" />);

    const errorMessage = 'test error message.';
    const spyPostUpdatedProviderConfig = jest.spyOn(LmsApiService, 'updateProviderConfig');
    spyPostUpdatedProviderConfig.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    expect(wrapper.instance().updateProviderConfig(formData)).resolves.toEqual(errorMessage);
  });
});
