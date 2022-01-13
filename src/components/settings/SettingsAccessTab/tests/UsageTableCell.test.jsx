import React from 'react';
import renderer from 'react-test-renderer';

import UsageTableCell from '../UsageTableCell';

describe('UsageTableCell', () => {
  it('renders correctly', () => {
    const props = {
      row: {
        original: {
          usageCount: 10,
          usageLimit: 100,
        },
      },
    };
    const tree = renderer
      .create(<UsageTableCell {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
