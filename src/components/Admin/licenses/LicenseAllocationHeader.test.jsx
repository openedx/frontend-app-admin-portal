import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import LicenseAllocationHeader from './LicenseAllocationHeader';
import { SubscriptionDetailContext } from '../../subscriptions/SubscriptionDetailContextProvider';
import { SubsidyRequestsContext } from '../../subsidy-requests';

// eslint-disable-next-line react/jsx-no-constructed-context-values
describe('LicenseAllocationHeader', () => {
  const mockStore = configureMockStore();

  // eslint-disable-next-line react/prop-types
  const SubscriptionDetailContextWrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <SubscriptionDetailContext.Provider value={{
      subscription: {
        licenses: {
          unassigned: 1,
          total: 2,
          activated: 1,
          assigned: 1,
        },
      },
    }}
    >
      {children}
    </SubscriptionDetailContext.Provider>
  );

  // eslint-disable-next-line react/prop-types
  const SubsidyRequestsContextWrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <SubsidyRequestsContext.Provider value={{
      subsidyRequests: {
        count: 1,
        results: [
          {
            uuid: '123',
            status: 'approved',
            enterprise_customer_name: 'Test Enterprise',
            enterprise_customer_uuid: '456',
            num_licenses: 1,
            start_date: '2020-01-01',
            expiration_date: '2020-01-01',
            subscription_plan_title: 'Test Plan',
            subscription_plan_uuid: '789',
            user_email: 'edx@example.com',
            user_account_uuid: '101112',
          },
        ],
      },
      subsidyRequestConfiguration: {
        subsidyType: 'license',
        subsidyRequestsEnabled: true,
      },
    }}
    >
      {children}
    </SubsidyRequestsContext.Provider>
  );

  const LicenseAllocationHeaderWrapper = () => (
    <Provider store={mockStore({})}>
      <MemoryRouter>
        <SubscriptionDetailContextWrapper>
          <SubsidyRequestsContextWrapper>
            <LicenseAllocationHeader />
          </SubsidyRequestsContextWrapper>
        </SubscriptionDetailContextWrapper>
      </MemoryRouter>
    </Provider>
  );

  it('renders without crashing', () => {
    const tree = renderer.create(<LicenseAllocationHeaderWrapper />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
