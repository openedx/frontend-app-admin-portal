import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import EnzymeToJson from 'enzyme-to-json';
import { mount } from 'enzyme';

import CodeAssignmentModal from './index';
// import { Form } from 'redux-form';
// import BulkAssignFields from './BulkAssignFields';
// import IndividualAssignFields from './IndividualAssignFields';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  table: {
    'coupon-details': {
      loading: false,
      results: [],
    },
  },
  csv: {
    'coupon-details': {},
  },
});

// const initialModalData = {
//   id: 1,
//   title: 'Test Coupon',
//   start_date: '2018-06-01T12:00:00Z',
//   end_date: '2019-02-01T12:00:00Z',
//   has_error: false,
//   num_unassigned: 0,
//   num_uses: 0,
//   max_uses: 1,
// };

const CodeAssignmentModalWrapper = props => (
  <Provider store={store}>
    <CodeAssignmentModal
      {...props}
    />
  </Provider>
);

describe('<CodeAssignmentModal />', () => {
  let wrapper;

  describe('renders correctly', () => {
    it('with isBulkAssign as true', () => {
      const wrapper = mount((
        <CodeAssignmentModalWrapper
          title="My title"
          onClose={() => {}}
          isBulkAssign
          data={
            {
                unassignedCodes: 3,
            }
          }
        />
      ));
      expect(EnzymeToJson(wrapper)).toMatchSnapshot();
    });

    it('with isBulkAssign as false', () => {
      const wrapper = mount((
        <CodeAssignmentModalWrapper
          title="My title"
          onClose={() => {}}
          isBulkAssign={false}
          data={
            {
                unassignedCodes: 3,
            }
          }
        />
      ));
      expect(EnzymeToJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('submitting', () => {
    const simulateSubmitClick = () => {
      wrapper.find('button').find('.btn-primary').simulate('click');
    };

    it('does not work when invalid is true', () => {
      const mockSubmit = jest.fn();
      wrapper = mount((
        <CodeAssignmentModalWrapper
          submit={mockSubmit}
          invalid
        />
      ));
      simulateSubmitClick();
      expect(mockSubmit).toBeCalledTimes(0);
    });

    it('works when invalid is false', () => {
      const mockSubmit = jest.fn();
      wrapper = mount((
        <CodeAssignmentModalWrapper
          submit={mockSubmit}
          invalid={false}
        />
      ));
      console.log(wrapper);
      simulateSubmitClick();
      expect(mockSubmit).toBeCalledTimes(1);
    });
  });
});
