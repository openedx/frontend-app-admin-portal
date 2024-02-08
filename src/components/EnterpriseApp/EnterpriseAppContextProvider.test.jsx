import {
  render,
  waitFor,
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as hooks from './data/hooks';
import EnterpriseAppContextProvider from './EnterpriseAppContextProvider';
import * as subsidyRequestsContext from '../subsidy-requests/SubsidyRequestsContext';
import * as enterpriseSubsidiesContext from '../EnterpriseSubsidiesContext';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_NAME = 'test-enterprise-name';

jest.mock('./data/hooks');

const mockEnterpriseFeatures = {
  topDownAssignmentRealTimeLcm: true,
};

describe('<EnterpriseAppContextProvider />', () => {
  it.each([{
    isLoadingEnterpriseSubsidies: true,
    isLoadingSubsidyRequests: false,
    isLoadingEnterpriseCuration: false,
    isLoadingUpdateActiveEnterpriseForUser: false,
  },
  {
    isLoadingEnterpriseSubsidies: false,
    isLoadingSubsidyRequests: true,
    isLoadingEnterpriseCuration: false,
    isLoadingUpdateActiveEnterpriseForUser: false,
  },
  {
    isLoadingEnterpriseSubsidies: false,
    isLoadingSubsidyRequests: false,
    isLoadingEnterpriseCuration: true,
    isLoadingUpdateActiveEnterpriseForUser: false,
  },
  {
    isLoadingEnterpriseSubsidies: true,
    isLoadingSubsidyRequests: true,
    isLoadingEnterpriseCuration: false,
    isLoadingUpdateActiveEnterpriseForUser: false,
  },
  {
    isLoadingEnterpriseSubsidies: false,
    isLoadingSubsidyRequests: false,
    isLoadingEnterpriseCuration: false,
    isLoadingUpdateActiveEnterpriseForUser: true,
  },
  {
    isLoadingEnterpriseSubsidies: true,
    isLoadingSubsidyRequests: true,
    isLoadingEnterpriseCuration: true,
    isLoadingUpdateActiveEnterpriseForUser: true,
  },
  ])('renders <EnterpriseAppSkeleton /> when: %s', async ({
    isLoadingEnterpriseSubsidies,
    isLoadingSubsidyRequests,
    isLoadingEnterpriseCuration,
    isLoadingUpdateActiveEnterpriseForUser,
  }) => {
    const mockUseEnterpriseSubsidiesContext = jest.spyOn(enterpriseSubsidiesContext, 'useEnterpriseSubsidiesContext').mockReturnValue({
      isLoading: isLoadingEnterpriseSubsidies,
    });
    const mockUseSubsidyRequestsContext = jest.spyOn(subsidyRequestsContext, 'useSubsidyRequestsContext').mockReturnValue(
      {
        isLoading: isLoadingSubsidyRequests,
      },
    );
    const mockUseEnterpriseCurationContext = jest.spyOn(hooks, 'useEnterpriseCurationContext').mockReturnValue(
      {
        isLoading: isLoadingEnterpriseCuration,
      },
    );
    const mockUseUpdateActiveEnterpriseForUser = jest.spyOn(hooks, 'useUpdateActiveEnterpriseForUser').mockReturnValue(
      {
        isLoading: isLoadingUpdateActiveEnterpriseForUser,
      },
    );

    render(
      <EnterpriseAppContextProvider
        enterpriseId={TEST_ENTERPRISE_UUID}
        enterpriseName={TEST_ENTERPRISE_NAME}
        enterpriseFeatures={mockEnterpriseFeatures}
        enablePortalLearnerCreditManagementScreen
      >
        children
      </EnterpriseAppContextProvider>,
    );

    await waitFor(() => {
      expect(mockUseUpdateActiveEnterpriseForUser).toHaveBeenCalled();
      expect(mockUseSubsidyRequestsContext).toHaveBeenCalled();
      expect(mockUseEnterpriseSubsidiesContext).toHaveBeenCalled();
      expect(mockUseEnterpriseCurationContext).toHaveBeenCalled();

      if (
        isLoadingEnterpriseSubsidies
        || isLoadingSubsidyRequests
        || isLoadingEnterpriseCuration
        || isLoadingUpdateActiveEnterpriseForUser
      ) {
        expect(screen.getByText('Loading...'));
      } else {
        expect(screen.getByText('children'));
      }
    });
  });
});
