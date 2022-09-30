import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import ExistingLMSCardDeck from '../ExistingLMSCardDeck';

const enterpriseCustomerUuid = 'test-enterprise-id';
const mockEditExistingConfigFn = jest.fn();
const mockOnClick = jest.fn();

const configData = [
  {
    channelCode: 'BLACKBOARD',
    id: 1,
    isValid: [{ missing: [] }, { incorrect: [] }],
    active: true,
    displayName: 'foobar',
  },
];

describe('<ExistingLMSCardDeck />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getAuthenticatedUser.mockReturnValue({
      administrator: true,
    });
  });
  it('opens error reporting modal', () => {
    render(
      <IntlProvider locale="en">
        <ExistingLMSCardDeck
          configData={configData}
          editExistingConfig={mockEditExistingConfigFn}
          onClick={mockOnClick}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>,
    );
    userEvent.click(screen.queryByText('View sync history'));
    expect(screen.getByText('foobar Sync History')).toBeInTheDocument();

    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByText('Course key')).toBeInTheDocument();
    expect(screen.getByText('Sync status')).toBeInTheDocument();
    expect(screen.getByText('Sync attempt time')).toBeInTheDocument();
  });
});
