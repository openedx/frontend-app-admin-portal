import React from 'react';
import renderer from 'react-test-renderer';

import EmailAddressCell from '../EmailAddressCell';

const defaultProps = {
  row: {
    original: {
      email: 'test@example.com',
    },
  },
};

describe('EmailAddressCell', () => {
  test('renders as expected', () => {
    const tree = renderer
      .create(<EmailAddressCell {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
