import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useEnterpriseGroupUuid } from '../../learner-credit-management/data';
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
  it('renders the GroupDetailPage', () => {
    render(<GroupDetailPageWrapper />);
    expect(screen.queryAllByText(TEST_GROUP.name)).toHaveLength(2);
    expect(screen.getByText('0 accepted members')).toBeInTheDocument();
    expect(screen.getByText('View group progress')).toBeInTheDocument();
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
    // toast message
    await waitFor(() => expect(screen.getByText('Group name updated')).toBeInTheDocument());
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
  it('delete flex group', async () => {
    const spy = jest.spyOn(LmsApiService, 'removeEnterpriseGroup');
    LmsApiService.removeEnterpriseGroup.mockResolvedValueOnce({ status: 404 });
    render(<GroupDetailPageWrapper />);
    const deleteGroupIcon = screen.getByTestId('delete-group-icon');
    deleteGroupIcon.click();

    expect(screen.getByText('Delete group')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.'));
    const deleteGroupButton = screen.getByTestId('delete-group-button');
    deleteGroupButton.click();

    await waitFor(() => expect(spy).toHaveBeenCalledWith(TEST_GROUP.uuid));
    // error modal
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });
});
