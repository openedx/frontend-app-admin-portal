import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import userEvent from '@testing-library/user-event';
import { useActiveSubscriptionUsers } from '../../subscriptions/data/hooks';

import { ADD_LEARNERS_TITLE } from './constants';
import BulkEnrollContextProvider from '../BulkEnrollmentContext';
import AddLearnersStep, { LINK_TEXT, TABLE_HEADERS } from './AddLearnersStep';
import { renderWithRouter } from '../../test/testUtils';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';

jest.mock('../../subscriptions/data/hooks', () => ({
  useActiveSubscriptionUsers: jest.fn(),
}));

const mockTableData = {
  results: [],
  count: 0,
};

useActiveSubscriptionUsers.mockReturnValue([mockTableData, false]);

const defaultProps = {
  subscriptionUUID: 'fakest-uuid',
  enterpriseSlug: 'sluggiest',
};

const StepperWrapper = (props) => (
  <BulkEnrollContextProvider>
    <AddLearnersStep {...props} />
  </BulkEnrollContextProvider>
);

describe('AddLearnersStep', () => {
  it('displays a title', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(ADD_LEARNERS_TITLE)).toBeInTheDocument();
  });
  it('displays a table', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    Object.values(TABLE_HEADERS).forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });
  it('displays a table skeleton when loading', () => {
    useActiveSubscriptionUsers.mockReturnValue([mockTableData, true]);
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByTestId('skelly')).toBeInTheDocument();
  });
  it('links leaners to subscription management', () => {
    const { history } = renderWithRouter(<StepperWrapper {...defaultProps} />);
    const link = screen.getByText(LINK_TEXT);
    userEvent.click(link);
    expect(history.location.pathname).toEqual(`/${defaultProps.enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${defaultProps.subscriptionUUID}`);
  });
  it('allows search by email', () => {
    useActiveSubscriptionUsers.mockReturnValue([mockTableData, false]);
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText('Search Email')).toBeInTheDocument();
  });
});
