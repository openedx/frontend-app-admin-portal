import React from 'react';
import renderer from 'react-test-renderer';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import StatusTableCell from '../StatusTableCell';

const StatusTableCellWrapper = (props) => (
  <IntlProvider locale="en">
    <StatusTableCell {...props} />
  </IntlProvider>
);

describe('StatusTableCell', () => {
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
