import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';

import ManageRequestsTab from '../ManageRequestsTab';
import { useSubsidyRequests } from '../../SubsidyRequestManagementTable';

jest.mock('../../SubsidyRequestManagementTable', () => {
  const originalModule = jest.requireActual('../../SubsidyRequestManagementTable');
  return {
    __esModule: true, // this property makes it work
    ...originalModule,
    /* eslint-disable react/prop-types */
    default: ({
      children,
      isLoading,
      data,
      itemCount,
      pageCount,
      fetchData,
      requestStatusFilterChoices,
      onApprove,
      onDecline,
      initialTableOptions,
      initialState,
    }) => {
      const hasInitialTableOptions = !!initialTableOptions?.getRowId({ uuid: 'test-uuid-1' });
      return (
        <>
          <h2>SubsidyRequestManagementTable</h2>
          {isLoading !== undefined && <span>has isLoading</span>}
          {!!data && <span>has data</span>}
          {itemCount !== undefined && <span>has itemCount</span>}
          {pageCount !== undefined && <span>has pageCount</span>}
          {!!fetchData && <span>has fetchData</span>}
          {!!requestStatusFilterChoices && <span>has requestStatusFilterChoices</span>}
          {!!onApprove && <span>has onApprove</span>}
          {!!onDecline && <span>has onDecline</span>}
          {!!hasInitialTableOptions && <span>has initialTableOptions</span>}
          {!!initialState && <span>has initialState</span>}
          {!!children && <span>has children</span>}
        </>
      );
    },
    /* eslint-enable react/prop-types */
    useSubsidyRequests: jest.fn(),
  };
});

const enterpriseId = 'test-enterprise';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const store = getMockStore({ ...initialStore });

const ManageRequestsTabWithRouter = ({
  store: storeProp,
}) => (
  <Provider store={storeProp}>
    <ManageRequestsTab />
  </Provider>
);

ManageRequestsTabWithRouter.propTypes = {
  store: PropTypes.shape(),
};

ManageRequestsTabWithRouter.defaultProps = {
  store,
};

describe('<ManageRequestsTab />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders SubsidyRequestManagementTable with expected props', () => {
    useSubsidyRequests.mockImplementation(() => ({
      isLoading: true,
      requests: {
        pageCount: 0,
        itemCount: 0,
        requests: [],
      },
      requestsOverview: [],
      handleFetchRequests: jest.fn(),
    }));
    render(<ManageRequestsTabWithRouter />);
    const expectedProps = [
      'isLoading',
      'data',
      'itemCount',
      'pageCount',
      'fetchData',
      'requestStatusFilterChoices',
      'onApprove',
      'onDecline',
      'initialTableOptions',
      'initialState',
    ];
    expectedProps.forEach((prop) => {
      expect(screen.getByText(`has ${prop}`));
    });
    expect(screen.queryByText('has children')).toBeFalsy();
  });
});
