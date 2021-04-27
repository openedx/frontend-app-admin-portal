import React from 'react';
import renderer from 'react-test-renderer';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';

describe('EnterpriseAppSkeleton', () => {
  it('renders a skeleton', () => {
    const tree = renderer
      .create((
        <EnterpriseAppSkeleton />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
