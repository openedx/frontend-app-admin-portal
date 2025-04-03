import React from 'react';
import renderer from 'react-test-renderer';
import AdminCardsSkeleton from './AdminCardsSkeleton';

describe('AdminCardsSkeleton', () => {
  it('renders a skeleton', () => {
    const tree = renderer
      .create((
        <AdminCardsSkeleton />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
