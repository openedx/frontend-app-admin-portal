import React from 'react';
import {
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SettingsAccessConfiguredSubsidyType from '../SettingsAccessConfiguredSubsidyType';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';
import { renderWithI18nProvider } from '../../../test/testUtils';

describe('<SettingsAccessConfiguredSubsidyType />', () => {
  it('renders correctly', () => {
    renderWithI18nProvider(<SettingsAccessConfiguredSubsidyType subsidyType={SUPPORTED_SUBSIDY_TYPES.license} />);
    expect(screen.getByText('Licenses')).toBeInTheDocument();
  });
});
