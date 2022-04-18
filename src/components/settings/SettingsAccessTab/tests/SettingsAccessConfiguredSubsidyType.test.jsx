import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SettingsAccessConfiguredSubsidyType from '../SettingsAccessConfiguredSubsidyType';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';
import { SUBSIDY_TYPE_LABELS } from '../../data/constants';

describe('<SettingsAccessConfiguredSubsidyType />', () => {
  it('renders correctly', () => {
    const subsidyType = SUPPORTED_SUBSIDY_TYPES.license;
    render(<SettingsAccessConfiguredSubsidyType subsidyType={subsidyType} />);
    expect(screen.getByText(SUBSIDY_TYPE_LABELS[subsidyType])).toBeInTheDocument();
  });
});
