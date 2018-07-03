import React from 'react';
import renderer from 'react-test-renderer';

import FAQSupportPage from './index';

describe('<FAQSupportPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <FAQSupportPage />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
