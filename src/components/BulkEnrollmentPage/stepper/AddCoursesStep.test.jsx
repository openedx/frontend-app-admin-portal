import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import { ADD_COURSES_TITLE } from './constants';
import BulkEnrollContextProvider from '../BulkEnrollmentContext';
import { TABLE_HEADERS } from '../CourseSearchResults';

import '../../../../__mocks__/react-instantsearch-dom';
import AddCoursesStep from './AddCoursesStep';

const defaultProps = {
  isOpen: true,
  close: jest.fn(),
  subscriptionUUID: 'fakest-uuid',
};

const StepperWrapper = (props) => (
  <BulkEnrollContextProvider>
    <AddCoursesStep {...props} />
  </BulkEnrollContextProvider>
);

describe('AddCoursesStep', () => {
  it('displays a title', () => {
    render(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(ADD_COURSES_TITLE)).toBeInTheDocument();
  });
  it('displays a table', () => {
    render(<StepperWrapper {...defaultProps} />);
    Object.values(TABLE_HEADERS).forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });
});
