import React from 'react';
import renderer from 'react-test-renderer';

import SupportPage from './index';

describe('<SupportPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <SupportPage />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
