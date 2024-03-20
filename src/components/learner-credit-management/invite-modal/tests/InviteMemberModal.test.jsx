import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { QueryClientProvider } from '@tanstack/react-query';

import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';
import LmsApiService from '../../../../data/services/LmsApiService';
import { useBudgetId, useSubsidyAccessPolicy } from '../../data';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY } from '../../cards/data';

import { queryClient } from '../../../test/testUtils';

import InviteMembersModalWrapper from '../InviteMembersModalWrapper';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useBudgetId: jest.fn(),
  useSubsidyAccessPolicy: jest.fn(),
}));
jest.mock('../../../../data/services/LmsApiService');

const mockSubsidyAccessPolicy = {
  uuid: 'test-subsidy-access-policy-uuid',
  displayName: 'Test Subsidy Access Policy',
  assignmentConfiguration: {
    uuid: 'test-assignment-configuration-uuid',
    active: true,
  },
  aggregates: {
    spendAvailableUsd: 50000,
  },
  groupAssociations: ['test-group-uuid'],
};

const mockDisplaySuccessfulInvitationToast = jest.fn();
const defaultBudgetDetailPageContextValue = {
  successfulInvitationToast: {
    isSuccessfulInvitationToastOpen: false,
    totalLearnersInvited: undefined,
    displayToastForInvitation: mockDisplaySuccessfulInvitationToast,
    closeToastForInvitation: jest.fn(),
  },
};

const mockLearnerEmails = ['hello@example.com', 'world@example.com', 'dinesh@example.com'];
const defaultProps = {
  isOpen: true,
  close: jest.fn(),
};

const InviteModalWrapper = ({
  budgetDetailPageContextValue = defaultBudgetDetailPageContextValue,
}) => (
  <QueryClientProvider client={queryClient()}>
    <BudgetDetailPageContext.Provider value={budgetDetailPageContextValue}>
      <InviteMembersModalWrapper {...defaultProps} />
    </BudgetDetailPageContext.Provider>
  </QueryClientProvider>
);

describe('<InviteMemberModal />', () => {
  beforeEach(() => {
    useBudgetId.mockReturnValue({ subsidyAccessPolicyId: mockSubsidyAccessPolicy.uuid });
    useSubsidyAccessPolicy.mockReturnValue({
      data: mockSubsidyAccessPolicy,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Modal renders as expected', async () => {
    render(<InviteModalWrapper />);
    expect(screen.getByText('New members')).toBeInTheDocument();
    expect(screen.getByText('Invite members to this budget')).toBeInTheDocument();
    expect(screen.getByText('Member email addresses')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
  it('allows manual input of emails', async () => {
    render(<InviteModalWrapper />);
    expect(screen.getByText('You haven\'t entered any members yet.')).toBeInTheDocument();
    expect(screen.getByText('Add member emails to get started.')).toBeInTheDocument();
    const textareaInputLabel = screen.getByLabelText('Member email addresses');
    expect(textareaInputLabel).toBeInTheDocument();
    const textareaInput = textareaInputLabel.closest('textarea');
    expect(textareaInput).toBeInTheDocument();

    userEvent.type(textareaInput, mockLearnerEmails.join('{enter}'));
    expect(textareaInput).toHaveValue(mockLearnerEmails.join('\n'));
    await waitFor(() => {
      expect(screen.getByText(`Summary (${mockLearnerEmails.length})`)).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
  it('invite calls assign-learners api and renders toast', async () => {
    const mockInvite = jest.spyOn(LmsApiService, 'inviteEnterpriseLearnersToGroup');
    const mockData = { records_processed: 3, new_learners: 3, existing_learners: 0 };
    LmsApiService.inviteEnterpriseLearnersToGroup.mockResolvedValue({ status: 201, data: mockData });

    render(<InviteModalWrapper />);
    const textareaInputLabel = screen.getByLabelText('Member email addresses');
    const textareaInput = textareaInputLabel.closest('textarea');
    userEvent.type(textareaInput, mockLearnerEmails.join('{enter}'));
    expect(textareaInput).toHaveValue(mockLearnerEmails.join('\n'));
    await waitFor(() => {
      expect(screen.getByText(`Summary (${mockLearnerEmails.length})`)).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    const inviteButton = screen.getByRole('button', { name: 'Invite' });
    expect(inviteButton).not.toBeDisabled();
    userEvent.click(inviteButton);
    expect(mockInvite).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockDisplaySuccessfulInvitationToast).toHaveBeenCalledTimes(1);
      expect(mockDisplaySuccessfulInvitationToast).toHaveBeenCalledWith({
        totalLearnersInvited: 3,
      });
    });
  });
  it('throws up errors for incorrectly formatted emails', async () => {
    render(<InviteModalWrapper />);
    const textareaInputLabel = screen.getByLabelText('Member email addresses');
    const textareaInput = textareaInputLabel.closest('textarea');
    userEvent.type(textareaInput, 'sillygoosethisisntanemail');
    await waitFor(() => {
      expect(screen.getByText('Members can\'t be invited as entered.')).toBeInTheDocument();
      expect(screen.getByText('Please check your member emails and try again.')).toBeInTheDocument();
      expect(screen.getByText('sillygoosethisisntanemail is not a valid email.')).toBeInTheDocument();
      const inviteButton = screen.getByRole('button', { name: 'Invite' });
      expect(inviteButton).toBeDisabled();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
  it('throws up warning for duplicated emails', async () => {
    render(<InviteModalWrapper />);
    const textareaInputLabel = screen.getByLabelText('Member email addresses');
    const textareaInput = textareaInputLabel.closest('textarea');
    userEvent.type(textareaInput, 'oopsallberries@example.com');
    userEvent.type(textareaInput, '{enter}');
    userEvent.type(textareaInput, 'oopsallberries@example.com');
    await waitFor(() => {
      expect(screen.getByText('oopsallberries@example.com has been entered more than once.')).toBeInTheDocument();
      const inviteButton = screen.getByRole('button', { name: 'Invite' });
      expect(inviteButton).not.toBeDisabled();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
});
