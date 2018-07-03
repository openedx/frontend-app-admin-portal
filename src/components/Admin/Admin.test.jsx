import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Admin from './index';

const mockStore = configureMockStore([thunk]);

class ContextProvider extends React.Component {
  static childContextTypes = {
    store: PropTypes.object.isRequired,
    courseEnrollments: PropTypes.shape({
      enrollments: PropTypes.object,
    }),
  }

  getChildContext = () => ({
    store: mockStore({
      courseEnrollments: {
        enrollments: {},
      },
    }),
  })

  render() {
    return this.props.children;
  }
}

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const AdminWrapper = props => (
  <MemoryRouter>
    <ContextProvider>
      <Admin
        getDashboardAnalytics={() => {}}
        {...props}
      />
    </ContextProvider>
  </MemoryRouter>
);

describe('<Admin />', () => {
  describe('renders correctly', () => {
    it('calls getDashboardAnalytics prop', () => {
      const mockGetDashboardAnalytics = jest.fn();
      const tree = renderer
        .create((
          AdminWrapper({
            getDashboardAnalytics: mockGetDashboardAnalytics,
          })
        ))
        .toJSON();
      expect(mockGetDashboardAnalytics).toHaveBeenCalled();
      expect(tree).toMatchSnapshot();
    });

    it('with dashboard analytics data', () => {
      const tree = renderer
        .create((
          AdminWrapper({
            activeLearners: {
              past_week: 1,
              past_month: 1,
            },
            enrolledLearners: 1,
            courseCompletions: 1,
          })
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with error state', () => {
      const tree = renderer
        .create((
          AdminWrapper({
            error: Error('Network Error'),
          })
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with loading state', () => {
      const tree = renderer
        .create((
          AdminWrapper({
            loading: true,
          })
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
