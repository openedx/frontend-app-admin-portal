import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import EnrollmentsTable from './index';


const mockStore = configureMockStore([thunk]);

class ContextProvider extends React.Component {
  static childContextTypes = {
    store: PropTypes.object.isRequired,
  }

  getChildContext = () => ({
    store: mockStore({
      paginateTable: () => {},
      sortTable: () => {},
      portalConfiguration: {
        enterpriseId: 'test-enterprise-id',
      },
      table: {
        enrollments: {
          data: {
            results: [],
            current_page: 1,
            num_pages: 1,
          },
          ordering: null,
          loading: false,
          error: null,
        },
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

const EnrollmentsWrapper = props => (
  <ContextProvider>
    <EnrollmentsTable
      {...props}
    />
  </ContextProvider>
);

describe('<EnrollmentsTable />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <EnrollmentsWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  // TODO: additional tests or snapshots for other states (mulitple pages, loading states, ..)
});
