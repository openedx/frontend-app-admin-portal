import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr } from '../../../../utils';

import MoodleConfig from '../LMSConfigs/MoodleConfig';

describe('<MoodleConfig />', () => {
  let wrapper;
  let onClickMock;
  beforeEach(() => {
    onClickMock = jest.fn();
    const props = {
      id: 'test-enterprise-id',
      onClick: onClickMock,
    };
    wrapper = shallow(<MoodleConfig {...props} />);
  });

  it('renders without errors', () => {
    const config = findByTestAttr(wrapper, 'MoodleConfig');
    expect(config.length).toBe(1);
  });

  it('should trigger onClick when cancelled', () => {
    const cancelButton = findByTestAttr(wrapper, 'cancelButton');
    expect(cancelButton.text().includes('Cancel')).toBe(true);
    cancelButton.simulate('click');
    expect(onClickMock.mock.calls.length).toBe(1);
  });

  it('button text should change when all fields are populated', () => {
    let submitButton = findByTestAttr(wrapper, 'submitButton');
    expect(submitButton.text().includes('Save Draft')).toBe(true);

    const config = findByTestAttr(wrapper, 'MoodleConfig');
    const form = findByTestAttr(config, 'form');
    findByTestAttr(form, 'moodleBaseUrl').simulate('change', { target: { value: 'testUrl' } });
    findByTestAttr(form, 'serviceShortName').simulate('change', { target: { value: 'testName' } });

    submitButton = findByTestAttr(wrapper, 'submitButton');
    expect(submitButton.text().includes('Submit')).toBe(true);
  });
});
