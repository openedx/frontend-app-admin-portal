import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Admin from './index';

const mockStore = configureMockStore([thunk]);

class ContextProvider extends React.Component {
  static childContextTypes = {
    store: PropTypes.object.isRequired,
  }

  getChildContext = () => ({
    store: mockStore({
      portalConfiguration: {
        enterpriseId: 'test-enterprise-id',
      },
      courseEnrollments: {
        enrollments: null,
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
        downloadCsv={() => {}}
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
          <AdminWrapper
            getDashboardAnalytics={mockGetDashboardAnalytics}
            enterpriseId="test-enterprise-id"
          />
        ))
        .toJSON();
      expect(mockGetDashboardAnalytics).toHaveBeenCalled();
      expect(tree).toMatchSnapshot();
    });

    it('with dashboard analytics data', () => {
      const tree = renderer
        .create((
          <AdminWrapper
            activeLearners={{
              past_week: 1,
              past_month: 1,
            }}
            enrolledLearners={1}
            courseCompletions={1}
            lastUpdatedDate="2018-07-31T23:14:35Z"
            numberOfUsers={3}
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with error state', () => {
      const tree = renderer
        .create((
          <AdminWrapper error={Error('Network Error')} />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with loading state', () => {
      const tree = renderer
        .create((
          <AdminWrapper loading />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('handle changes to enterpriseId prop', () => {
    it('handles non-empty change in enterpriseId prop', () => {
      const mockGetDashboardAnalytics = jest.fn();
      const wrapper = mount((
        <AdminWrapper
          getDashboardAnalytics={mockGetDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />
      ));

      wrapper.setProps({
        enterpriseId: 'test-enterprise-id-2',
      });

      expect(wrapper.prop('enterpriseId')).toEqual('test-enterprise-id-2');
      expect(mockGetDashboardAnalytics).toBeCalled();
    });

    it('handles empty change in enterpriseId prop', () => {
      const mockGetDashboardAnalytics = jest.fn();
      const wrapper = mount((
        <AdminWrapper
          getDashboardAnalytics={mockGetDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />
      ));

      wrapper.setProps({
        enterpriseId: null,
      });

      expect(wrapper.prop('enterpriseId')).toEqual(null);
      expect(mockGetDashboardAnalytics).toBeCalled();
    });
  });
});
