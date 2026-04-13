import React from 'react';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';

import { axe } from 'jest-axe';
import LicenseManagementUserBadge from '../LicenseManagementUserBadge';
import {
  ASSIGNED,
  ACTIVATED,
  REVOKED,
} from '../../../data/constants';
import { accessibilitySettings } from '../../../../../../tests/accessibility-settings';

const variants = [
  { userStatus: ACTIVATED, label: 'Active' },
  { userStatus: ASSIGNED, label: 'Pending' },
  { userStatus: REVOKED, label: 'Revoked' },
];

describe('<LicenseManagementUserBadge />', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<LicenseManagementUserBadge userStatus="activated" />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  afterEach(() => {
    cleanup();
  });

  test.each(variants)('display right badge for variant %p', (variant) => {
    render(<LicenseManagementUserBadge userStatus={variant.userStatus} />);
    expect(screen.getByText(variant.label)).toBeTruthy();
  });
});
