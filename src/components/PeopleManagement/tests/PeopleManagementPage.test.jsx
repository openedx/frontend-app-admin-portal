import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import PeopleManagementPage from '..';

const mockStore = configureMockStore([thunk]);
const getMockStore = (store) => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    enterpriseGroupsV2: true,
  },
};

const defaultEnterpriseSubsidiesContextValue = {
  enterpriseSubsidyTypes: ['budget'],
  isLoading: false,
};

const subsEnterpriseSubsidiesContextValue = {
  enterpriseSubsidyTypes: ['license'],
  isLoading: false,
};

const PeopleManagementPageWrapper = ({
  initialState = initialStoreState,
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
}) => {
  const store = getMockStore(initialState);
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
          <PeopleManagementPage />
        </EnterpriseSubsidiesContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

describe('<PeopleManagementPage >', () => {
  it('renders the PeopleManagementPage zero state', () => {
    render(<PeopleManagementPageWrapper />);
    expect(document.querySelector('h3').textContent).toEqual("Your organization's groups");
    expect(screen.getByText("You don't have any groups yet.")).toBeInTheDocument();
    expect(screen.getByText(
      'Monitor group learning progress, assign more courses, and invite members to new Learner Credit budgets.',
    )).toBeInTheDocument();
  });
  it('renders the PeopleManagementPage zero state without LC', () => {
    const store = getMockStore(initialStoreState);
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <EnterpriseSubsidiesContext.Provider value={subsEnterpriseSubsidiesContextValue}>
            <PeopleManagementPage />
          </EnterpriseSubsidiesContext.Provider>
        </Provider>
      </IntlProvider>,
    );
    expect(document.querySelector('h3').textContent).toEqual(
      "Your organization's groups",
    );
    expect(screen.getByText("You don't have any groups yet.")).toBeInTheDocument();
    expect(screen.getByText("Once a group is created, you can track members' progress.")).toBeInTheDocument();
  });
});
