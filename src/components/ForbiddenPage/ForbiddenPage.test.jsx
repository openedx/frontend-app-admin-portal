import React from 'react';
import renderer from 'react-test-renderer';

import ForbiddenPage from './index';

describe('<ForbiddenPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <ForbiddenPage />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
