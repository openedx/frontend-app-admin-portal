import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import { ADD_COURSES_TITLE, WARNING_ALERT_TITLE_TEXT } from './constants';
import BulkEnrollContextProvider from '../BulkEnrollmentContext';
import { TABLE_HEADERS } from '../CourseSearchResults';

import '../../../../__mocks__/react-instantsearch-dom';
import AddCoursesStep from './AddCoursesStep';
import { renderWithRouter } from '../../test/testUtils';

const defaultProps = {
  subscriptionUUID: 'fakest-uuid',
  enterpriseSlug: 'sluggy',
  subscription: { uuid: 'foo', enterpriseCatalogUuid: 'bar' },
  enterpriseId: 'fancyEnt',
  selectedCoursesNum: 8,
};

const StepperWrapper = (props) => (
  <BulkEnrollContextProvider>
    <AddCoursesStep {...props} />
  </BulkEnrollContextProvider>
);

describe('AddCoursesStep', () => {
  it('displays a title', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(ADD_COURSES_TITLE)).toBeInTheDocument();
  });
  it('displays a table', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(TABLE_HEADERS.courseName)).toBeInTheDocument();
    expect(screen.getByText(TABLE_HEADERS.courseAvailability)).toBeInTheDocument();
  });
  it('displays that warning dialog text', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(WARNING_ALERT_TITLE_TEXT)).toBeInTheDocument();
  });
});
