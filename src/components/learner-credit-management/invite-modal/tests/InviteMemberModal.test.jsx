import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';
import LmsApiService from '../../../../data/services/LmsApiService';
import {
  useBudgetId, useEnterpriseGroupLearners, useSubsidyAccessPolicy, useContentMetadata,
} from '../../data';
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
  useEnterpriseGroupLearners: jest.fn(),
  useContentMetadata: jest.fn(),
}));
jest.mock('../../../../data/services/LmsApiService');
jest.mock('../../../../data/services/EnterpriseCatalogApiService');

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    enableLearnerPortal: true,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
      enterpriseGroupsV1: true,
    },
  },
};

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
  initialState = initialStoreState,
  budgetDetailPageContextValue = defaultBudgetDetailPageContextValue,
}) => {
  const store = getMockStore({ ...initialState });
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <QueryClientProvider client={queryClient()}>
          <BudgetDetailPageContext.Provider value={budgetDetailPageContextValue}>
            <InviteMembersModalWrapper {...defaultProps} />
          </BudgetDetailPageContext.Provider>
        </QueryClientProvider>
      </Provider>
    </IntlProvider>
  );
};

describe('<InviteMemberModal />', () => {
  beforeEach(() => {
    useBudgetId.mockReturnValue({ subsidyAccessPolicyId: mockSubsidyAccessPolicy.uuid });
    useSubsidyAccessPolicy.mockReturnValue({
      data: mockSubsidyAccessPolicy,
      isLoading: false,
    });
    useContentMetadata.mockReturnValue({ data: { count: 5280 } });
    useEnterpriseGroupLearners.mockReturnValue({ data: { count: 3 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Modal renders as expected', async () => {
    render(<InviteModalWrapper />);
    expect(screen.getByText('New members')).toBeInTheDocument();
    expect(screen.getByText('Invite members to this budget')).toBeInTheDocument();
    expect(screen.getByText('Member email addresses')).toBeInTheDocument();
    expect(screen.getByText('Members are invited')).toBeInTheDocument();
    expect(screen.getByText('Newly invited members are immediately notified by email.')).toBeInTheDocument();
    expect(screen.getByText('Members can browse and learn')).toBeInTheDocument();
    expect(screen.getByText('Managing members')).toBeInTheDocument();
    // some dropdowns shouldn't be expanded
    expect(screen.queryByText('Members can be removed at any time from this budget\'s Members tab.')).not.toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Member permissions')).toBeInTheDocument();
    expect(screen.getByText('Browse this budget\'s catalog')).toBeInTheDocument();
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
  it('allows csv upload of emails', async () => {
    render(<InviteModalWrapper />);
    expect(screen.getByText('You haven\'t entered any members yet.')).toBeInTheDocument();
    expect(screen.getByText('Add member emails to get started.')).toBeInTheDocument();
    const inputTypeRadio = screen.getByLabelText('Upload CSV');
    expect(inputTypeRadio).toBeInTheDocument();
    fireEvent.click(inputTypeRadio);
    const fakeFile = new File(['tomhaverford@pawnee.org'], 'emails.csv', { type: 'text/csv' });

    expect(screen.getByText('Upload CSV files (Max 1MB)')).toBeInTheDocument();
    const dropzone = screen.getByText('Drag and drop your file here or click to upload.');
    Object.defineProperty(dropzone, 'files', {
      value: [fakeFile],
    });
    fireEvent.drop(dropzone);

    await waitFor(() => {
      expect(screen.getByText('emails.csv')).toBeInTheDocument();
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getByText('tomhaverford@pawnee.org')).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
  it('does not allow non-csv files', async () => {
    render(<InviteModalWrapper />);
    expect(screen.getByText('You haven\'t entered any members yet.')).toBeInTheDocument();
    expect(screen.getByText('Add member emails to get started.')).toBeInTheDocument();
    const inputTypeRadio = screen.getByLabelText('Upload CSV');
    expect(inputTypeRadio).toBeInTheDocument();
    fireEvent.click(inputTypeRadio);
    const fakeFile = new File(['tammiswanson@library.com'], 'emails.txt', { type: 'text/txt' });

    expect(screen.getByText('Upload CSV files (Max 1MB)')).toBeInTheDocument();
    const dropzone = screen.getByText('Drag and drop your file here or click to upload.');
    Object.defineProperty(dropzone, 'files', {
      value: [fakeFile],
    });
    fireEvent.drop(dropzone);
    await waitFor(() => {
      expect(screen.getByText('Invalid file type, only csv files allowed.')).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
  it('verifies emails uploaded from a csv', async () => {
    render(<InviteModalWrapper />);
    expect(screen.getByText('You haven\'t entered any members yet.')).toBeInTheDocument();
    expect(screen.getByText('Add member emails to get started.')).toBeInTheDocument();
    const inputTypeRadio = screen.getByLabelText('Upload CSV');
    expect(inputTypeRadio).toBeInTheDocument();
    fireEvent.click(inputTypeRadio);
    const fakeFile = new File(['tammiswanson'], 'emails.csv', { type: 'text/csv' });

    expect(screen.getByText('Upload CSV files (Max 1MB)')).toBeInTheDocument();
    const dropzone = screen.getByText('Drag and drop your file here or click to upload.');
    Object.defineProperty(dropzone, 'files', {
      value: [fakeFile],
    });
    fireEvent.drop(dropzone);

    await waitFor(() => {
      expect(screen.getByText('tammiswanson is not a valid email.')).toBeInTheDocument();
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
      expect(screen.getByText('oopsallberries@example.com was entered more than once.')).toBeInTheDocument();
      expect(screen.getByText('Only 1 invite per email address will be sent.')).toBeInTheDocument();
      const inviteButton = screen.getByRole('button', { name: 'Invite' });
      expect(inviteButton).not.toBeDisabled();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
});
