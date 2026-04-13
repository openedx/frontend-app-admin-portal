import React from 'react';
import renderer from 'react-test-renderer';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import LinkTableCell from '../LinkTableCell';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => ({ ENTERPRISE_LEARNER_PORTAL_URL: 'http://localhost:8734' }),
}));

describe('LinkTableCell', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<LinkTableCell row={{ original: { uuid: 'test-uuid' } }} enterpriseSlug="test-enterprise" />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders correctly', () => {
    const props = {
      row: {
        original: {
          uuid: 'test-invite-key-uuid',
        },
      },
      enterpriseSlug: 'test-enterprise',
    };
    const tree = renderer
      .create(<LinkTableCell {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
