import React from 'react';
import { Provider } from 'react-redux';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { IntlProvider } from '@edx/frontend-platform/i18n';
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
    const user = userEvent.setup();
    const mockCourseDetails = { shortDescription: 'Test short description' };
    const mockPromiseResolve = Promise.resolve({ data: mockCourseDetails });
    DiscoveryApiService.fetchCourseDetails.mockReturnValue(mockPromiseResolve);
    const Component = (
      <IntlProvider locale="en">
        <Provider store={store}>
          <CourseTitleCell {...defaultProps} />
        </Provider>
      </IntlProvider>
    );
    renderWithRouter(Component);
    await user.click(screen.getByText(defaultProps.row.original.courseTitle));
    await waitFor(() => {
      screen.getByText(mockCourseDetails.shortDescription);
      screen.getByText('Learn more about this course');
      screen.getByText('in a new tab');
    });
  });
});
