import React from 'react';
import { Provider } from 'react-redux';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import CourseTitleCell from '../CourseTitleCell';
import { renderWithRouter } from '../../test/testUtils';
import DiscoveryApiService from '../../../data/services/DiscoveryApiService';

jest.mock('../../../data/services/DiscoveryApiService', () => ({
  __esModule: true,
  default: {
    fetchCourseDetails: jest.fn(),
  },
}));

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-slug',
  },
});

const defaultProps = {
  row: {
    original: {
      courseTitle: 'edX Demonstration Course',
      courseId: 'edX+DemoX',
    },
  },
};

describe('CourseTitleCell', () => {
  test('renders', async () => {
    const mockCourseDetails = { shortDescription: 'Test short description' };
    const mockPromiseResolve = Promise.resolve({ data: mockCourseDetails });
    DiscoveryApiService.fetchCourseDetails.mockReturnValue(mockPromiseResolve);
    const Component = (
      <Provider store={store}>
        <CourseTitleCell {...defaultProps} />
      </Provider>
    );
    renderWithRouter(Component);
    userEvent.click(screen.getByText(defaultProps.row.original.courseTitle));
    expect(screen.getByText('Loading course details...'));
    await waitFor(() => {
      screen.getByText(mockCourseDetails.shortDescription);
      screen.getByText('Learn more about this course');
      screen.getByText('in a new tab');
    });
  });
});
