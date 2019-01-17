import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import AssignmentReminderModal from './index';

const mockStore = configureMockStore([thunk]);
const initialState = {};

const AssignmentReminderModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <AssignmentReminderModal
        title="AABBCC"
        onClose={() => {}}
        onSuccess={() => {}}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

AssignmentReminderModalWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
};

AssignmentReminderModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('AssignmentReminderModalWrapper', () => {
  it('renders individual assignment reminder modal', () => {
    const wrapper = mount(<AssignmentReminderModalWrapper />);
    expect(wrapper.find('.assignment-detail').find('p')).toBeTruthy();
  });

  it('renders bulk assignment reminder modal', () => {
    const wrapper = mount(<AssignmentReminderModalWrapper isBulkAssign />);
    expect(wrapper.find('#email-template')).toBeTruthy();
  });
});
