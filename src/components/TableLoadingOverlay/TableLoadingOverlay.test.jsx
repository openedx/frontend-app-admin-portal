import React from 'react';
import renderer from 'react-test-renderer';
import TableLoadingOverlay from '.';

describe('TableLoadingOverlay', () => {
  it('renders a loading overlay', () => {
    const tree = renderer
      .create((
        <TableLoadingOverlay />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
