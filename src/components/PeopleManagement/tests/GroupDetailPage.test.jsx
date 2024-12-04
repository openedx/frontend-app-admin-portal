import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useEnterpriseGroupUuid } from '../../learner-credit-management/data';
import { useEnterpriseGroupLearnersTableData } from '../data/hooks';
import GroupDetailPage from '../GroupDetailPage';
import LmsApiService from '../../../data/services/LmsApiService';

const TEST_ENTERPRISE_SLUG = 'test-enterprise';
const enterpriseUUID = '1234';
const TEST_GROUP = {
  name: 'engineering team',
  uuid: '12345',
  acceptedMembersCount: 0,
  groupType: 'flex',
};
const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);

jest.mock('../../learner-credit-management/data', () => ({
  ...jest.requireActual('../../learner-credit-management/data'),
  useEnterpriseGroupUuid: jest.fn(),
  useEnterpriseGroupLearnersTableData: jest.fn(),
}));
jest.mock('../../../data/services/LmsApiService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    enterpriseSlug: TEST_ENTERPRISE_SLUG,
    groupUuid: TEST_GROUP.uuid,
  }),
}));

const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug: TEST_ENTERPRISE_SLUG,
    enterpriseGroupsV2: true,
  },
};

const GroupDetailPageWrapper = ({
  initialState = initialStoreState,
}) => {
  const store = getMockStore(initialState);
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <GroupDetailPage />
      </Provider>
    </IntlProvider>
  );
};

describe('<GroupDetailPageWrapper >', () => {
  beforeEach(() => {
    useEnterpriseGroupUuid.mockReturnValue({ data: TEST_GROUP });
  });
  it('renders the GroupDetailPage', async () => {
    const mockFetchEnterpriseGroupLearnersTableData = jest.fn();
    useEnterpriseGroupLearnersTableData.mockReturnValue({
      fetchEnterpriseGroupLearnersTableData: mockFetchEnterpriseGroupLearnersTableData,
      isLoading: false,
      enterpriseGroupLearnersTableData: {
        count: 1,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [{
          activatedAt: '2024-11-06T21:01:32.953901Z',
          enterprise_group_membership_uuid: TEST_GROUP,
          memberDetails: {
            userEmail: 'test@2u.com',
            userName: 'Test 2u',
          },
          recentAction: 'Accepted: November 06, 2024',
          status: 'accepted',
          enrollments: 1,
        }],
      },
    });
    render(<GroupDetailPageWrapper />);
    expect(screen.queryAllByText(TEST_GROUP.name)).toHaveLength(2);
    expect(screen.getByText('0 accepted members')).toBeInTheDocument();
    expect(screen.getByText('View group progress')).toBeInTheDocument();
    expect(screen.getByText('Add and remove group members.')).toBeInTheDocument();
    expect(screen.getByText('Test 2u')).toBeInTheDocument();
    userEvent.click(screen.getByText('Member details'));
    await waitFor(() => expect(mockFetchEnterpriseGroupLearnersTableData).toHaveBeenCalledWith({
      filters: [],
      pageIndex: 0,
      pageSize: 10,
      sortBy: [{ desc: true, id: 'memberDetails' }],
    }));

    userEvent.click(screen.getByTestId('members-table-enrollments-column-header'));
    await waitFor(() => expect(mockFetchEnterpriseGroupLearnersTableData).toHaveBeenCalledWith({
      filters: [],
      pageIndex: 0,
      pageSize: 10,
      sortBy: [{ desc: false, id: 'enrollmentCount' }],
    }));
  });
  it('edit flex group name', async () => {
    const spy = jest.spyOn(LmsApiService, 'updateEnterpriseGroup');
    LmsApiService.updateEnterpriseGroup.mockResolvedValueOnce({ status: 200 });
    render(<GroupDetailPageWrapper />);
    const editGroupNameIcon = screen.getByTestId('edit-modal-icon');
    editGroupNameIcon.click();

    expect(screen.getByText('Edit group name')).toBeInTheDocument();
    const input = screen.getByTestId('group name input');
    act(() => {
      fireEvent.change(input, { target: { value: 'new name!' } });
    });
    await waitFor(() => expect(screen.getByTestId('group name input')).toHaveValue('new name!'));
    screen.getByText('Save').click();

    const formData = { name: 'new name!' };
    await waitFor(() => expect(spy).toHaveBeenCalledWith(TEST_GROUP.uuid, formData));
  });
  it('edit flex group name error', async () => {
    const spy = jest.spyOn(LmsApiService, 'updateEnterpriseGroup');
    LmsApiService.updateEnterpriseGroup.mockResolvedValueOnce({ status: 404 });
    render(<GroupDetailPageWrapper />);
    const editGroupNameIcon = screen.getByTestId('edit-modal-icon');
    editGroupNameIcon.click();

    expect(screen.getByText('Edit group name')).toBeInTheDocument();
    const input = screen.getByTestId('group name input');
    act(() => {
      fireEvent.change(input, { target: { value: 'new name!' } });
    });
    await waitFor(() => expect(screen.getByTestId('group name input')).toHaveValue('new name!'));
    screen.getByText('Save').click();

    const formData = { name: 'new name!' };
    await waitFor(() => expect(spy).toHaveBeenCalledWith(TEST_GROUP.uuid, formData));
    // error modal
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });
  it('delete flex group', async () => {
    const spy = jest.spyOn(LmsApiService, 'removeEnterpriseGroup');
    LmsApiService.removeEnterpriseGroup.mockResolvedValueOnce({ status: 204 });
    render(<GroupDetailPageWrapper />);
    const deleteGroupIcon = screen.getByTestId('delete-group-icon');
    deleteGroupIcon.click();

    expect(screen.getByText('Delete group')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.'));
    const deleteGroupButton = screen.getByTestId('delete-group-button');
    deleteGroupButton.click();

    await waitFor(() => expect(spy).toHaveBeenCalledWith(TEST_GROUP.uuid));
  });
  it('delete flex group error', async () => {
    const mockRemoveGroup = jest.spyOn(LmsApiService, 'removeEnterpriseGroup');
    mockRemoveGroup.mockRejectedValue({
      customAttributes: {
        httpErrorStatus: 404,
      },
    });
    render(<GroupDetailPageWrapper />);
    const deleteGroupIcon = screen.getByTestId('delete-group-icon');
    deleteGroupIcon.click();

    expect(screen.getByText('Delete group')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.'));
    const deleteGroupButton = screen.getByTestId('delete-group-button');
    deleteGroupButton.click();

    await waitFor(() => expect(mockRemoveGroup).toHaveBeenCalledWith(TEST_GROUP.uuid));
    // error modal
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });
});
