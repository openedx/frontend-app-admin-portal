import React from 'react';
import renderer from 'react-test-renderer';

import RequestStatusCell from '../RequestStatusCell';

const defaultProps = {
  row: {
    original: {
      requestStatus: 'requested',
    },
  },
};

describe('RequestDateCell', () => {
  test('renders with "requested" status', () => {
    const tree = renderer
      .create(<RequestStatusCell {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders with "approved" status', () => {
    const props = {
      ...defaultProps,
      row: {
        original: {
          requestStatus: 'approved',
        },
      },
    };
    const tree = renderer
      .create(<RequestStatusCell {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders with "declined" status', () => {
    const props = {
      ...defaultProps,
      row: {
        original: {
          requestStatus: 'declined',
        },
      },
    };
    const tree = renderer
      .create(<RequestStatusCell {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
