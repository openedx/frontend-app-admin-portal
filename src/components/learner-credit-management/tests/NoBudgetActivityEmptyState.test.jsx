import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useParams, useRouteMatch } from 'react-router-dom';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import NoBudgetActivityEmptyState from '../NoBudgetActivityEmptyState';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: jest.fn(),
  useParams: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    enableLearnerPortal: true,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
  },
};
const store = getMockStore({ ...initialStoreState });

const NoBudgetActivityEmptyStateWrapper = () => (
  <Provider store={store}>
    <NoBudgetActivityEmptyState />
  </Provider>
);

describe('<NoBudgetActivityEmptyState />', async () => {
  it('renders', async () => {
    useParams.mockReturnValue({
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useRouteMatch.mockReturnValue({
      path: '/',
    });
    renderWithRouter(<NoBudgetActivityEmptyStateWrapper />);

    userEvent.click(screen.getByText('Get started'));
    await waitFor(() => expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1));
  });
});
