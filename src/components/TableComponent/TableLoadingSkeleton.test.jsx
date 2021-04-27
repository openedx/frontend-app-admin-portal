import React from 'react';
import renderer from 'react-test-renderer';
import TableLoadingSkeleton from './TableLoadingSkeleton';

describe('TableLoadingSkeleton', () => {
  it('renders a skeleton', () => {
    const tree = renderer
      .create((
        <TableLoadingSkeleton />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
