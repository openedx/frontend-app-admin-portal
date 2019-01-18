import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import CodeAssignmentModal from './index';

const mockStore = configureMockStore([thunk]);
const initialState = {};

const CodeAssignmentModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <CodeAssignmentModal
        title="AABBCC"
        onClose={() => {}}
        onSuccess={() => {}}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

CodeAssignmentModalWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
};

CodeAssignmentModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('CodeAssignmentModalWrapper', () => {
  it('renders individual assignment modal', () => {
    const wrapper = mount(<CodeAssignmentModalWrapper />);
    expect(wrapper.find('IndividualAssignFields')).toHaveLength(1);
  });

  it('renders bulk assignment modal', () => {
    const wrapper = mount(<CodeAssignmentModalWrapper isBulkAssign />);
    expect(wrapper.find('BulkAssignFields')).toHaveLength(1);
  });
});
