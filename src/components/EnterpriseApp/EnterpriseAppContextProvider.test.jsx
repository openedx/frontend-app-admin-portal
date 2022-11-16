import {
  render,
  waitFor,
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EnterpriseAppContextProvider from './EnterpriseAppContextProvider';
import * as subsidyRequestsContext from '../subsidy-requests/SubsidyRequestsContext';
import * as enterpriseSubsidiesContext from '../EnterpriseSubsidiesContext';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_NAME = 'test-enterprise-name';

describe('<EnterpriseAppContextProvider />', () => {
  it.each([{
    isLoadingEnterpriseSubsidies: false,
    isLoadingSubsidyRequests: true,
  },
  {
    isLoadingEnterpriseSubsidies: true,
    isLoadingSubsidyRequests: false,
  },
  {
    isLoadingEnterpriseSubsidies: false,
    isLoadingSubsidyRequests: false,
  },
  ])('renders <EnterpriseAppSkeleton /> if loading', async ({
    isLoadingEnterpriseSubsidies,
    isLoadingSubsidyRequests,
  }) => {
    const mockUseEnterpriseSubsidiesContext = jest.spyOn(enterpriseSubsidiesContext, 'useEnterpriseSubsidiesContext').mockReturnValue({
      isLoading: isLoadingEnterpriseSubsidies,
    });
    const mockUseSubsidyRequestsContext = jest.spyOn(subsidyRequestsContext, 'useSubsidyRequestsContext').mockReturnValue(
      {
        isLoading: isLoadingSubsidyRequests,
      },
    );

    render(
      <EnterpriseAppContextProvider
        enterpriseId={TEST_ENTERPRISE_UUID}
        enterpriseName={TEST_ENTERPRISE_NAME}
        enablePortalLearnerCreditManagementScreen
      >
        children
      </EnterpriseAppContextProvider>,
    );

    await waitFor(() => {
      expect(mockUseSubsidyRequestsContext).toHaveBeenCalled();
      expect(mockUseEnterpriseSubsidiesContext).toHaveBeenCalled();

      if (isLoadingEnterpriseSubsidies || isLoadingSubsidyRequests) {
        expect(screen.getByText('Loading...'));
      } else {
        expect(screen.getByText('children'));
      }
    });
  });
});
