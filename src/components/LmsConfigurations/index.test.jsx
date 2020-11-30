import React from 'react';
import { mount } from 'enzyme';
import { REQUIRED_MOODLE_CONFIG_FIELDS } from './MoodleIntegrationConfigForm';
import { REQUIRED_CANVAS_CONFIG_FIELDS } from './CanvasIntegrationConfigForm';
import LmsConfigurations from './index';
import LmsApiService from '../../data/services/LmsApiService';

jest.mock('./../../data/services/LmsApiService');

const moodleResponse = {
  data: { results: [{}] },
};
const notFoundMoodleResponse = {
  request: { status: 404, statusText: 'Not Found' },
};
const badMoodleResponse = {
  request: { status: 400, statusText: 'Bad Request' },
};

const canvasResponse = {
  data: { results: [{}] },
};
const notFoundCanvasResponse = {
  request: { status: 404, statusText: 'Not Found' },
};
const badCanvasResponse = {
  request: { status: 400, statusText: 'Bad Request' },
};

const formData = new FormData();

REQUIRED_MOODLE_CONFIG_FIELDS.forEach((field) => {
  formData.append(field, 'testdata');
  moodleResponse.data.results[0][field] = 'testdata';
});

REQUIRED_CANVAS_CONFIG_FIELDS.forEach((field) => {
  formData.append(field, 'testdata');
  canvasResponse.data.results[0][field] = 'testdata';
});

const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

describe('<LmsConfigurations /> ', () => {
  it('get LMS configurations when present', async () => {
    LmsApiService.fetchMoodleConfig.mockResolvedValue(moodleResponse);
    LmsApiService.fetchCanvasConfig.mockResolvedValue(canvasResponse);
    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().moodleConfig).toEqual(moodleResponse.data.results[0]);
    expect(wrapper.find('MoodleIntegrationConfigForm').props().config).toEqual(wrapper.state().moodleConfig);
  });

  it('return Error Page when any LMS fetch request fails with error (not 404)', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(badMoodleResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(badCanvasResponse);
    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().moodleConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(1);
  });

  it('return Fragment/Collapsible components when all have 404', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().moodleConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(0);
    expect(wrapper.find('CollapsibleAdvanced').length).toBe(2);
  });
});
