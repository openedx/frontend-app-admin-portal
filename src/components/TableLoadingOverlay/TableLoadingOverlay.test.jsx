import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TableLoadingOverlay from '.';

describe('TableLoadingOverlay', () => {
  it('renders a loading overlay', () => {
    const tree = renderer
      .create((
        <IntlProvider locale="en">
          <TableLoadingOverlay />
        </IntlProvider>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
