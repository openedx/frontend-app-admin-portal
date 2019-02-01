import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import CodeRevokeModal from './index';
import emailTemplate from '../../components/CodeRevokeModal/emailTemplate';

const mockStore = configureMockStore([thunk]);
const initialState = {};
const couponId = 1;
const couponTitle = 'AABBCC';
const data = {
  code: 'ABC101',
  assigned_to: 'edx@example.com',
};
const codeRevokeRequestData = (numCodes) => {
  const assignment = { code: `${data.code}`, email: `${data.assigned_to}` };
  return {
    assignments: Array(numCodes).fill(assignment),
    template: emailTemplate,
  };
};

const CodeRevokeModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <CodeRevokeModal
        couponId={couponId}
        title={couponTitle}
        onClose={() => {}}
        onSuccess={() => {}}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

CodeRevokeModalWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
};

CodeRevokeModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('CodeRevokeModalWrapper', () => {
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders individual assignment revoke modal', () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeRevoke');

    const wrapper = mount(<CodeRevokeModalWrapper data={data} />);
    expect(wrapper.find('.modal-title span').text()).toEqual(couponTitle);
    expect(wrapper.find('.modal-title small').text()).toEqual('Code Revoke');

    expect(wrapper.find('.assignment-details p.code').text()).toEqual(`Code: ${data.code}`);
    expect(wrapper.find('.assignment-details p.email').text()).toEqual(`Email: ${data.assigned_to}`);

    expect(wrapper.find('.modal-body form h3').text()).toEqual('Email Template');
    wrapper.find('.modal-footer .btn-primary').simulate('click');
    expect(spy).toHaveBeenCalledWith(couponId, codeRevokeRequestData(1));

    // TODO! uncomment when https://github.com/erikras/redux-form/issues/621 is resolved
    // expect(wrapper.find('.modal-body form textarea').text()).toEqual(emailTemplate);
  });

  it('renders bulk assignment revoke modal', () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeRevoke');
    const codeRevokeData = [data, data];
    const wrapper = mount(<CodeRevokeModalWrapper
      data={{ ...codeRevokeData, selectedCodes: codeRevokeData }}
      isBulkRevoke
    />);

    expect(wrapper.find('.bulk-selected-codes').text()).toEqual('Selected Codes: 2');
    wrapper.find('.modal-footer .btn-primary').simulate('click');
    expect(spy).toHaveBeenCalledWith(couponId, codeRevokeRequestData(2));
  });

  it('throws error if no code is selected for bulk revoke', () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeRevoke');
    const codeRevokeData = [data, data];
    const wrapper = mount(<CodeRevokeModalWrapper
      data={{ ...codeRevokeData, selectedCodes: [] }}
      isBulkRevoke
    />);

    expect(wrapper.find('.bulk-selected-codes').exists()).toBeFalsy();
    wrapper.find('.modal-footer .btn-primary').simulate('click');
    expect(spy).not.toHaveBeenCalled();
  });
});
