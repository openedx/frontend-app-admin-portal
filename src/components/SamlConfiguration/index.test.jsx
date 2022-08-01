import React from 'react';
import { mount } from 'enzyme';

import SamlConfiguration from './index';
import LmsApiService from '../../data/services/LmsApiService';

jest.mock('./../../data/services/LmsApiService');

const testConfigs = {
  data: {
    results: [{ id: 1, slug: 'test1' }, { id: 2, slug: 'test2' }],
  },
};

describe('<SamlConfiguration /> ', () => {
  it('get config options', () => {
    LmsApiService.fetchSamlConfigurations.mockResolvedValue(testConfigs);
    const wrapper = mount(<SamlConfiguration />);
    setImmediate(() => {
      const options = wrapper.instance().getConfigOptions();
      testConfigs.data.results.forEach((config, index) => {
        expect(options[index + 1].props.value).toEqual(config.id);
      });
    });
  });

  it('with no prop, options default uses empty value', () => {
    const wrapper = mount(<SamlConfiguration />);
    expect(wrapper.find('select#samlConfigId').instance().value).toEqual('');
  });
  it('with prop, options default uses prop', () => {
    LmsApiService.fetchSamlConfigurations.mockResolvedValue(testConfigs);
    const wrapper = mount(<SamlConfiguration currentConfig={2} />);
    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find('select#samlConfigId').instance().value).toEqual('2');
    });
  });

  it('verify default value when prop does not match any options', () => {
    LmsApiService.fetchSamlConfigurations.mockResolvedValue(testConfigs);
    const wrapper = mount(<SamlConfiguration currentConfig={4} />);
    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find('select#samlConfigId').instance().value).toEqual('');
    });
  });
});
