import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import last from 'lodash/last';

import CodeReminderModal from './index';
import EcommerceApiService from '../../data/services/EcommerceApiService';
import remindEmailTemplate from '../../components/CodeReminderModal/emailTemplate';
import {
  SET_EMAIL_TEMPLATE_SOURCE,
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
  EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE,
} from '../../data/constants/emailTemplate';

const sampleCodeData = {
  code: 'test-code-1',
  assigned_to: 'test@bestrun.com',
  redemptions: {
    total: 100,
    used: 10,
  },
  error: null,
};
const sampleTableData = {
  loading: false,
  error: null,
  data: {
    count: 3,
    num_pages: 2,
    current_page: 1,
    results: [
      sampleCodeData,
      {
        ...sampleCodeData,
        code: 'test-code-2',
        redemptions: {
          total: 100,
          used: 100,
        },
      },
      {
        ...sampleCodeData,
        code: 'test-code-3',
        assigned_to: null,
      },
    ],
  },
};

const mockStore = configureMockStore([thunk]);
const initialState = {
  table: {
    'coupon-details': sampleTableData,
  },
  emailTemplate: {
    loading: false,
    error: null,
    emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
    default: {
      remind: {
        'email-template-greeting': remindEmailTemplate.greeting,
        'email-template-body': remindEmailTemplate.body,
        'email-template-closing': remindEmailTemplate.closing,
      },
    },
    remind: {
      'email-template-greeting': remindEmailTemplate.greeting,
      'email-template-body': remindEmailTemplate.body,
      'email-template-closing': remindEmailTemplate.closing,
    },
  },
};

const couponId = 1;
const data = {
  code: 'ABC101',
  assigned_to: 'edx@example.com',
};

const codeReminderRequestData = (numCodes, selectedToggle) => {
  const assignment = { code: `${data.code}`, email: `${data.assigned_to}` };
  const options = {
    template: remindEmailTemplate.body,
    template_greeting: remindEmailTemplate.greeting,
    template_closing: remindEmailTemplate.closing,
  };
  if (numCodes === 0) {
    options.code_filter = selectedToggle;
  } else {
    options.assignments = Array(numCodes).fill(assignment);
  }
  return options;
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

const store = mockStore({ ...initialState });
CodeReminderModalWrapper.defaultProps = {
  store,
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
    const codeRemindData = [data, data];
    const wrapper = mount(<CodeReminderModalWrapper
      data={{ ...codeRemindData, selectedCodes: [data] }}
    />);
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
    wrapper.find('.modal-footer .btn-primary .code-remind-save-btn').hostNodes().simulate('click');
    expect(spy).toHaveBeenCalledWith(couponId, codeReminderRequestData(2));
  });

  it('renders remind all modal if no code is selected for bulk remind', () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeReminder');
    const codeReminderData = [data, data];
    const selectedToggle = 'unredeemed';
    const wrapper = mount(<CodeReminderModalWrapper
      data={{ ...codeReminderData, selectedCodes: [] }}
      selectedToggle={selectedToggle}
      isBulkRemind
    />);

    expect(wrapper.find('.bulk-selected-codes').text()).toEqual('Selected Codes: 3');
    wrapper.find('.modal-footer .btn-primary .code-remind-save-btn').hostNodes().simulate('click');
    expect(spy).toHaveBeenCalledWith(couponId, codeReminderRequestData(0, selectedToggle));
  });

  it('renders <SaveTemplateButton />', () => {
    const wrapper = mount(<CodeReminderModalWrapper />);
    const saveTemplateButton = wrapper.find('SaveTemplateButton');
    expect(saveTemplateButton).toHaveLength(1);
    expect(saveTemplateButton.props().disabled).toEqual(false);
    expect(saveTemplateButton.props().saving).toEqual(false);
    expect(saveTemplateButton.props().templateType).toEqual('remind');
    expect(saveTemplateButton.props().buttonLabel).toEqual('Save Template');
  });

  it('renders <TemplateSourceFields /> with source new_email', () => {
    const wrapper = mount(<CodeReminderModalWrapper />);
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
    const wrapper = mount(<CodeReminderModalWrapper store={newStore} />);
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
