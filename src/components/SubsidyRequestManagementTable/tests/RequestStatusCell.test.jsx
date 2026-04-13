import React from 'react';
import renderer from 'react-test-renderer';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import RequestStatusCell from '../RequestStatusCell';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

const defaultProps = {
  row: {
    original: {
      requestStatus: 'requested',
    },
  },
};

describe('RequestStatusCell', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<RequestStatusCell {...defaultProps} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

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
