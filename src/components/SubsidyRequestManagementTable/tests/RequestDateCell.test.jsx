import React from 'react';
import renderer from 'react-test-renderer';

import RequestDateCell from '../RequestDateCell';

const defaultProps = {
  row: {
    original: {
      requestDate: '2019-12-03T21:39:24.395101Z',
    },
  },
};

describe('RequestDateCell', () => {
  test('renders as expected', () => {
    const tree = renderer
      .create(<RequestDateCell {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
