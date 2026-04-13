import React from 'react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import ForbiddenPage from './index';
import '@testing-library/jest-dom/extend-expect';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

describe('<ForbiddenPage />', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <ForbiddenPage />
      </IntlProvider>,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders correctly', () => {
    render(
      <IntlProvider locale="en">
        <ForbiddenPage />
      </IntlProvider>,
    );
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('You do not have access to this page.')).toBeInTheDocument();
  });
});
