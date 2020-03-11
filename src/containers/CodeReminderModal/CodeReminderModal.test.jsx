import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import CodeReminderModal from './index';
import EcommerceApiService from '../../data/services/EcommerceApiService';
import remindEmailTemplate from '../../components/CodeReminderModal/emailTemplate';

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
    expect(saveTemplateButton.props().disabled).toEqual(true);
    expect(saveTemplateButton.props().saving).toEqual(false);
    expect(saveTemplateButton.props().templateType).toEqual('remind');
    expect(saveTemplateButton.props().buttonLabel).toEqual('Save Template');
    expect(saveTemplateButton.props().templateData).toEqual(initialState.emailTemplate.remind);
  });
});
