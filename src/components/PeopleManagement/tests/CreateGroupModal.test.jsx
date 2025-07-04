import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { queryClient } from '../../test/testUtils';
import LmsApiService from '../../../data/services/LmsApiService';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY } from '../../learner-credit-management/cards/data';
import CreateGroupModal from '../CreateGroupModal';
import { useEnterpriseLearners } from '../../learner-credit-management/data';
import { useEnterpriseMembersTableData } from '../data/hooks';
import EVENT_NAMES from '../../../eventTracking';
import ValidatedEmailsContextProvider from '../data/ValidatedEmailsContextProvider';
import { ERROR_LEARNER_NOT_IN_ORG } from '../constants';

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useEnterpriseMembersTableData: jest.fn(),
}));
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));
const mockInvalidateQueries = jest.fn();
useQueryClient.mockReturnValue({
  invalidateQueries: mockInvalidateQueries,
});
jest.mock('../../../data/services/LmsApiService');
jest.mock('../../learner-credit-management/data', () => ({
  ...jest.requireActual('../../learner-credit-management/data'),
  useEnterpriseLearners: jest.fn(),
}));
jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

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
    },
  },
};

const defaultProps = {
  isModalOpen: true,
  closeModal: jest.fn(),
  onInviteError: jest.fn(),
  enterpriseUUID: 'test-uuid',
};

const mockTabledata = {
  itemCount: 3,
  pageCount: 1,
  results: [
    {
      enterpriseCustomerUser: {
        userId: 1,
        name: 'Test User 1',
        email: 'testuser-1@2u.com',
        joinedOrg: 'July 5, 2021',
      },
    },
    {
      enterpriseCustomerUser: {
        userId: 2,
        name: 'Test User 2',
        email: 'testuser-2@2u.com',
        joinedOrg: 'July 2, 2022',
      },
    },
    {
      enterpriseCustomerUser: {
        userId: 3,
        name: 'Test User 3',
        email: 'testuser-3@2u.com',
        joinedOrg: 'July 3, 2023',
      },
    },
    {
      enterpriseCustomerUser: {
        userId: 4,
        name: 'Non-lowercased User Email',
        email: 'testUser-NonLowercase@2u.com',
        joinedOrg: 'July 4, 2024',
      },
    },
  ],
};

const CreateGroupModalWrapper = (isCreateGroupListSelection = false, isCreateGroupFileUploaded = false) => {
  const store = getMockStore({ ...initialStoreState });
  const initialContextOverride = {
    groupEnterpriseLearners: mockTabledata.results.map((user) => user.email),
    isCreateGroupListSelection,
    isCreateGroupFileUploaded,
  };
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <QueryClientProvider client={queryClient()}>
          <ValidatedEmailsContextProvider initialContextOverride={initialContextOverride}>
            <CreateGroupModal {...defaultProps} />
          </ValidatedEmailsContextProvider>
        </QueryClientProvider>
      </Provider>
    </IntlProvider>
  );
};

describe('<CreateGroupModal />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseMembersTableData.mockReturnValue({
      isLoading: false,
      enterpriseMembersTableData: mockTabledata,
      fetchEnterpriseMembersTableData: jest.fn(),
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
    expect(screen.getByText('Only members registered with your organization can be added to a group.')).toBeInTheDocument();
    expect(screen.getByText('Learn more.').getAttribute('href')).toBe('https://enterprise-support.edx.org/s/topic/0TORc000000GBQvOAO/admin-experience');
    // renders datatable
    expect(screen.getByText('Member details')).toBeInTheDocument();
    expect(screen.getByText('Joined organization')).toBeInTheDocument();
    expect(screen.getByText('Test User 1')).toBeInTheDocument();
    expect(screen.getByText('testuser-1@2u.com')).toBeInTheDocument();
    expect(screen.getByText('Test User 2')).toBeInTheDocument();
    expect(screen.getByText('testuser-2@2u.com')).toBeInTheDocument();
    expect(screen.getByText('Test User 3')).toBeInTheDocument();
    expect(screen.getByText('testuser-3@2u.com')).toBeInTheDocument();
  });
  it('creates groups and assigns learners', async () => {
    const user = userEvent.setup();
    const mockCreateGroup = jest.spyOn(LmsApiService, 'createEnterpriseGroup');
    const mockInvite = jest.spyOn(LmsApiService, 'inviteEnterpriseLearnersToGroup');

    const mockGroupData = { uuid: 'test-uuid' };
    LmsApiService.createEnterpriseGroup.mockResolvedValue({ status: 201, data: mockGroupData });

    const mockInviteData = { records_processed: 1, new_learners: 1, existing_learners: 0 };
    LmsApiService.inviteEnterpriseLearnersToGroup.mockResolvedValue(mockInviteData);

    render(<CreateGroupModalWrapper isCreateGroupFileUploaded isCreateGroupListSelection />);
    expect(screen.getByText('You haven\'t uploaded any members yet.')).toBeInTheDocument();
    expect(screen.getByText('Upload a CSV file or select members to get started.')).toBeInTheDocument();
    const fakeFile = new File(['tomhaverford@pawnee.org'], 'emails.csv', { type: 'text/csv' });
    const dropzone = await screen.findByTestId('csv-upload-input');

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [fakeFile],
        types: ['Files'],
      },
    });

    const groupNameInput = screen.getByTestId('group-name');
    await user.type(groupNameInput, 'test group name');

    await waitFor(() => {
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getByText('tomhaverford@pawnee.org')).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    // testing interaction with adding members from the datatable
    let membersCheckboxes = screen.getAllByRole('checkbox');

    await user.click(membersCheckboxes[0]);
    await user.click(membersCheckboxes[1]);

    await waitFor(() => {
      expect(screen.getByText('Summary (3)')).toBeInTheDocument();
      // checking that each user appears twice, once in the datatable and once in the summary section
      expect(screen.getAllByText('testuser-1@2u.com')).toHaveLength(2);
      expect(screen.getAllByText('testuser-2@2u.com')).toHaveLength(2);
    });

    // testing interaction with removing members from the datatable
    membersCheckboxes = screen.getAllByRole('checkbox');

    await user.click(membersCheckboxes[0]);
    await user.click(membersCheckboxes[1]);

    await waitFor(() => {
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getByText('Total members to add')).toBeInTheDocument();
      expect(screen.getByText('tomhaverford@pawnee.org')).toBeInTheDocument();
      expect(screen.getAllByText('testuser-1@2u.com')).toHaveLength(1);
      expect(screen.getAllByText('testuser-2@2u.com')).toHaveLength(1);
      expect(screen.getAllByText('testuser-3@2u.com')).toHaveLength(1);
      const formFeedbackText = 'Maximum members at a time: 1000';
      expect(screen.queryByText(formFeedbackText)).not.toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    const createButton = screen.getByRole('button', { name: 'Create' });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateGroup).toHaveBeenCalledTimes(1);
      expect(mockInvite).toHaveBeenCalledTimes(1);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.CREATE_GROUP_MODAL_BUTTON_SUBMIT,
        { status: 'success' },
      );
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.GROUP_CREATE_WITH_CSV_AND_LIST,
      );
    });
  });
  it('only sends tracking event for group creation with list selection', async () => {
    const user = userEvent.setup();
    const mockGroupData = { uuid: 'test-uuid' };
    LmsApiService.createEnterpriseGroup.mockResolvedValue({ status: 201, data: mockGroupData });

    const mockInviteData = { records_processed: 1, new_learners: 1, existing_learners: 0 };
    LmsApiService.inviteEnterpriseLearnersToGroup.mockResolvedValue(mockInviteData);

    render(<CreateGroupModalWrapper />);
    const groupNameInput = screen.getByTestId('group-name');
    await user.type(groupNameInput, 'test group name');

    const membersCheckbox = screen.getAllByTitle('Toggle Row Selected');
    await user.click(membersCheckbox[0]);
    await user.click(membersCheckbox[1]);

    const createButton = screen.getByRole('button', { name: 'Create' });
    await user.click(createButton);
    await waitFor(() => {
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.GROUP_CREATE_WITH_LIST_SELECTION,
      );
    });
  });
  it('only sends tracking event for group creation with csv upload', async () => {
    const user = userEvent.setup();
    const mockGroupData = { uuid: 'test-uuid' };
    LmsApiService.createEnterpriseGroup.mockResolvedValue({ status: 201, data: mockGroupData });

    const mockInviteData = { records_processed: 1, new_learners: 1, existing_learners: 0 };
    LmsApiService.inviteEnterpriseLearnersToGroup.mockResolvedValue(mockInviteData);

    render(<CreateGroupModalWrapper />);
    expect(screen.getByText('You haven\'t uploaded any members yet.')).toBeInTheDocument();
    expect(screen.getByText('Upload a CSV file or select members to get started.')).toBeInTheDocument();
    const fakeFile = new File(['tomhaverford@pawnee.org'], 'emails.csv', { type: 'text/csv' });
    const dropzone = await screen.findByTestId('csv-upload-input');

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [fakeFile],
        types: ['Files'],
      },
    });
    const groupNameInput = screen.getByTestId('group-name');
    await user.type(groupNameInput, 'test group name');

    await waitFor(() => {
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getByText('tomhaverford@pawnee.org')).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    const createButton = screen.getByRole('button', { name: 'Create' });
    await user.click(createButton);
    await waitFor(() => {
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.GROUP_CREATE_WITH_UPLOAD_CSV,
      );
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['learner-credit-management', 'group', '1234'] });
  });
  it('removes and re-adds user from csv file', async () => {
    const user = userEvent.setup();
    const mockGroupData = { uuid: 'test-uuid' };
    LmsApiService.createEnterpriseGroup.mockResolvedValue({ status: 201, data: mockGroupData });

    const mockInviteData = { records_processed: 1, new_learners: 1, existing_learners: 0 };
    LmsApiService.inviteEnterpriseLearnersToGroup.mockResolvedValue(mockInviteData);

    render(<CreateGroupModalWrapper />);
    const fakeFile = new File(['testuser-1@2u.com\ntestuser-2@2u.com'], 'emails.csv', { type: 'text/csv' });
    const dropzone = await screen.findByTestId('csv-upload-input');

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [fakeFile],
        types: ['Files'],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Summary (2)')).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    // testing interaction with removing members from the datatable
    const membersCheckboxes = screen.getAllByRole('checkbox');
    await user.click(membersCheckboxes[0]);

    await waitFor(() => {
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getAllByText('testuser-1@2u.com')).toHaveLength(1);
      expect(screen.getAllByText('testuser-2@2u.com')).toHaveLength(2);
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    const dropzone2 = await screen.findByTestId('csv-upload-input');

    fireEvent.drop(dropzone2, {
      dataTransfer: {
        files: [fakeFile],
        types: ['Files'],
      },
    });

    const groupNameInput = screen.getByTestId('group-name');
    await user.type(groupNameInput, 'test group name');

    await waitFor(() => {
      expect(screen.getByText('Summary (2)')).toBeInTheDocument();
      expect(screen.getAllByText('testuser-1@2u.com')).toHaveLength(2);
      expect(screen.getAllByText('testuser-2@2u.com')).toHaveLength(2);
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
  it('should clear errors from bad csv file after uploading good csv file', async () => {
    const user = userEvent.setup();
    render(<CreateGroupModalWrapper />);
    const fakeFile = new File(['iamnotanemail'], 'bademails.csv', { type: 'text/csv' });
    const dropzone = await screen.findByTestId('csv-upload-input');

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [fakeFile],
        types: ['Files'],
      },
    });

    await waitFor(() => {
      // expect(screen.getByText('bademails.csv')).toBeInTheDocument();
      expect(screen.getByText("Members can't be invited as entered.")).toBeInTheDocument();
      expect(screen.getByText('iamnotanemail is not a valid email.')).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    const fakeFile2 = new File(['testuser-1@2u.com'], 'goodemails.csv', { type: 'text/csv' });
    const dropzone2 = await screen.findByTestId('csv-upload-input');

    fireEvent.drop(dropzone2, {
      dataTransfer: {
        files: [fakeFile2],
        types: ['Files'],
      },
    });

    const groupNameInput = screen.getByTestId('group-name');
    await user.type(groupNameInput, 'test group name');

    await waitFor(() => {
      // expect(screen.getByText('goodemails.csv')).toBeInTheDocument();
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getAllByText('testuser-1@2u.com')).toHaveLength(2);
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
    expect(screen.queryByText("Members can't be invited as entered.")).not.toBeInTheDocument();
    expect(screen.queryByText('iamnotanemail is not a valid email.')).not.toBeInTheDocument();
  });
  it('callback for error toast triggered when invitees not part of org', async () => {
    const mockGroupData = { uuid: 'test-uuid' };
    LmsApiService.createEnterpriseGroup.mockResolvedValue({ status: 201, data: mockGroupData });

    const mockInviteData = {
      data: {
        records_processed: 0,
        new_learners: 0,
        existing_learners: 0,
        non_org_rejected: 1,
      },
    };
    LmsApiService.inviteEnterpriseLearnersToGroup.mockResolvedValue(mockInviteData);

    render(<CreateGroupModalWrapper />);
    const fakeFile = new File(['tomhavenotford@pawnee.org'], 'emails.csv', { type: 'text/csv' });
    const dropzone = screen.getByText('Drag and drop your file here or click to upload.');
    Object.defineProperty(dropzone, 'files', {
      value: [fakeFile],
    });
    fireEvent.drop(dropzone);
    const groupNameInput = screen.getByTestId('group-name');
    userEvent.type(groupNameInput, 'test group name');

    await waitFor(() => {
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getByText('tomhavenotford@pawnee.org')).toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    const createButton = screen.getByRole('button', { name: 'Create' });
    userEvent.click(createButton);
    await waitFor(() => {
      expect(defaultProps.onInviteError).toHaveBeenCalledWith(ERROR_LEARNER_NOT_IN_ORG);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.ADD_LEARNER_ERROR_NOT_IN_ORG,
      );
    });
  });
  it('displays system error modal', async () => {
    const user = userEvent.setup();
    const mockCreateGroup = jest.spyOn(LmsApiService, 'createEnterpriseGroup');
    const mockInvite = jest.spyOn(LmsApiService, 'inviteEnterpriseLearnersToGroup');
    const error = new Error('An error occurred');
    mockCreateGroup.mockRejectedValueOnce(error);
    mockInvite.mockRejectedValueOnce(error);

    render(<CreateGroupModalWrapper />);
    const fakeFile = new File(['tomhaverford@pawnee.org'], 'emails.csv', { type: 'text/csv' });
    const dropzone = await screen.findByTestId('csv-upload-input');

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [fakeFile],
        types: ['Files'],
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getByText('Total members to add')).toBeInTheDocument();
      expect(screen.getByText('tomhaverford@pawnee.org')).toBeInTheDocument();
      const formFeedbackText = 'Maximum members at a time: 1000';
      expect(screen.queryByText(formFeedbackText)).not.toBeInTheDocument();
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    const groupNameInput = screen.getByTestId('group-name');
    expect(groupNameInput).toBeInTheDocument();
    await user.type(groupNameInput, 'test group name');
    const createButton = screen.getByRole('button', { name: 'Create' });
    await user.click(createButton);
    await waitFor(() => {
      expect(screen.getByText(
        'We\'re sorry. Something went wrong behind the scenes. Please try again, or reach out to customer support for help.',
      )).toBeInTheDocument();
    });
  });
  it('does not show duplicate error when members are bulk added multiple times', async () => {
    const user = userEvent.setup();
    render(<CreateGroupModalWrapper />);
    // testing interaction with adding members from the datatable
    const membersCheckboxes = screen.getAllByRole('checkbox');
    await user.click(membersCheckboxes[0]);
    // Select a second member while keeping first selected, and add again
    await user.click(membersCheckboxes[1]);

    await waitFor(() => {
      expect(screen.getAllByText('testuser-1@2u.com')).toHaveLength(2);
      expect(screen.getAllByText('testuser-2@2u.com')).toHaveLength(2);
    });
    expect(screen.queryByText('Only 1 invite per email address will be sent.')).not.toBeInTheDocument();
  });
  it('can add/remove members with non-lowercased emails', async () => {
    const user = userEvent.setup();
    const mockGroupData = { uuid: 'test-uuid' };
    LmsApiService.createEnterpriseGroup.mockResolvedValue({ status: 201, data: mockGroupData });

    const mockInviteData = { records_processed: 1, new_learners: 1, existing_learners: 0 };
    LmsApiService.inviteEnterpriseLearnersToGroup.mockResolvedValue(mockInviteData);

    render(<CreateGroupModalWrapper />);
    const groupNameInput = screen.getByTestId('group-name');
    await user.type(groupNameInput, 'test group name');

    // Add non-lowercased member
    const membersCheckbox = screen.getAllByTitle('Toggle Row Selected');
    await user.click(membersCheckbox[3]);

    await waitFor(() => {
      expect(screen.getByText('Summary (1)')).toBeInTheDocument();
      expect(screen.getAllByText('testUser-NonLowercase@2u.com')).toHaveLength(2);
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });

    // Remove non-lowercased member
    await user.click(membersCheckbox[3]);

    await waitFor(() => {
      expect(screen.queryByText('Summary (1)')).not.toBeInTheDocument();
      expect(screen.getAllByText('testUser-NonLowercase@2u.com')).toHaveLength(1);
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
});
