import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import last from 'lodash/last';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import CodeRevokeModal from './index';
import revokeEmailTemplate from '../../components/CodeRevokeModal/emailTemplate';
import {
  SET_EMAIL_TEMPLATE_SOURCE,
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
  EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE,
} from '../../data/constants/emailTemplate';
import LmsApiService from '../../data/services/LmsApiService';

jest.mock('../../data/services/LmsApiService');

const mockStore = configureMockStore([thunk]);
const initialState = {
  emailTemplate: {
    loading: false,
    error: null,
    emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
    default: {
      revoke: {
        'email-template-subject': revokeEmailTemplate.subject,
        'email-template-greeting': revokeEmailTemplate.greeting || '',
        'email-template-body': revokeEmailTemplate.body,
        'email-template-closing': revokeEmailTemplate.closing,
      },
    },
    revoke: {
      'email-template-subject': revokeEmailTemplate.subject,
      'email-template-greeting': revokeEmailTemplate.greeting || '',
      'email-template-body': revokeEmailTemplate.body,
      'email-template-closing': revokeEmailTemplate.closing,
    },
  },
};

const couponId = 1;
const couponTitle = 'AABBCC';
const data = {
  code: 'ABC101',
  assigned_to: 'edx@example.com',
};
const usersResponse = {
  data: [{ email: 'edx@example.com', id: 1, username: 'edx' }],
};
const codeRevokeRequestData = (numCodes) => {
  const assignment = {
    code: data.code,
    user: {
      email: data.assigned_to,
      lms_user_id: usersResponse.data[0].id,
      username: usersResponse.data[0].username,
    },
  };
  return {
    assignments: Array(numCodes).fill(assignment),
    do_not_email: false,
    template: revokeEmailTemplate.body,
    template_subject: revokeEmailTemplate.subject,
    template_greeting: revokeEmailTemplate.greeting || '',
    template_closing: revokeEmailTemplate.closing,
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

const store = mockStore({ ...initialState });
CodeRevokeModalWrapper.defaultProps = {
  store,
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

  it('renders individual assignment revoke modal', async () => {
    const flushPromises = () => new Promise(setImmediate);
    spy = jest.spyOn(EcommerceApiService, 'sendCodeRevoke');
    const mockPromiseResolve = () => Promise.resolve(usersResponse);
    LmsApiService.fetchUserDetailsFromEmail.mockImplementation(mockPromiseResolve);

    const wrapper = mount(<CodeRevokeModalWrapper data={data} />);
    expect(wrapper.find('.modal-title').text()).toEqual(couponTitle);

    expect(wrapper.find('.assignment-details p.code').text()).toEqual(`Code: ${data.code}`);
    expect(wrapper.find('.assignment-details p.email').text()).toEqual(`Email: ${data.assigned_to}`);

    expect(wrapper.find('.modal-body form h3').text()).toEqual('Email Template');
    wrapper.find('.modal-footer .code-revoke-save-btn .btn-primary').hostNodes().simulate('click');
    await flushPromises();
    expect(spy).toHaveBeenCalledWith(couponId, codeRevokeRequestData(1));
  });

  it('renders bulk assignment revoke modal', async () => {
    const flushPromises = () => new Promise(setImmediate);
    spy = jest.spyOn(EcommerceApiService, 'sendCodeRevoke');
    const mockPromiseResolve = () => Promise.resolve(usersResponse);
    LmsApiService.fetchUserDetailsFromEmail.mockImplementation(mockPromiseResolve);
    const codeRevokeData = [data, data];
    const wrapper = mount(<CodeRevokeModalWrapper
      data={{ ...codeRevokeData, selectedCodes: codeRevokeData }}
      isBulkRevoke
    />);

    expect(wrapper.find('.bulk-selected-codes').text()).toEqual('Selected codes: 2');
    wrapper.find('.modal-footer .code-revoke-save-btn .btn-primary').hostNodes().simulate('click');
    await flushPromises();
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
    wrapper.find('.modal-footer .code-revoke-save-btn .btn-primary').hostNodes().simulate('click');
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders <SaveTemplateButton />', () => {
    const wrapper = mount(<CodeRevokeModalWrapper />);
    const saveTemplateButton = wrapper.find('SaveTemplateButton');
    expect(saveTemplateButton).toHaveLength(1);
    expect(saveTemplateButton.props().templateType).toEqual('revoke');
  });

  it('renders <TemplateSourceFields /> with source new_email', () => {
    const wrapper = mount(<CodeRevokeModalWrapper />);
    const TemplateSourceFields = wrapper.find('TemplateSourceFields');
    expect(TemplateSourceFields).toHaveLength(1);

    expect(TemplateSourceFields.find('button#btn-new-email-template').prop('aria-pressed')).toEqual('true');
    expect(TemplateSourceFields.find('button#btn-old-email-template').prop('aria-pressed')).toEqual('false');
    expect(TemplateSourceFields.find('button#btn-new-email-template').prop('style')).toEqual({ pointerEvents: 'none' });
    expect(TemplateSourceFields.find('button#btn-old-email-template').prop('style')).toEqual({ pointerEvents: 'auto' });
    expect(TemplateSourceFields.find('input[name="template-name"]')).toHaveLength(1);

    TemplateSourceFields.find('button#btn-old-email-template').simulate('click');
    expect(last(store.getActions())).toEqual({
      type: SET_EMAIL_TEMPLATE_SOURCE,
      payload: { emailTemplateSource: EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE },
    });
  });

  it('renders <TemplateSourceFields /> with source from_template', () => {
    const newStore = mockStore({
      ...initialState,
      emailTemplate: {
        ...initialState.emailTemplate,
        emailTemplateSource: EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE,
      },
    });
    const wrapper = mount(<CodeRevokeModalWrapper store={newStore} />);
    const TemplateSourceFields = wrapper.find('TemplateSourceFields');
    expect(TemplateSourceFields).toHaveLength(1);

    expect(TemplateSourceFields.find('button#btn-new-email-template').prop('aria-pressed')).toEqual('false');
    expect(TemplateSourceFields.find('button#btn-old-email-template').prop('aria-pressed')).toEqual('true');
    expect(TemplateSourceFields.find('button#btn-new-email-template').prop('style')).toEqual({ pointerEvents: 'auto' });
    expect(TemplateSourceFields.find('button#btn-old-email-template').prop('style')).toEqual({ pointerEvents: 'none' });
    expect(TemplateSourceFields.find('select[name="template-name-select"]')).toHaveLength(1);

    TemplateSourceFields.find('button#btn-new-email-template').simulate('click');
    expect(last(newStore.getActions())).toEqual({
      type: SET_EMAIL_TEMPLATE_SOURCE,
      payload: { emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL },
    });
  });
});
