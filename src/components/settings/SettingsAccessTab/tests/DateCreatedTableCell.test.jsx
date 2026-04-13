import React from 'react';
import renderer from 'react-test-renderer';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import DateCreatedTableCell from '../DateCreatedTableCell';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

describe('DateCreatedTableCell', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<DateCreatedTableCell row={{ original: { created: '2022-01-10T12:00:00Z' } }} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

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
