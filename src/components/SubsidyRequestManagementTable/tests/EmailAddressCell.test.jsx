import React from 'react';
import renderer from 'react-test-renderer';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import EmailAddressCell from '../EmailAddressCell';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

const defaultProps = {
  row: {
    original: {
      email: 'test@example.com',
    },
  },
};

describe('EmailAddressCell', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<EmailAddressCell {...defaultProps} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  test('renders as expected', () => {
    const tree = renderer
      .create(<EmailAddressCell {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
