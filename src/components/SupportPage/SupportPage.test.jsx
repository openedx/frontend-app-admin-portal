import React from 'react';
import renderer from 'react-test-renderer';

import SupportPage from './index';

describe('<SupportPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <SupportPage match={{ url: 'example.com' }} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
