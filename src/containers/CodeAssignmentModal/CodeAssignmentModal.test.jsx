import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent, render, screen } from '@testing-library/react';
import last from 'lodash/last';
import { IntlProvider } from '@edx/frontend-platform/i18n';

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
        'email-template-files': assignEmailTemplate.files,
      },
    },
    assign: {
      'email-address': '',
      'email-template-subject': assignEmailTemplate.subject,
      'email-template-greeting': assignEmailTemplate.greeting,
      'email-template-body': assignEmailTemplate.body,
      'email-template-closing': assignEmailTemplate.closing,
      'email-template-files': assignEmailTemplate.files,
    },
  },
};

const CodeAssignmentModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <IntlProvider locale="en">
        <CodeAssignmentModal
          couponId={1}
          title="AABBCC"
          onClose={() => {}}
          onSuccess={() => {}}
          {...props}
        />
      </IntlProvider>
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
    render(<CodeAssignmentModalWrapper />);
    expect(screen.getAllByTestId('individual-assign-fields')).toHaveLength(1);
  });

  it('renders bulk assignment modal', () => {
    render(<CodeAssignmentModalWrapper isBulkAssign />);
    expect(screen.getAllByTestId('bulk-assign-fields')).toHaveLength(1);
  });

  it('renders <SaveTemplateButton />', () => {
    render(<CodeAssignmentModalWrapper />);
    expect(screen.getAllByText('Save Template')).toHaveLength(1);
  });

  it('renders <TemplateSourceFields /> with source new_email', () => {
    render(<CodeAssignmentModalWrapper />);

    expect(screen.getAllByText('New Email')[0].getAttribute('aria-pressed')).toEqual('true');
    expect(screen.getAllByText('From Template')[0].getAttribute('aria-pressed')).toEqual('false');
    expect(screen.getAllByText('New Email')[0].getAttribute('style')).toEqual('pointer-events: none;');
    expect(screen.getAllByText('From Template')[0].getAttribute('style')).toEqual('pointer-events: auto;');
    expect(screen.getAllByRole('textbox', { name: /Template Name/i })).toHaveLength(1);

    fireEvent.click(screen.getAllByText('From Template')[0]);
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
    render(<CodeAssignmentModalWrapper store={newStore} />);

    expect(screen.getAllByText('New Email')[0].getAttribute('aria-pressed')).toEqual('false');
    expect(screen.getAllByText('From Template')[0].getAttribute('aria-pressed')).toEqual('true');
    expect(screen.getAllByText('New Email')[0].getAttribute('style')).toEqual('pointer-events: auto;');
    expect(screen.getAllByText('From Template')[0].getAttribute('style')).toEqual('pointer-events: none;');
    expect(screen.getAllByRole('combobox', { name: /Template Name/i })).toHaveLength(1);

    fireEvent.click(screen.getAllByText('New Email')[0]);
    expect(last(newStore.getActions())).toEqual({
      type: SET_EMAIL_TEMPLATE_SOURCE,
      payload: { emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL },
    });
  });
});
