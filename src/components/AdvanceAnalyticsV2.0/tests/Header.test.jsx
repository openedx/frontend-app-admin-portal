import React from 'react';
import { shallow } from 'enzyme';
import Header from '../Header';

describe('Header', () => {
  it('renders correctly with both title and subtitle', () => {
    const wrapper = shallow(<Header title="Test Title" subtitle="Test Subtitle" />);
    expect(wrapper.find('.analytics-header-title').text()).toBe('Test Title');
    expect(wrapper.find('.analytics-header-subtitle').text()).toBe('Test Subtitle');
  });

  it('renders correctly with only the title', () => {
    const wrapper = shallow(<Header title="Test Title" />);
    expect(wrapper.find('.analytics-header-title').text()).toBe('Test Title');
    expect(wrapper.find('.analytics-header-subtitle').exists()).toBeFalsy();
  });
});
