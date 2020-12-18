import React from 'react';
import { mount } from 'enzyme';
import { REQUIRED_MOODLE_CONFIG_FIELDS } from './MoodleIntegrationConfigForm';
import { REQUIRED_CANVAS_CONFIG_FIELDS } from './CanvasIntegrationConfigForm';
import LmsConfigurations from './index';
import LmsApiService from '../../data/services/LmsApiService';
import { REQUIRED_BLACKBOARD_CONFIG_FIELDS } from './BlackboardIntegrationConfigForm';

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

const blackboardResponse = {
  data: { results: [{}] },
};
const notFoundBlackboardResponse = {
  request: { status: 404, statusText: 'Not Found' },
};
const badBlackboardResponse = {
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

REQUIRED_BLACKBOARD_CONFIG_FIELDS.forEach((field) => {
  formData.append(field, 'testdata');
  blackboardResponse.data.results[0][field] = 'testdata';
});

const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

describe('<LmsConfigurations /> ', () => {
  it('get the Moodle LMS configuration when present', async () => {
    LmsApiService.fetchMoodleConfig.mockResolvedValue(moodleResponse);

    // Mock the fetch of the other configs to 404, not found
    LmsApiService.fetchBlackboardConfig.mockRejectedValue(notFoundBlackboardResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().moodleConfig).toEqual(moodleResponse.data.results[0]);
    expect(wrapper.find('MoodleIntegrationConfigForm').props().config).toEqual(wrapper.state().moodleConfig);
  });

  it('get the Blackboard LMS configuration when present', async () => {
    LmsApiService.fetchBlackboardConfig.mockResolvedValue(blackboardResponse);

    // Mock the fetch of the other configs to 404, not found
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().blackboardConfig).toEqual(blackboardResponse.data.results[0]);
    expect(wrapper.find('BlackboardIntegrationConfigForm').props().config).toEqual(wrapper.state().blackboardConfig);
  });

  it('return Error Page when the Moodle LMS fetch request fails with error (not 404)', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(badMoodleResponse);

    // We want to ensure that the Moodle fetch config method will cause the error page to display
    // if it encounters an unexpected error while the other config fetch methods succeed.
    LmsApiService.fetchBlackboardConfig.mockResolvedValue(blackboardResponse);
    LmsApiService.fetchCanvasConfig.mockResolvedValue(canvasResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();

    // Expect the moodle config to be false, while the others to be true
    expect(wrapper.state().moodleConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(1);
  });

  it('return Error Page when Blackboard LMS fetch request fails with an error (not 404)', async () => {
    LmsApiService.fetchBlackboardConfig.mockRejectedValue(badBlackboardResponse);

    // We want to ensure that the Blackboard fetch config method will cause the error page to display
    // if it encounters an unexpected error while the other pages succeed.
    LmsApiService.fetchMoodleConfig.mockResolvedValue(blackboardResponse);
    LmsApiService.fetchCanvasConfig.mockResolvedValue(canvasResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();

    // Expect the moodle config to be false, while the others to be true
    expect(wrapper.state().blackboardConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(1);
  });

  it('return Fragment/Collapsible components when all have 404', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    LmsApiService.fetchBlackboardConfig.mockRejectedValue(notFoundBlackboardResponse);
    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().moodleConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(0);
    expect(wrapper.find('CollapsibleAdvanced').length).toBe(3);
  });
});
