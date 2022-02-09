import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr } from '../../../../utils';

import SAPConfig from '../LMSConfigs/SAPConfig';

describe('<SAPConfig />', () => {
  let wrapper;
  let onClickMock;
  beforeEach(() => {
    onClickMock = jest.fn();
    const props = {
      id: 'test-enterprise-id',
      onClick: onClickMock,
    };
    wrapper = shallow(<SAPConfig {...props} />);
  });

  it('renders without errors', () => {
    const config = findByTestAttr(wrapper, 'SAPConfig');
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

    const config = findByTestAttr(wrapper, 'SAPConfig');
    const form = findByTestAttr(config, 'form');
    findByTestAttr(form, 'clientId').simulate('change', { target: { value: 'testId' } });
    findByTestAttr(form, 'sapBaseUrl').simulate('change', { target: { value: 'testUrl' } });
    findByTestAttr(form, 'sapCompanyId').simulate('change', { target: { value: 'testId' } });
    findByTestAttr(form, 'sapUserId').simulate('change', { target: { value: 'testId' } });
    findByTestAttr(form, 'sapClientId').simulate('change', { target: { value: 'testId' } });
    findByTestAttr(form, 'sapClientSecret').simulate('change', { target: { value: 'testSecret' } });
    findByTestAttr(form, 'sapUserType').simulate('change', { target: { value: 'testUser' } });

    submitButton = findByTestAttr(wrapper, 'submitButton');
    expect(submitButton.text().includes('Submit')).toBe(true);
  });
});
