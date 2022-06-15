import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import LmsConfigurations from './index';
import LmsApiService from '../../data/services/LmsApiService';

const mockStore = configureMockStore([thunk]);
jest.mock('./../../data/services/LmsApiService');
const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

const moodleResponse = {
  data: { results: [{}] },
};
const successFactorsResponse = {
  data: { results: [{}] },
};

const canvasResponse = {
  data: { results: [{}] },
};

const blackboardResponse = {
  data: { results: [{}] },
};

const degreedResponse = {
  data: { results: [{}] },
};

const cornerstoneResponse = {
  data: { results: [{}] },
};

const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
    contactEmail: 'fake@example.com',
  },
};

const LmsConfigurationsWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <LmsConfigurations {...props} />
    </Provider>
  </MemoryRouter>
);

LmsConfigurationsWrapper.defaultProps = {
  store: mockStore(initialState),
};

LmsConfigurationsWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('LmsConfigurationsWrapper', () => {
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders moodle collapsable', async () => {
    LmsApiService.fetchMoodleConfig.mockResolvedValue(moodleResponse);
    LmsApiService.fetchCanvasConfig.mockResolvedValue(canvasResponse);
    LmsApiService.fetchBlackboardConfig.mockResolvedValue(blackboardResponse);
    LmsApiService.fetchSuccessFactorsConfig.mockResolvedValue(successFactorsResponse);
    LmsApiService.fetchDegreedConfig.mockResolvedValue(degreedResponse);
    LmsApiService.fetchCornerstoneConfig.mockResolvedValue(cornerstoneResponse);

    const wrapper = mount(<LmsConfigurationsWrapper data={{}} />);
    await waitForAsync();
    expect(wrapper.text()).toContain('Loading...Loading');
    wrapper.update();
    expect(wrapper.text()).toContain('ActiveMoodle');
  });
});
