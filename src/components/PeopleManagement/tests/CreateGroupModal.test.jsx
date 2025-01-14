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
import { queryClient } from '../../test/testUtils';
import LmsApiService from '../../../data/services/LmsApiService';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY } from '../../learner-credit-management/cards/data';
import CreateGroupModal from '../CreateGroupModal';
import {
  useEnterpriseLearnersTableData,
  useGetAllEnterpriseLearnerEmails,
} from '../data/hooks/useEnterpriseLearnersTableData';
import { useEnterpriseLearners } from '../../learner-credit-management/data';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));
jest.mock('../../../data/services/LmsApiService');
jest.mock('../data/hooks/useEnterpriseLearnersTableData', () => ({
  ...jest.requireActual('../data/hooks/useEnterpriseLearnersTableData'),
  useEnterpriseLearnersTableData: jest.fn(),
  useGetAllEnterpriseLearnerEmails: jest.fn(),
}));
jest.mock('../../learner-credit-management/data', () => ({
  ...jest.requireActual('../../learner-credit-management/data'),
  useEnterpriseLearners: jest.fn(),
}));

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
      enterpriseGroupsV2: true,
    },
  },
};

const defaultProps = {
  isModalOpen: true,
  closeModal: jest.fn(),
  enterpriseUUID: 'test-uuid',
};

const mockTabledata = {
  itemCount: 3,
  pageCount: 1,
  results: [
    {
      id: 1,
      user: {
        id: 1,
        username: 'testuser-1',
        firstName: '',
        lastName: '',
        email: 'testuser-1@2u.com',
        dateJoined: '2023-05-09T16:18:22Z',
      },
    },
    {
      id: 2,
      user: {
        id: 2,
        username: 'testuser-2',
        firstName: '',
        lastName: '',
        email: 'testuser-2@2u.com',
        dateJoined: '2023-05-09T16:18:22Z',
      },
    },
    {
      id: 3,
      user: {
        id: 3,
        username: 'testuser-3',
        firstName: '',
        lastName: '',
        email: 'testuser-3@2u.com',
        dateJoined: '2023-05-09T16:18:22Z',
      },
    },
  ],
};
const CreateGroupModalWrapper = ({
  initialState = initialStoreState,
}) => {
  const store = getMockStore({ ...initialState });
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <QueryClientProvider client={queryClient()}>
          <CreateGroupModal {...defaultProps} />
        </QueryClientProvider>
      </Provider>
    </IntlProvider>
  );
};

describe('<CreateGroupModal />', () => {
  beforeEach(() => {
    useEnterpriseLearnersTableData.mockReturnValue({
      isLoading: false,
      enterpriseCustomerUserTableData: mockTabledata,
      fetchEnterpriseLearnersData: jest.fn(),
    });
    useGetAllEnterpriseLearnerEmails.mockReturnValue({
      isLoading: false,
      fetchLearnerEmails: jest.fn(),
      addButtonState: 'complete',
    });
    useEnterpriseLearners.mockReturnValue({
      allEnterpriseLearners: ['testuser-3@2u.com', 'testuser-2@2u.com', 'testuser-1@2u.com', 'tomhaverford@pawnee.org'],
    });
  });
  it('Modal renders as expected', async () => {
    render(<CreateGroupModalWrapper />);
    expect(screen.getByText('Create a custom group')).toBeInTheDocument();
    expect(screen.getByText('Name your group')).toBeInTheDocument();
    expect(screen.getByText('Select group members')).toBeInTheDocument();
    expect(screen.getByText('Upload a CSV or select members from the table below.')).toBeInTheDocument();
    expect(screen.getByText('You haven\'t uploaded any members yet.')).toBeInTheDocument();
    expect(screen.getByText('Upload a CSV file or select members to get started.')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // renders datatable
    expect(screen.getByText('Member details')).toBeInTheDocument();
    expect(screen.getByText('Joined organization')).toBeInTheDocument();
    expect(screen.getByText('testuser-1')).toBeInTheDocument();
    expect(screen.getByText('testuser-1@2u.com')).toBeInTheDocument();
    expect(screen.getByText('testuser-2')).toBeInTheDocument();
    expect(screen.getByText('testuser-2@2u.com')).toBeInTheDocument();
    expect(screen.getByText('testuser-3')).toBeInTheDocument();
    expect(screen.getByText('testuser-3@2u.com')).toBeInTheDocument();
  });
  it('creates groups and assigns learners', async () => {
    const mockCreateGroup = jest.spyOn(LmsApiService, 'createEnterpriseGroup');
    const mockInvite = jest.spyOn(LmsApiService, 'inviteEnterpriseLearnersToGroup');

    const mockGroupData = { uuid: 'test-uuid' };
    LmsApiService.createEnterpriseGroup.mockResolvedValue({ status: 201, data: mockGroupData });

    const mockInviteData = { records_processed: 1, new_learners: 1, existing_learners: 0 };
    LmsApiService.inviteEnterpriseLearnersToGroup.mockResolvedValue(mockInviteData);

    render(<CreateGroupModalWrapper />);
    expect(screen.getByText('You haven\'t uploaded any members yet.')).toBeInTheDocument();
    expect(screen.getByText('Upload a CSV file or select members to get started.')).toBeInTheDocument();
    const fakeFile = new File(['tomhaverford@pawnee.org'], 'emails.csv', { type: 'text/csv' });
    const dropzone = screen.getByText('Drag and drop your file here or click to upload.');
    Object.defineProperty(dropzone, 'files', {
      value: [fakeFile],
    });
    fireEvent.drop(dropzone);
    const groupNameInput = screen.getByTestId('group-name');
    userEvent.type(groupNameInput, 'test group name');

    await waitFor(() => {
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getByText('tomhaverford@pawnee.org')).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    // testing interaction with adding members from the datatable
    const membersCheckbox = screen.getAllByTitle('Toggle row selected');
    userEvent.click(membersCheckbox[0]);
    userEvent.click(membersCheckbox[1]);
    const addMembersButton = screen.getByText('Add');
    userEvent.click(addMembersButton);

    await waitFor(() => {
      expect(screen.getByText('Summary (3)')).toBeInTheDocument();
      // checking that each user appears twice, once in the datatable and once in the summary section
      expect(screen.getAllByText('testuser-1@2u.com')).toHaveLength(2);
      expect(screen.getAllByText('testuser-2@2u.com')).toHaveLength(2);
    });

    // testing interaction with removing members from the datatable
    const removeMembersButton = screen.getByText('Remove');
    userEvent.click(removeMembersButton);

    await waitFor(() => {
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getByText('emails.csv')).toBeInTheDocument();
      expect(screen.getByText('Total members to add')).toBeInTheDocument();
      expect(screen.getByText('tomhaverford@pawnee.org')).toBeInTheDocument();
      expect(screen.getAllByText('testuser-1@2u.com')).toHaveLength(1);
      expect(screen.getAllByText('testuser-2@2u.com')).toHaveLength(1);
      expect(screen.getAllByText('testuser-3@2u.com')).toHaveLength(1);
      const formFeedbackText = 'Maximum members at a time: 1000';
      expect(screen.queryByText(formFeedbackText)).not.toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    const createButton = screen.getByRole('button', { name: 'Create' });
    userEvent.click(createButton);
    expect(mockCreateGroup).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockInvite).toHaveBeenCalledTimes(1);
    });
  });
  it('displays error for email not belonging in an org', async () => {
    const mockGroupData = { uuid: 'test-uuid' };
    LmsApiService.createEnterpriseGroup.mockResolvedValue({ status: 201, data: mockGroupData });

    const mockInviteData = { records_processed: 1, new_learners: 1, existing_learners: 0 };
    LmsApiService.inviteEnterpriseLearnersToGroup.mockResolvedValue(mockInviteData);
    useEnterpriseLearners.mockReturnValue({
      allEnterpriseLearners: ['testuser-3@2u.com'],
    });
    render(<CreateGroupModalWrapper />);
    const groupNameInput = screen.getByTestId('group-name');
    userEvent.type(groupNameInput, 'test group name');
    const fakeFile = new File(['tomhaverford@pawnee.org'], 'emails.csv', { type: 'text/csv' });
    const dropzone = screen.getByText('Drag and drop your file here or click to upload.');
    Object.defineProperty(dropzone, 'files', {
      value: [fakeFile],
    });
    fireEvent.drop(dropzone);
    await waitFor(() => {
      expect(screen.getByText(/Some people can't be added/i)).toBeInTheDocument();
      expect(/tomhaverford@pawnee.org email address is not available to be added to a group./i);
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
  it('displays system error modal', async () => {
    const mockCreateGroup = jest.spyOn(LmsApiService, 'createEnterpriseGroup');
    const mockInvite = jest.spyOn(LmsApiService, 'inviteEnterpriseLearnersToGroup');
    const error = new Error('An error occurred');
    mockCreateGroup.mockRejectedValueOnce(error);
    mockInvite.mockRejectedValueOnce(error);

    render(<CreateGroupModalWrapper />);
    const fakeFile = new File(['tomhaverford@pawnee.org'], 'emails.csv', { type: 'text/csv' });
    const dropzone = screen.getByText('Drag and drop your file here or click to upload.');
    Object.defineProperty(dropzone, 'files', {
      value: [fakeFile],
    });
    fireEvent.drop(dropzone);
    await waitFor(() => {
      expect(screen.getByText('emails.csv')).toBeInTheDocument();
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getByText('Total members to add')).toBeInTheDocument();
      expect(screen.getByText('tomhaverford@pawnee.org')).toBeInTheDocument();
      const formFeedbackText = 'Maximum members at a time: 1000';
      expect(screen.queryByText(formFeedbackText)).not.toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    const groupNameInput = screen.getByTestId('group-name');
    expect(groupNameInput).toBeInTheDocument();
    userEvent.type(groupNameInput, 'test group name');
    const createButton = screen.getByRole('button', { name: 'Create' });
    userEvent.click(createButton);
    await waitFor(() => {
      expect(screen.getByText(
        'We\'re sorry. Something went wrong behind the scenes. Please try again, or reach out to customer support for help.',
      )).toBeInTheDocument();
    });
  });
});
