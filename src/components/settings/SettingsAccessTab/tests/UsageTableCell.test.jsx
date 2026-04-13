import React from 'react';
import renderer from 'react-test-renderer';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import UsageTableCell from '../UsageTableCell';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

describe('UsageTableCell', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<UsageTableCell row={{ original: { usageCount: 10, usageLimit: 100 } }} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

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
