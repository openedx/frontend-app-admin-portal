import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import last from 'lodash/last';

import CodeAssignmentModal from './index';
import assignEmailTemplate from '../../components/CodeAssignmentModal/emailTemplate';
import {
  SET_EMAIL_TEMPLATE_SOURCE,
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
  EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE,
} from '../../data/constants/emailTemplate';

const mockStore = configureMockStore([thunk]);
const initialState = {
  table: {
    'coupon-details': {
      data: {
        count: 0,
        results: [],

      },
    },
  },
  form: {
    'code-assignment-modal-form': {
      values: {
        'email-address': 'test@edx.org',
      },
    },
  },
  portalConfiguration: {
    enterpriseSlug: 'bearsRus',
    enableLearnerPortal: true,
    enterpriseId: 'bestId',
  },
  emailTemplate: {
    saving: false,
    loading: false,
    error: null,
    emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
    default: {
      assign: {
        'email-address': '',
        'email-template-subject': assignEmailTemplate.subject,
        'email-template-greeting': assignEmailTemplate.greeting,
        'email-template-body': assignEmailTemplate.body,
        'email-template-closing': assignEmailTemplate.closing,
      },
    },
    assign: {
      'email-address': '',
      'email-template-subject': assignEmailTemplate.subject,
      'email-template-greeting': assignEmailTemplate.greeting,
      'email-template-body': assignEmailTemplate.body,
      'email-template-closing': assignEmailTemplate.closing,
    },
  },
};

const CodeAssignmentModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <CodeAssignmentModal
        couponId={1}
        title="AABBCC"
        onClose={() => {}}
        onSuccess={() => {}}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

const store = mockStore({ ...initialState });

CodeAssignmentModalWrapper.defaultProps = {
  store,
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

  it('renders <SaveTemplateButton />', () => {
    const wrapper = mount(<CodeAssignmentModalWrapper />);
    const saveTemplateButton = wrapper.find('SaveTemplateButton');
    expect(saveTemplateButton).toHaveLength(1);
    expect(saveTemplateButton.props().templateType).toEqual('assign');
  });

  it('renders <TemplateSourceFields /> with source new_email', () => {
    const wrapper = mount(<CodeAssignmentModalWrapper />);
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
    const wrapper = mount(<CodeAssignmentModalWrapper store={newStore} />);
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
