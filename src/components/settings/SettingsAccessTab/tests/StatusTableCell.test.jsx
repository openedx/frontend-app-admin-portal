import React from 'react';
import renderer from 'react-test-renderer';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import StatusTableCell from '../StatusTableCell';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

const StatusTableCellWrapper = (props) => (
  <IntlProvider locale="en">
    <StatusTableCell {...props} />
  </IntlProvider>
);

describe('StatusTableCell', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<StatusTableCellWrapper row={{ original: { isValid: true } }} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders valid status correctly', () => {
    const props = {
      row: {
        original: {
          isValid: true,
        },
      },
    };
    const tree = renderer
      .create(<StatusTableCellWrapper {...props} />)
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
      .create(<StatusTableCellWrapper {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
