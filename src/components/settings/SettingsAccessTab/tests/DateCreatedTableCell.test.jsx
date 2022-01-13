import React from 'react';
import renderer from 'react-test-renderer';

import DateCreatedTableCell from '../DateCreatedTableCell';

describe('DateCreatedTableCell', () => {
  it('renders correctly', () => {
    const props = {
      row: {
        original: {
          created: '2022-01-10T12:00:00Z',
        },
      },
    };
    const tree = renderer
      .create(<DateCreatedTableCell {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
