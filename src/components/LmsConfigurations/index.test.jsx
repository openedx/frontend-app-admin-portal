import React from 'react';
import { mount } from 'enzyme';
import { REQUIRED_MOODLE_CONFIG_FIELDS } from './MoodleIntegrationConfigForm';
import { REQUIRED_CANVAS_CONFIG_FIELDS } from './CanvasIntegrationConfigForm';
import { REQUIRED_SUCCESS_FACTOR_CONFIG_FIELDS } from './SuccessFactorsIntegrationConfigForm';
import LmsConfigurations from './index';
import LmsApiService from '../../data/services/LmsApiService';
import { REQUIRED_BLACKBOARD_CONFIG_FIELDS } from './BlackboardIntegrationConfigForm';
import { REQUIRED_DEGREED_CONFIG_FIELDS } from './DegreedIntegrationConfigForm';

jest.mock('./../../data/services/LmsApiService');

const moodleResponse = {
  data: { results: [{}] },
};
const successFactorsResponse = {
  data: { results: [{}] },
};

const notFoundMoodleResponse = {
  request: { status: 404, statusText: 'Not Found' },
};
const notFoundSuccessFactorsResponse = {
  request: { status: 404, statusText: 'Not Found' },
};

const badMoodleResponse = {
  request: { status: 400, statusText: 'Bad Request' },
};

const badSuccessFactorsResponse = {
  request: { status: 400, statusText: 'Bad Request' },
};

const canvasResponse = {
  data: { results: [{}] },
};
const notFoundCanvasResponse = {
  request: { status: 404, statusText: 'Not Found' },
};

const badCanvasResponse = {
  request: { status: 400, statustext: 'Bad Request' },
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

const degreedResponse = {
  data: { results: [{}] },
};
const notFoundDegreedResponse = {
  request: { status: 404, statusText: 'Not Found' },
};
const badDegreedResponse = {
  request: { status: 400, statusText: 'Bad Request' },
};

REQUIRED_MOODLE_CONFIG_FIELDS.forEach((field) => {
  moodleResponse.data.results[0][field] = 'testdata';
});

REQUIRED_CANVAS_CONFIG_FIELDS.forEach((field) => {
  canvasResponse.data.results[0][field] = 'testdata';
});

REQUIRED_BLACKBOARD_CONFIG_FIELDS.forEach((field) => {
  blackboardResponse.data.results[0][field] = 'testdata';
});

REQUIRED_SUCCESS_FACTOR_CONFIG_FIELDS.forEach((field) => {
  successFactorsResponse.data.results[0][field] = 'testdata';
});

REQUIRED_DEGREED_CONFIG_FIELDS.forEach((field) => {
  degreedResponse.data.results[0][field] = 'testdata';
});

const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

describe('<LmsConfigurations /> ', () => {
  it('gets list of forms when all configs return 404s', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchBlackboardConfig.mockRejectedValue(notFoundBlackboardResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockRejectedValue(notFoundSuccessFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(notFoundDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.find('ErrorPage').length).toBe(0);
    expect(wrapper.find('CollapsibleAdvanced').length).toBeGreaterThan(0);
  });
  it('gets the Moodle LMS configuration when present', async () => {
    LmsApiService.fetchMoodleConfig.mockResolvedValue(moodleResponse);

    // Mock the fetch of the other configs to 404, not found
    LmsApiService.fetchBlackboardConfig.mockRejectedValue(notFoundBlackboardResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockRejectedValue(notFoundSuccessFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(notFoundDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().moodleConfig).toEqual(moodleResponse.data.results[0]);
    expect(wrapper.find('MoodleIntegrationConfigForm').props().config).toEqual(wrapper.state().moodleConfig);
  });

  it('gets the Blackboard LMS configuration when present', async () => {
    LmsApiService.fetchBlackboardConfig.mockResolvedValue(blackboardResponse);

    // Mock the fetch of the other configs to 404, not found
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockRejectedValue(notFoundSuccessFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(notFoundDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().blackboardConfig).toEqual(blackboardResponse.data.results[0]);
    expect(wrapper.find('BlackboardIntegrationConfigForm').props().config).toEqual(wrapper.state().blackboardConfig);
  });

  it('gets the Canvas LMS configuration when present', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchBlackboardConfig.mockRejectedValue(notFoundBlackboardResponse);
    LmsApiService.fetchCanvasConfig.mockResolvedValue(canvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockRejectedValue(notFoundSuccessFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(notFoundDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().canvasConfig).toEqual(canvasResponse.data.results[0]);
    expect(wrapper.find('CanvasIntegrationConfigForm').props().config).toEqual(wrapper.state().canvasConfig);
  });

  it('gets the Success Factors LMS configuration when present', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchBlackboardConfig.mockRejectedValue(notFoundBlackboardResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockResolvedValue(successFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(notFoundDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().sapsfConfig).toEqual(successFactorsResponse.data.results[0]);
    expect(wrapper.find('SuccessFactorsIntegrationConfigForm').props().config).toEqual(wrapper.state().sapsfConfig);
  });

  it('gets the Degreed LMS configuration when present', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchBlackboardConfig.mockRejectedValue(notFoundBlackboardResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockResolvedValue(successFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockResolvedValue(degreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();
    expect(wrapper.state().degreedConfig).toEqual(degreedResponse.data.results[0]);
  });

  it('return Error Page when the Moodle LMS fetch request fails with error (not 404)', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(badMoodleResponse);

    // We want to ensure that the Moodle fetch config method will cause the error page to display
    // if it encounters an unexpected error while the other config fetch methods succeed.
    LmsApiService.fetchBlackboardConfig.mockResolvedValue(blackboardResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockRejectedValue(notFoundSuccessFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(notFoundDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();

    expect(wrapper.state().moodleConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(1);
    expect(wrapper.find('MoodleIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('SuccessFactorsIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('CanvasIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('BlackboardIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('DegreedIntegrationConfigForm').length).toBe(0);
  });

  it('return Error Page when Blackboard LMS fetch request fails with an error (not 404)', async () => {
    LmsApiService.fetchBlackboardConfig.mockRejectedValue(badBlackboardResponse);

    // We want to ensure that the Blackboard fetch config method will cause the error page to display
    // if it encounters an unexpected error while the other pages succeed.
    LmsApiService.fetchMoodleConfig.mockResolvedValue(blackboardResponse);
    LmsApiService.fetchCanvasConfig.mockResolvedValue(canvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockRejectedValue(notFoundSuccessFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(notFoundDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();

    expect(wrapper.state().blackboardConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(1);
    expect(wrapper.find('MoodleIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('SuccessFactorsIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('CanvasIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('BlackboardIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('DegreedIntegrationConfigForm').length).toBe(0);
  });

  it('return Error Page when the Canvas LMS fetch request fails with error (not 404)', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchBlackboardConfig.mockResolvedValue(blackboardResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(badCanvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockRejectedValue(notFoundSuccessFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(notFoundDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();

    expect(wrapper.state().canvasConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(1);
    expect(wrapper.find('MoodleIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('SuccessFactorsIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('CanvasIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('BlackboardIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('DegreedIntegrationConfigForm').length).toBe(0);
  });

  it('return Error Page when the Success Factors LMS fetch request fails with error (not 404)', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchBlackboardConfig.mockResolvedValue(blackboardResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockRejectedValue(badSuccessFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(notFoundDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();

    expect(wrapper.state().sapsfConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(1);
    expect(wrapper.find('MoodleIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('SuccessFactorsIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('CanvasIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('BlackboardIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('DegreedIntegrationConfigForm').length).toBe(0);
  });

  it('return Error Page when the Degreed LMS fetch request fails with error (not 404)', async () => {
    LmsApiService.fetchMoodleConfig.mockRejectedValue(notFoundMoodleResponse);
    LmsApiService.fetchBlackboardConfig.mockResolvedValue(blackboardResponse);
    LmsApiService.fetchCanvasConfig.mockRejectedValue(notFoundCanvasResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockResolvedValue(successFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockRejectedValue(badDegreedResponse);

    const wrapper = mount(<LmsConfigurations enterpriseId="testEnterpriseId" />);
    await waitForAsync();
    wrapper.update();

    expect(wrapper.state().degreedConfig).toBeFalsy();
    expect(wrapper.find('ErrorPage').length).toBe(1);
    expect(wrapper.find('MoodleIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('SuccessFactorsIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('CanvasIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('BlackboardIntegrationConfigForm').length).toBe(0);
    expect(wrapper.find('DegreedIntegrationConfigForm').length).toBe(0);
  });
});
