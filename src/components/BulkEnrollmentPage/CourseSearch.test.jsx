import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useSubscriptionFromParams } from '../subscriptions/data/contextHooks';
import { BaseCourseSearch } from './CourseSearch';
import { renderWithRouter } from '../test/testUtils';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { ADD_COURSES_TITLE } from './stepper/constants';
import '../../../__mocks__/react-instantsearch-dom';

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
  uuid: 'fancy-uuid',
};

describe('<BaseCourseSearch />', () => {
  it('renders bulk enrollment stepper', () => {
    useSubscriptionFromParams.mockReturnValue([fakeSubscription, false]);
    renderWithRouter(<BaseCourseSearch {...defaultProps} />);
    expect(screen.getAllByText(ADD_COURSES_TITLE)).toHaveLength(2);
  });
  it('shows a loading screen ', () => {
    useSubscriptionFromParams.mockReturnValue([null, true]);
    renderWithRouter(<BaseCourseSearch {...defaultProps} />);
    expect(screen.getByTestId('subscription-skelly')).toBeInTheDocument();
  });
  it('redirects to the subscription choosing page if there is no subscription', () => {
    useSubscriptionFromParams.mockReturnValue([null, false]);
    const { history } = renderWithRouter(<BaseCourseSearch {...defaultProps} />);
    expect(history.location.pathname).toEqual(`/${defaultProps.enterpriseSlug}/admin/${ROUTE_NAMES.bulkEnrollment}/`);
  });
});
