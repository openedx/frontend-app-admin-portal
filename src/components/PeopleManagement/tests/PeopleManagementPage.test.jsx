import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import PeopleManagementPage from '..';

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    enterpriseGroupsV2: true,
  },
};

const PeopleManagementPageWrapper = ({
  initialState = initialStoreState,
}) => {
  const store = getMockStore(initialState);
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <PeopleManagementPage />
      </Provider>
    </IntlProvider>
  );
};

describe('<PeopleManagementPage >', () => {
  it('renders the PeopleManagementPage zero state', () => {
    render(<PeopleManagementPageWrapper />);
    expect(document.querySelector('h3').textContent).toEqual(
      'Your Learner Credit groups',
    );
    expect(screen.getByText('You don\'t have any groups yet.')).toBeInTheDocument();
  });
});
