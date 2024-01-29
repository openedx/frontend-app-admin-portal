import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import SearchBar from './index';

describe('<SearchBar />', () => {
  let wrapper;

  it('renders correctly', () => {
    const { container: tree } = render(
      <SearchBar
        onSearch={() => {}}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('calls onSearch callback handler', () => {
    const mockOnSearchCallback = jest.fn();
    wrapper = render((
      <SearchBar
        onSearch={mockOnSearchCallback}
      />
    ));
    fireEvent.change(wrapper.container.querySelector('input[type="text"]'), { target: { value: 'foobar' } });
    fireEvent.submit(wrapper.container.querySelector('form'));
    expect(mockOnSearchCallback).toHaveBeenCalledTimes(1);
  });
});
