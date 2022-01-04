import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

import SearchBar from './index';

describe('<SearchBar />', () => {
  let wrapper;

  it('renders correctly', () => {
    const tree = renderer
      .create((
        <SearchBar
          onSearch={() => {}}
        />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onSearch callback handler', () => {
    const mockOnSearchCallback = jest.fn();
    wrapper = mount((
      <SearchBar
        onSearch={mockOnSearchCallback}
      />
    ));
    wrapper.find('input[type="text"]').simulate('change', { target: { value: 'foobar' } });
    wrapper.find('form').simulate('submit');
    expect(mockOnSearchCallback).toHaveBeenCalledTimes(1);
  });
});
