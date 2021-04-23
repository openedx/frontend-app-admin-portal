import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useSubscriptionFromParams } from '../subscriptions/data/contextHooks';
import { BaseCourseSearch } from './CourseSearch';
import { renderWithRouter } from '../test/testUtils';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

jest.mock('react-instantsearch-dom', () => ({
  ...jest.requireActual('react-instantsearch-dom'),
  InstantSearch: () => <div>INSTANTLY SEARCH</div>,
}));

jest.mock('../subscriptions/data/contextHooks', () => ({
  useSubscriptionFromParams: jest.fn(),
}));

const defaultProps = {
  enterpriseId: 'foo',
  enterpriseSlug: 'fancyCompany',
  enterpriseName: 'So Fancy',
  match: {},
};

const fakeSubscription = {
  enterpriseCatalogUuid: 'bestCatalog',
};

describe('<BaseCourseSearch />', () => {
  it('renders the instant search component', () => {
    useSubscriptionFromParams.mockReturnValue([fakeSubscription, false]);
    renderWithRouter(<BaseCourseSearch {...defaultProps} />);
    screen.getByText('INSTANTLY SEARCH');
  });
  it('shows a loading screen ', () => {
    useSubscriptionFromParams.mockReturnValue([null, true]);
    renderWithRouter(<BaseCourseSearch {...defaultProps} />);
    expect(screen.getByTestId('skelly')).toBeInTheDocument();
  });
  it('redirects to the subscription choosing page if there is no subscription', () => {
    useSubscriptionFromParams.mockReturnValue([null, false]);
    const { history } = renderWithRouter(<BaseCourseSearch {...defaultProps} />);
    expect(history.location.pathname).toEqual(`/${defaultProps.enterpriseSlug}/admin/${ROUTE_NAMES.bulkEnrollment}/`);
  });
});
