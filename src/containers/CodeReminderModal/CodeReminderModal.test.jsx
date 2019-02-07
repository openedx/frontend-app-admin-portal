import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import CodeReminderModal from './index';
import EcommerceApiService from '../../data/services/EcommerceApiService';
import emailTemplate from '../../components/CodeReminderModal/emailTemplate';

const mockStore = configureMockStore([thunk]);
const initialState = {};
const couponId = 1;
const data = {
  code: 'ABC101',
  assigned_to: 'edx@example.com',
};

const codeReminderRequestData = (numCodes) => {
  const assignment = { code: `${data.code}`, email: `${data.assigned_to}` };
  return {
    assignments: Array(numCodes).fill(assignment),
    template: emailTemplate,
  };
};

const CodeReminderModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <CodeReminderModal
        couponId={couponId}
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
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders individual reminder modal', () => {
    const wrapper = mount(<CodeReminderModalWrapper />);
    expect(wrapper.find('.assignment-detail').find('p')).toBeTruthy();
  });

  it('renders bulk reminder modal', () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeReminder');
    const codeRemindData = [data, data];
    const wrapper = mount(<CodeReminderModalWrapper
      data={{ ...codeRemindData, selectedCodes: codeRemindData }}
      isBulkRemind
    />);

    expect(wrapper.find('.bulk-selected-codes').text()).toEqual('Selected Codes: 2');
    expect(wrapper.find('#email-template')).toBeTruthy();
    wrapper.find('.modal-footer .btn-primary').simulate('click');
    expect(spy).toHaveBeenCalledWith(couponId, codeReminderRequestData(2));
  });

  it('throws error if no code is selected for bulk remind', () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeReminder');
    const codeReminderData = [data, data];
    const wrapper = mount(<CodeReminderModalWrapper
      data={{ ...codeReminderData, selectedCodes: [] }}
      isBulkRemind
    />);

    expect(wrapper.find('.bulk-selected-codes').exists()).toBeFalsy();
    wrapper.find('.modal-footer .btn-primary').simulate('click');
    expect(spy).not.toHaveBeenCalled();
  });
});
