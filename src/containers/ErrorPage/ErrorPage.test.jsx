import React from 'react';
import renderer from 'react-test-renderer';

import ErrorPage from './index';

describe('<ErrorPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <ErrorPage />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
