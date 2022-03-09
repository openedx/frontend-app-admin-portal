import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';

import SubscriptionSubsidyRequests from '../SubscriptionSubsidyRequests';
import { useSubsidyRequests } from '../../SubsidyRequestManagementTable';

jest.mock('../../SubsidyRequestManagementTable', () => ({
  __esModule: true, // this property makes it work
  default: () => <div>SubsidyRequestManagementTable</div>,
  useSubsidyRequests: jest.fn(),
}));

const enterpriseId = 'test-enterprise';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const store = getMockStore({ ...initialStore });

const SubsidySubsidyRequestsWithRouter = ({
  store: storeProp,
}) => (
  <Provider store={storeProp}>
    <SubscriptionSubsidyRequests />
  </Provider>
);

SubsidySubsidyRequestsWithRouter.propTypes = {
  store: PropTypes.shape(),
};

SubsidySubsidyRequestsWithRouter.defaultProps = {
  store,
};

describe('<SubscriptionSubsidyRequests />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders subscription plan routes', () => {
    // useSubsidyRequests.mockImplementation(() => )
    render(<SubsidySubsidyRequestsWithRouter />);
    // expect(screen.getByText(SUBSCRIPTION_PLAN_ROUTES_MOCK_CONTENT));
    screen.debug();
    expect(true).toEqual(false);
  });
});
