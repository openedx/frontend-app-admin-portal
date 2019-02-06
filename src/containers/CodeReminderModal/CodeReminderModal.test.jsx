import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import CodeReminderModal from './index';

const mockStore = configureMockStore([thunk]);
const initialState = {};

const CodeReminderModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <CodeReminderModal
        title="AABBCC"
        onClose={() => {}}
        onSuccess={() => {}}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

CodeReminderModalWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
};

CodeReminderModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('CodeReminderModalWrapper', () => {
  it('renders individual assignment reminder modal', () => {
    const wrapper = mount(<CodeReminderModalWrapper />);
    expect(wrapper.find('.assignment-detail').find('p')).toBeTruthy();
  });

  it('renders bulk assignment reminder modal', () => {
    const wrapper = mount(<CodeReminderModalWrapper isBulkRemind />);
    expect(wrapper.find('#email-template')).toBeTruthy();
  });
});
