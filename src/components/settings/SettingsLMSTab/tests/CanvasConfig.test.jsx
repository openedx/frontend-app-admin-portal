import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr } from '../../../../utils';

import CanvasConfig from '../LMSConfigs/CanvasConfig';

describe('<CanvasConfig />', () => {
  let wrapper;
  let onClickMock;
  beforeEach(() => {
    onClickMock = jest.fn();
    const props = {
      id: 'test-enterprise-id',
      onClick: onClickMock,
    };
    wrapper = shallow(<CanvasConfig {...props} />);
  });

  it('renders without errors', () => {
    const config = findByTestAttr(wrapper, 'CanvasConfig');
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

    const config = findByTestAttr(wrapper, 'CanvasConfig');
    const form = findByTestAttr(config, 'form');
    findByTestAttr(form, 'clientId').simulate('change', { target: { value: 'testId' } });
    findByTestAttr(form, 'clientSecret').simulate('change', { target: { value: 'testSecret' } });
    findByTestAttr(form, 'canvasAccountNum').simulate('change', { target: { value: 'testNum' } });
    findByTestAttr(form, 'canvasBaseUrl').simulate('change', { target: { value: 'testUrl' } });

    submitButton = findByTestAttr(wrapper, 'submitButton');
    expect(submitButton.text().includes('Submit')).toBe(true);
  });
});
