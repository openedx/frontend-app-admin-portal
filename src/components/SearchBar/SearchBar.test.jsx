import React from 'react';
import renderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react';

import SearchBar from './index';

describe('<SearchBar />', () => {
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
    const { container } = render((
      <SearchBar
        onSearch={mockOnSearchCallback}
      />
    ));
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: 'foobar' } });
    const form = container.querySelector('input');
    fireEvent.submit(form);
    expect(mockOnSearchCallback).toHaveBeenCalledTimes(1);
  });
});
