import React from 'react';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';

import LicenseManagementUserBadge from '../LicenseManagementUserBadge';
import {
  ASSIGNED,
  ACTIVATED,
  REVOKED,
} from '../../../data/constants';

const variants = [
  { userStatus: ACTIVATED, label: 'Active' },
  { userStatus: ASSIGNED, label: 'Pending' },
  { userStatus: REVOKED, label: 'Revoked' },
];

describe('<LicenseManagementUserBadge />', () => {
  afterEach(() => {
    cleanup();
  });

  test.each(variants)('display right badge for variant %p', (variant) => {
    render(<LicenseManagementUserBadge userStatus={variant.userStatus} />);
    expect(screen.getByText(variant.label)).toBeTruthy();
  });
});
