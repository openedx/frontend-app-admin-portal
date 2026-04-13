import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import FeatureNotSupportedPage from './index';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

describe('<FeatureNotSupportedPage />', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <FeatureNotSupportedPage />
      </IntlProvider>,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

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
