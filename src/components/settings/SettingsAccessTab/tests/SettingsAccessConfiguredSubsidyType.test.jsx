import React from 'react';
import {
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { axe } from 'jest-axe';
import SettingsAccessConfiguredSubsidyType from '../SettingsAccessConfiguredSubsidyType';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';
import { renderWithI18nProvider } from '../../../test/testUtils';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

describe('<SettingsAccessConfiguredSubsidyType />', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderWithI18nProvider(
      <SettingsAccessConfiguredSubsidyType subsidyType={SUPPORTED_SUBSIDY_TYPES.license} />,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders correctly', () => {
    renderWithI18nProvider(<SettingsAccessConfiguredSubsidyType subsidyType={SUPPORTED_SUBSIDY_TYPES.license} />);
    expect(screen.getByText('Licenses')).toBeInTheDocument();
  });
});
