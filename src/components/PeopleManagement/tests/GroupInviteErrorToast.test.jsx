import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';

import GroupInviteErrorToast from '../GroupInviteErrorToast';
import { ERROR_LEARNER_NOT_IN_ORG } from '../constants';

const DEFAULT_PROPS = {
  isOpen: true,
  errorType: ERROR_LEARNER_NOT_IN_ORG,
  closeToast: jest.fn,
};

const GroupInviteErrorToastWrapper = props => (
  <IntlProvider locale="en">
    <GroupInviteErrorToast {...props} />
  </IntlProvider>
);

describe('DownloadCSVButton', () => {
  it('renders unlinked learner errors.', async () => {
    render(<GroupInviteErrorToastWrapper {...DEFAULT_PROPS} />);
    const expectedMsg = 'Looks like some learners aren’t linked to your organization. '
      + 'Please make sure they are associated with a subsidy before adding them to a group.';

    // Validate button text
    expect(screen.getByText(expectedMsg)).toBeInTheDocument();
  });
});
