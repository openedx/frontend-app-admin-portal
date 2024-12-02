import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import FeatureNotSupportedPage from './index';

describe('<FeatureNotSupportedPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <IntlProvider locale="en">
          <FeatureNotSupportedPage />
        </IntlProvider>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
