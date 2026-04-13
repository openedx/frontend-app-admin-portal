import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import TableLoadingOverlay from '.';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

describe('TableLoadingOverlay', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <TableLoadingOverlay />
      </IntlProvider>,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

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
