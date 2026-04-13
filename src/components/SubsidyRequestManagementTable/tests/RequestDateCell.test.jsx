import React from 'react';
import renderer from 'react-test-renderer';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import RequestDateCell from '../RequestDateCell';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

const defaultProps = {
  row: {
    original: {
      requestDate: '2019-12-03T21:39:24.395101Z',
    },
  },
};

describe('RequestDateCell', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<RequestDateCell {...defaultProps} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  test('renders as expected', () => {
    const tree = renderer
      .create(<RequestDateCell {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
