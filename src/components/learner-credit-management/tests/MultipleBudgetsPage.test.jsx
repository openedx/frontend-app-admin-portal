/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {
  screen,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import MultipleBudgetsPage from '../MultipleBudgetsPage';
import { queryClient } from '../../test/testUtils';
import { useEnterpriseBudgets } from '../../EnterpriseSubsidiesContext/data/hooks';

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseId = 'test-enterprise-uuid';
const enterpriseSlug = 'test-enterprise-slug';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug,
    enableLearnerPortal: true,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
    enablePortalLearnerCreditManagementScreen: true,
  },
};
jest.mock('../../EnterpriseSubsidiesContext/data/hooks', () => ({
  ...jest.requireActual('../../EnterpriseSubsidiesContext/data/hooks'),
  useEnterpriseBudgets: jest.fn().mockReturnValue({
    data: {
      budgets: [{
        source: 'subsidy',
        id: '392f1fe1-ee91-4f44-b174-13ecf59866eb',
        name: 'Subsidy 2 for Executive Education (2U) Integration QA',
        start: '2023-06-07T15:38:29Z',
        end: '2024-06-07T15:38:30Z',
        isCurrent: true,
      },
      ],
    },
  }),
}));

const store = getMockStore({ ...initialStore });
const enterpriseUUID = '1234';

const emptyOffersContextValue = {
  budgets: [], // Empty offers array
};

const defaultEnterpriseSubsidiesContextValue = {};
const MultipleBudgetsPageWrapper = ({
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  ...rest
}) => (
  <QueryClientProvider client={queryClient()}>
    <Provider store={store}>
      <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
        <MultipleBudgetsPage {...rest} />
      </EnterpriseSubsidiesContext.Provider>
    </Provider>
  </QueryClientProvider>
);

describe('<MultipleBudgetsPage />', () => {
  it('No budgets for your organization', () => {
    useEnterpriseBudgets.mockReturnValueOnce(
      { data: { budgets: [] } },
    );
    render(<MultipleBudgetsPageWrapper
      enterpriseUUID={enterpriseUUID}
      enterpriseSlug={enterpriseId}
      enterpriseSubsidiesContextValue={emptyOffersContextValue}
    />);
    expect(screen.getByText('No budgets for your organization'));
    expect(screen.getByText('Contact support'));
  });
  it('budgets for your organization', () => {
    render(<MultipleBudgetsPageWrapper enterpriseUUID={enterpriseUUID} enterpriseSlug={enterpriseId} />);
    expect(screen.getByText('Budgets'));
  });
  it('Shows loading spinner', () => {
    const enterpriseSubsidiesContextValue = {
      ...defaultEnterpriseSubsidiesContextValue,
      isLoading: true,
    };
    render(<MultipleBudgetsPageWrapper
      enterpriseUUID={enterpriseUUID}
      enterpriseSlug={enterpriseSlug}
      enterpriseSubsidiesContextValue={enterpriseSubsidiesContextValue}
    />);
    expect(screen.getByText('Loading budgets...')).toBeInTheDocument();
  });
});
