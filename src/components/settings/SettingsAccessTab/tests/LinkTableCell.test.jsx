import React from 'react';
import renderer from 'react-test-renderer';

import LinkTableCell from '../LinkTableCell';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => ({ ENTERPRISE_LEARNER_PORTAL_URL: 'http://localhost:8734' }),
}));

describe('LinkTableCell', () => {
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
