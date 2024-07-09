import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import NotFoundPage from './index';

describe('<NotFoundPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <IntlProvider locale="en">
          <NotFoundPage />
        </IntlProvider>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
