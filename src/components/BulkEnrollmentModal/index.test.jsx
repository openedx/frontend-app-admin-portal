import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { SearchContext } from '@edx/frontend-enterprise';
import BulkEnrollmentModal from '../../containers/BulkEnrollmentModal';

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';
const refinementsFromQueryParams = {};

const defaultProps = {
  enterpriseUuid: enterpriseId,
  open: true,
  setEnrolledLearners: jest.fn(),
  onSuccess: jest.fn(),
  onClose: jest.fn(),
};

// eslint-disable-next-line react/prop-types
const BulkEnrollmentModalWrapper = ({ value = { refinementsFromQueryParams }, props = defaultProps }) => (
  <Provider store={mockStore()}>
    <SearchContext.Provider value={value}>
      <BulkEnrollmentModal {...props} />
    </SearchContext.Provider>
  </Provider>
);

describe('<BulkEnrollmentModal />', () => {
  test('renders Bulk Enrollment Modal', () => {
    render(<BulkEnrollmentModalWrapper />);
    // Verify all expected fields are present.
    screen.getByLabelText('Email addresses');
    screen.getByLabelText('Upload email addresses');
  });

  test('submit displays learner error alert if learners do not have valid subscriptions', () => {
    render(<BulkEnrollmentModalWrapper props={{ ...defaultProps, failedLearners: ['bobby@test.com', 'billiam@test.com'] }} />);
    fireEvent.click(screen.getByText('Enroll Learners', { selector: 'button' }));
    expect(screen.getByRole('alert')).toHaveTextContent('bobby@test.com');
    expect(screen.getByRole('alert')).toHaveTextContent('billiam@test.com');
  });
});
