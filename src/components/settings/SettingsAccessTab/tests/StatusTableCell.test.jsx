import React from 'react';
import renderer from 'react-test-renderer';

import StatusTableCell from '../StatusTableCell';

describe('StatusTableCell', () => {
  it('renders valid status correctly', () => {
    const props = {
      row: {
        original: {
          isValid: true,
        },
      },
    };
    const tree = renderer
      .create(<StatusTableCell {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders invalid status correctly', () => {
    const props = {
      row: {
        original: {
          isValid: false,
        },
      },
    };
    const tree = renderer
      .create(<StatusTableCell {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
