import {
  render,
  waitFor,
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import * as hooks from './data/hooks';
import EnterpriseAppContextProvider from './EnterpriseAppContextProvider';
import * as subsidyRequestsContext from '../subsidy-requests/SubsidyRequestsContext';
import * as enterpriseSubsidiesContext from '../EnterpriseSubsidiesContext';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_NAME = 'test-enterprise-name';

jest.mock('./data/hooks');

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  userId: jest.fn(),
  email: jest.fn(),
}));

const mockEnterpriseFeatures = {
  topDownAssignmentRealTimeLcm: true,
};

describe('<EnterpriseAppContextProvider />', () => {
  it.each([{
    isLoadingEnterpriseSubsidies: true,
    isLoadingSubsidyRequests: false,
    isLoadingEnterpriseCuration: false,
  },
  {
    isLoadingEnterpriseSubsidies: false,
    isLoadingSubsidyRequests: true,
    isLoadingEnterpriseCuration: false,
  },
  {
    isLoadingEnterpriseSubsidies: false,
    isLoadingSubsidyRequests: false,
    isLoadingEnterpriseCuration: true,
  },
  {
    isLoadingEnterpriseSubsidies: true,
    isLoadingSubsidyRequests: true,
    isLoadingEnterpriseCuration: false,
  },
  {
    isLoadingEnterpriseSubsidies: true,
    isLoadingSubsidyRequests: true,
    isLoadingEnterpriseCuration: true,
  },
  ])('renders <EnterpriseAppSkeleton /> when: %s', async ({
    isLoadingEnterpriseSubsidies,
    isLoadingSubsidyRequests,
    isLoadingEnterpriseCuration,
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

    getAuthenticatedUser.mockReturnValue({
      userId: 90210,
      email: 'beverly@hills.com',
    });

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
      expect(mockUseSubsidyRequestsContext).toHaveBeenCalled();
      expect(mockUseEnterpriseSubsidiesContext).toHaveBeenCalled();
      expect(mockUseEnterpriseCurationContext).toHaveBeenCalled();

      if (isLoadingEnterpriseSubsidies || isLoadingSubsidyRequests || isLoadingEnterpriseCuration) {
        expect(screen.getByText('Loading...'));
      } else {
        expect(screen.getByText('children'));
      }
    });
  });
});
