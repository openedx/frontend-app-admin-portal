import React from 'react';
import renderer from 'react-test-renderer';

import NotFoundPage from './index';

describe('<NotFoundPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <NotFoundPage />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
